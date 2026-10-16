import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import { isDbConnected } from '../config/db.js'
import Category from '../models/Category.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesDir = path.resolve(__dirname, '../../public/images')
const productImageRoute = '/api/products/images/'
const LEGACY_IMAGE_REGEX = /^\/images\/[a-z0-9-]+-\d+\.(png|jpe?g|webp)$/i
const LEGACY_IMAGE_MONGO_PATTERN = '^/images/[a-z0-9-]+-\\d+\\.(png|jpe?g|webp)$'

function gridFsImagePath(fileId) {
  return `${productImageRoute}${fileId}`
}

function serializeProduct(product, req) {
  const result = product.toObject ? product.toObject() : { ...product }
  const publicUrl = (image) => image?.startsWith(productImageRoute)
    ? `${req.protocol}://${req.get('host')}${image}`
    : image

  result.image = publicUrl(result.image)
  result.images = (result.images || []).map(publicUrl)
  return result
}

function getProductImageBucket() {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB is not connected; product images cannot be stored')
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'productImages' })
}

function getImageContentType(imageData) {
  const match = imageData.match(/^data:(image\/(?:png|jpe?g|webp));base64,/i)
  if (!match) throw new Error('Product image must be a PNG, JPEG, or WebP data URL')
  const type = match[1].toLowerCase()
  return type === 'image/jpg' ? 'image/jpeg' : type
}

function getImageExtension(contentType) {
  return contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1]
}

function getContentTypeFromFilename(filename) {
  const ext = path.extname(filename).slice(1).toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  return 'image/png'
}

async function uploadImageBuffer(buffer, filename, contentType) {
  const uploadStream = getProductImageBucket().openUploadStream(filename, {
    metadata: { contentType }
  })

  await new Promise((resolve, reject) => {
    uploadStream.once('error', reject)
    uploadStream.once('finish', resolve)
    uploadStream.end(buffer)
  })

  return uploadStream.id.toString()
}

async function deleteStoredImage(imageUrl) {
  const match = String(imageUrl || '').match(/\/api\/products\/images\/([a-f\d]{24})(?:$|[?#])/i)
  if (match) {
    await getProductImageBucket().delete(new mongoose.Types.ObjectId(match[1]))
  }
}

async function deleteImageIfUnreferenced(imageUrl) {
  const stillReferenced = await Product.exists({
    $or: [{ image: imageUrl }, { images: imageUrl }]
  })
  if (!stillReferenced) await deleteStoredImage(imageUrl)
}

function createImageUploadContext() {
  const uploadedIds = []
  const imageUrls = new Map()

  return {
    uploadedIds,
    async store(imageData, name) {
      if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
        const storedImage = String(imageData || '').match(/\/api\/products\/images\/([a-f\d]{24})(?:$|[?#])/i)
        if (storedImage) return gridFsImagePath(storedImage[1])
        return imageData || ''
      }
      if (imageUrls.has(imageData)) return imageUrls.get(imageData)

      const contentType = getImageContentType(imageData)
      const base64 = imageData.slice(imageData.indexOf(',') + 1)
      const buffer = Buffer.from(base64, 'base64')
      if (buffer.length === 0) throw new Error('Product image is empty or invalid')

      const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
      const ext = getImageExtension(contentType)
      const fileId = await uploadImageBuffer(buffer, `${safeName}-${Date.now()}.${ext}`, contentType)
      uploadedIds.push(fileId)
      const imageUrl = gridFsImagePath(fileId)
      imageUrls.set(imageData, imageUrl)
      console.log(`📸 [Image Saved]: Stored new product ${ext.toUpperCase()} image in GridFS (${fileId})`)
      return imageUrl
    }
  }
}

// ฟีเจอร์เดิมจาก add-product: เก็บ export ชื่อเดิมไว้ แต่ตอนนี้เก็บลง GridFS
// หมายเหตุ: เป็น async แล้ว ถ้ามีไฟล์อื่นเรียกใช้ต้องใส่ await
export const processProductImage = async (imageData, nameSlug = 'product') => {
  if (!imageData || typeof imageData !== 'string') return ''
  try {
    return await createImageUploadContext().store(imageData, nameSlug)
  } catch (err) {
    console.error('Failed to save product image:', err)
    return imageData
  }
}

async function cleanupUploadedImages(fileIds) {
  const results = await Promise.allSettled(
    fileIds.map(fileId => getProductImageBucket().delete(new mongoose.Types.ObjectId(fileId)))
  )
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Failed to clean up an unreferenced GridFS product image:', result.reason)
    }
  }
}

export async function migrateLegacyProductImagesToGridFS() {
  await fs.mkdir(imagesDir, { recursive: true })

  const products = await Product.find({
    $or: [
      { image: { $regex: LEGACY_IMAGE_MONGO_PATTERN, $options: 'i' } },
      { images: { $regex: LEGACY_IMAGE_MONGO_PATTERN, $options: 'i' } }
    ]
  })
  const migratedFiles = new Set()
  let migratedProducts = 0

  for (const product of products) {
    const uploadedIds = []
    const migratedImageUrls = new Map()
    const migrateReference = async (imageUrl) => {
      if (typeof imageUrl !== 'string' || !LEGACY_IMAGE_REGEX.test(imageUrl)) {
        return imageUrl
      }
      if (migratedImageUrls.has(imageUrl)) return migratedImageUrls.get(imageUrl)

      const filename = path.basename(imageUrl)
      const filePath = path.join(imagesDir, filename)
      let imageBuffer
      try {
        imageBuffer = await fs.readFile(filePath)
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`Legacy product image is missing and could not be migrated: ${filename}`)
          return imageUrl
        }
        throw error
      }

      const fileId = await uploadImageBuffer(imageBuffer, filename, getContentTypeFromFilename(filename))
      uploadedIds.push(fileId)
      migratedFiles.add(imageUrl)
      const gridFsPath = gridFsImagePath(fileId)
      migratedImageUrls.set(imageUrl, gridFsPath)
      return gridFsPath
    }

    const oldImage = product.image
    const oldImages = [...(product.images || [])]
    try {
      product.image = await migrateReference(product.image)
      product.images = await Promise.all((product.images || []).map(migrateReference))
      await product.save()
      migratedProducts += 1
    } catch (error) {
      await cleanupUploadedImages(uploadedIds)
      product.image = oldImage
      product.images = oldImages
      throw error
    }
  }

  for (const imageUrl of migratedFiles) {
    const stillReferenced = await Product.exists({
      $or: [{ image: imageUrl }, { images: imageUrl }]
    })
    if (!stillReferenced) {
      await fs.unlink(path.join(imagesDir, path.basename(imageUrl)))
    }
  }

  const imageFiles = await fs.readdir(imagesDir, { withFileTypes: true })
  for (const entry of imageFiles) {
    if (!entry.isFile() || !LEGACY_IMAGE_REGEX.test(`/images/${entry.name}`)) continue
    const oldImageUrl = `/images/${entry.name}`
    const stillReferenced = await Product.exists({
      $or: [{ image: oldImageUrl }, { images: oldImageUrl }]
    })
    if (!stillReferenced) {
      await fs.unlink(path.join(imagesDir, entry.name))
    }
  }

  if (migratedProducts > 0) {
    console.log(`📦 [GridFS]: Migrated product images for ${migratedProducts} products`)
  }
}

// @desc    Get products with comprehensive filtering (Layout, Price range, Category, Search)
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is not connected. Check MongoDB credentials in .env' })
    }

    const { category, partType, layout, minPrice, maxPrice, search, sort, switchType, plateCategory, keycapProfile, caseMaterial } = req.query
    const filter = {}

    if (category && category !== 'All' && category !== 'ทั้งหมด') {
      if (category === 'Plate Material' || category === 'Accessories' || category === 'เพลตซับเสียง (Plate Material)') {
        filter.category = { $in: ['Plate Material', 'Accessories'] }
      } else if (category === 'Case Material & Color' || category === 'เคสคีย์บอร์ด (Case Material & Color)') {
        filter.$and = filter.$and || []
        filter.$and.push({
          $or: [
            { category: 'Case Material & Color' },
            { partType: 'case' }
          ]
        })
      } else {
        filter.category = category
      }
    }

    if (partType && partType !== 'All') {
      filter.partType = partType
    }

    if (layout && layout !== 'All' && layout !== 'ทั้งหมด') {
      filter.layout = layout
    }

    if (switchType && switchType !== 'All' && switchType !== 'ทั้งหมด') {
      const match = switchType.match(/\(([^)]+)\)/)
      const colorKeyword = match ? match[1] : ''
      const escaped = switchType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$and = filter.$and || []
      if (colorKeyword) {
        // Strict match: exact switchType string OR product name matches exact color word
        filter.$and.push({
          $or: [
            { switchType: new RegExp(`^${escaped}$`, 'i') },
            { name: new RegExp(`\\b${colorKeyword}\\b`, 'i') }
          ]
        })
      } else {
        filter.$and.push({
          switchType: new RegExp(`^${escaped}$`, 'i')
        })
      }
    }

    // Plate category filtering (soft vs stiff)
    if (plateCategory && plateCategory !== 'All' && plateCategory !== 'ทั้งหมด') {
      if (plateCategory === 'soft') {
        filter.$and = filter.$and || []
        filter.$and.push({
          $or: [
            { plateCategory: 'soft' },
            { name: { $regex: 'FR4|Polycarbonate|POM', $options: 'i' } },
            { name: { $regex: '\\bPC\\b', $options: 'i' } }
          ]
        })
      } else if (plateCategory === 'stiff') {
        filter.$and = filter.$and || []
        filter.$and.push({
          $or: [
            { plateCategory: 'stiff' },
            { name: { $regex: 'Aluminum|Brass|Carbon Fiber|Copper|Steel|ทองแดง|ทองเหลือง|สแตนเลส|อลูมิเนียม', $options: 'i' } }
          ],
          name: { $not: { $regex: 'Polycarbonate|POM|FR4', $options: 'i' } }
        })
      }
    }

    // Keycap profile filtering (Cherry, OEM, SA, XDA)
    if (keycapProfile && keycapProfile !== 'All' && keycapProfile !== 'ทั้งหมด') {
      filter.$and = filter.$and || []
      filter.$and.push({
        $or: [
          { keycapProfile: new RegExp(`^${keycapProfile}$`, 'i') },
          { name: new RegExp(keycapProfile, 'i') },
          { description: new RegExp(keycapProfile, 'i') }
        ]
      })
    }

    // Case Material filtering (Aluminum, PC, ABS, Wood)
    if (caseMaterial && caseMaterial !== 'All' && caseMaterial !== 'ทั้งหมด') {
      filter.$and = filter.$and || []
      const mat = caseMaterial.trim()
      if (mat.toLowerCase() === 'pc') {
        filter.$and.push({
          $or: [
            { caseMaterial: { $regex: 'Polycarbonate|\\bPC\\b', $options: 'i' } },
            { name: { $regex: 'Polycarbonate|\\bPC\\b', $options: 'i' } }
          ]
        })
      } else {
        const escaped = mat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        filter.$and.push({
          $or: [
            { caseMaterial: new RegExp(escaped, 'i') },
            { name: new RegExp(escaped, 'i') },
            { description: new RegExp(escaped, 'i') }
          ]
        })
      }
    }

    // Price filtering
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Keyword search
    if (search && search.trim() !== '') {
      const searchOr = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { switchType: { $regex: search.trim(), $options: 'i' } }
      ]
      filter.$and = filter.$and || []
      filter.$and.push({ $or: searchOr })
    }

    // Sorting
    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { price: 1 }
    if (sort === 'price_desc') sortOption = { price: -1 }
    if (sort === 'rating') sortOption = { rating: -1 }

    const products = await Product.find(filter).sort(sortOption)
    res.json(products.map(product => serializeProduct(product, req)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single product by id
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      res.json(serializeProduct(product, req))
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Stream product images stored in MongoDB GridFS
// @route   GET /api/products/images/:id
export const getStoredProductImage = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product image not found' })
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id)
    const bucket = getProductImageBucket()
    const imageFile = await bucket.find({ _id: fileId }).next()
    if (!imageFile) {
      return res.status(404).json({ message: 'Product image not found' })
    }

    res.set('Content-Type', imageFile.metadata?.contentType || 'application/octet-stream')
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    await pipeline(bucket.openDownloadStream(fileId), res)
  } catch (error) {
    next(error)
  }
}

// @desc    Create new product (Staff / Owner)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  const imageUpload = createImageUploadContext()
  let productSaved = false
  try {
    const {
      name,
      category,
      price,
      compareAtPrice,
      image,
      images,
      description,
      stock,
      layout,
      partType,
      switchType,
      mountType,
      brand
    } = req.body

    const processedImage = await imageUpload.store(image, name || 'product')
    const processedImages = Array.isArray(images) && images.length > 0
      ? await Promise.all(images.map((img, idx) => imageUpload.store(img, `${name || 'product'}-${idx + 1}`)))
      : [processedImage]

    const product = new Product({
      name,
      slug: (name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category || 'Custom Keyboard',
      price: Number(price),
      compareAtPrice: Number(compareAtPrice) || 0,
      image: processedImage,
      images: processedImages,
      description: description || '',
      stock: Number(stock) || 10,
      inStock: Number(stock) > 0,
      layout: layout || '75%',
      partType: partType || 'keyboard',
      switchType: switchType || 'Linear (Red)',
      mountType: mountType || 'Gasket Mount',
      brand: brand || 'Key Craft Labs'
    })

    const saved = await product.save()
    productSaved = true
    res.status(201).json(serializeProduct(saved, req))
  } catch (error) {
    if (!productSaved) await cleanupUploadedImages(imageUpload.uploadedIds)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update product (Staff / Owner)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  const imageUpload = createImageUploadContext()
  let productSaved = false
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      const oldImages = [product.image, ...(product.images || [])]
      if (req.body.image) {
        req.body.image = await imageUpload.store(req.body.image, req.body.name || product.name)
        req.body.images = [req.body.image]
      }
      Object.assign(product, req.body)
      if (req.body.stock !== undefined) {
        product.inStock = Number(req.body.stock) > 0
      }
      const updated = await product.save()
      productSaved = true
      for (const oldImage of new Set(oldImages)) {
        if (oldImage !== updated.image && !updated.images.includes(oldImage)) {
          await deleteImageIfUnreferenced(oldImage)
        }
      }
      res.json(serializeProduct(updated, req))
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    if (!productSaved) await cleanupUploadedImages(imageUpload.uploadedIds)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete product (Staff / Owner)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      const imageUrls = new Set([product.image, ...(product.images || [])])
      await product.deleteOne()
      for (const imageUrl of imageUrls) {
        await deleteImageIfUnreferenced(imageUrl)
      }
      res.json({ message: 'Product deleted successfully', id: req.params.id })
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
