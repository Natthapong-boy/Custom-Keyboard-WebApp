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
  const match = imageData.match(/^data:(image\/(?:png|jpeg|webp));base64,/i)
  if (!match) throw new Error('Product image must be a PNG, JPEG, or WebP data URL')
  return match[1].toLowerCase()
}

function getImageExtension(contentType) {
  return contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1]
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
        return imageData || '/images/void-artisan-75.png'
      }
      if (imageUrls.has(imageData)) return imageUrls.get(imageData)

      const contentType = getImageContentType(imageData)
      const base64 = imageData.slice(imageData.indexOf(',') + 1)
      const buffer = Buffer.from(base64, 'base64')
      if (buffer.length === 0) throw new Error('Product image is empty or invalid')

      const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
      const fileId = await uploadImageBuffer(
        buffer,
        `${safeName}-${Date.now()}.${getImageExtension(contentType)}`,
        contentType
      )
      uploadedIds.push(fileId)
      const imageUrl = gridFsImagePath(fileId)
      imageUrls.set(imageData, imageUrl)
      return imageUrl
    }
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
  const products = await Product.find({
    $or: [
      { image: { $regex: '^/images/[a-z0-9-]+-\\d+\\.png$', $options: 'i' } },
      { images: { $regex: '^/images/[a-z0-9-]+-\\d+\\.png$', $options: 'i' } }
    ]
  })
  const migratedFiles = new Set()
  let migratedProducts = 0

  for (const product of products) {
    const uploadedIds = []
    const migratedImageUrls = new Map()
    const migrateReference = async (imageUrl) => {
      if (typeof imageUrl !== 'string' || !/^\/images\/[a-z0-9-]+-\d+\.png$/i.test(imageUrl)) {
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

      const fileId = await uploadImageBuffer(imageBuffer, filename, 'image/png')
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

  const generatedFilePattern = /^[a-z0-9-]+-\d+\.png$/i
  const imageFiles = await fs.readdir(imagesDir, { withFileTypes: true })
  for (const entry of imageFiles) {
    if (!entry.isFile() || !generatedFilePattern.test(entry.name)) continue
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

// Initial seed data for Custom Keyboard parts & assemblies in THB (บาท)
export const INITIAL_SEED_PRODUCTS = [
  {
    name: 'Key Craft Void Artisan 75',
    slug: 'void-artisan-75',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 3490,
    compareAtPrice: 3990,
    image: '/images/void-artisan-75.png',
    images: [
      '/images/void-artisan-75.png',
      '/images/nebula-pro-65.png'
    ],
    description: 'พรีเมียม 75% Custom Mechanical Keyboard ตัวเรือน CNC อลูมิเนียมเกรด 6063 ระบบ Gasket Mount ซับเสียงด้วย Poron Foam ให้เสียง Thock แน่นลึก เชื่อมต่อ Tri-mode',
    stock: 15,
    inStock: true,
    isFeatured: true,
    rating: 4.9,
    numReviews: 28,
    partType: 'keyboard',
    layout: '75%',
    mountType: 'Gasket Mount',
    caseMaterial: '6063 CNC Anodized Aluminum',
    switchType: 'Gateron Oil King (Lubed)',
    switchSound: 'thock',
    switchFeel: 'Tactile / Deep Acoustic',
    keycaps: 'PBT Dye-Sub Cherry Profile',
    connectivity: ['Type-C Wired', 'Bluetooth 5.2', '2.4GHz Wireless (1000Hz)'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Nebula Pro 65 Alice Ergo',
    slug: 'nebula-pro-65-alice',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 4290,
    compareAtPrice: 4890,
    image: '/images/nebula-pro-65.png',
    description: 'Ergonomic Alice Layout 65% ออกแบบตามหลักสรีรศาสตร์เพื่อการพิมพ์ที่สบายที่สุด พร้อม Rotary Knob อลูมิเนียม CNC',
    stock: 8,
    inStock: true,
    isFeatured: true,
    rating: 5.0,
    numReviews: 14,
    partType: 'keyboard',
    layout: 'Alice / Ergo',
    mountType: 'Gasket Mount',
    caseMaterial: 'Frosted Polycarbonate & Brass Weight',
    switchType: 'Creamy Linear Switches (Lubed 205g0)',
    switchSound: 'creamy',
    switchFeel: 'Ultra Smooth Linear',
    keycaps: 'PBT Double-Shot OEM Profile',
    connectivity: ['Type-C Wired', 'Bluetooth 5.0'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Pulse 60 Compact Gaming',
    slug: 'pulse-60-compact',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 1890,
    compareAtPrice: 2290,
    image: '/images/pulse-60.png',
    description: 'คีย์บอร์ดมินิมอล 60% กะทัดรัด ประหยัดพื้นที่โต๊ะคอม สวิตช์ตอบสนองไว เหมาะสำหรับเกมเมอร์และการพกพา',
    stock: 22,
    inStock: true,
    isFeatured: true,
    rating: 4.7,
    numReviews: 32,
    partType: 'keyboard',
    layout: '60%',
    mountType: 'Tray Mount',
    caseMaterial: 'ABS High-Grade Matte Black',
    switchType: 'Red Linear Switches (Fast Actuation)',
    switchSound: 'linear',
    switchFeel: 'Smooth Linear',
    keycaps: 'PBT Shine-Through OEM Profile',
    connectivity: ['Type-C Wired'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Zenith 65 Wireless Tri-Mode',
    slug: 'zenith-65-wireless',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 2590,
    compareAtPrice: 2990,
    image: '/images/zenith-65.png',
    description: 'คีย์บอร์ด 65% มีปุ่มลูกศรครบครัน แบตเตอรี่อึด 4000mAh เชื่อมต่อได้ 3 โหมด บลูทูธและไร้สาย 2.4GHz',
    stock: 18,
    inStock: true,
    isFeatured: true,
    rating: 4.8,
    numReviews: 21,
    partType: 'keyboard',
    layout: '65%',
    mountType: 'Gasket Mount',
    caseMaterial: 'CNC Aluminum Top + Polycarbonate Base',
    switchType: 'Yellow Linear Pre-lubed',
    switchSound: 'creamy',
    switchFeel: 'Soft Linear',
    keycaps: 'XDA Profile Dye-Sub Keycaps',
    connectivity: ['Type-C Wired', 'Bluetooth 5.0', '2.4GHz Wireless'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Eclipse TKL Studio Master (80%)',
    slug: 'eclipse-tkl-studio',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 2990,
    compareAtPrice: 3490,
    image: '/images/eclipse-tkl.png',
    description: 'ขนาด TKL (Tenkeyless 80%) เหมาะสำหรับทั้งทำงานและเล่นเกม โครงสร้างซับเสียง 5 ชั้น ให้สัมผัสพิมพ์ที่นุ่มมือเป็นพิเศษ',
    stock: 12,
    inStock: true,
    isFeatured: false,
    rating: 4.9,
    numReviews: 19,
    partType: 'keyboard',
    layout: 'TKL (80%)',
    mountType: 'Gasket Mount',
    caseMaterial: 'Anodized Silver Aluminum',
    switchType: 'Brown Tactile Quiet',
    switchSound: 'soft',
    switchFeel: 'Subtle Tactile Bump',
    keycaps: 'Cherry Profile PBT Two-Tone',
    connectivity: ['Type-C Wired', 'Bluetooth 5.1'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Apex 100 Full Size Executive',
    slug: 'apex-100-full-size',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 3890,
    compareAtPrice: 4400,
    image: '/images/apex-100.png',
    description: 'คีย์บอร์ดขนาดเต็ม 100% มีแป้นตัวเลข Numpad ครบถ้วน เพื่อการทำงานเอกสารและคำนวณอย่างมืออาชีพ',
    stock: 7,
    inStock: true,
    isFeatured: false,
    rating: 4.8,
    numReviews: 15,
    partType: 'keyboard',
    layout: 'Full Size (100%)',
    mountType: 'Top Mount',
    caseMaterial: 'Full Aluminum CNC Unibody',
    switchType: 'Silent Black Linear',
    switchSound: 'soft',
    switchFeel: 'Ultra Silent Linear',
    keycaps: 'OEM PBT Double-Shot Thai/Eng',
    connectivity: ['Type-C Wired', 'Bluetooth 5.2'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Gateron Oil King Linear (Pack 35 ชิ้น)',
    slug: 'gateron-oil-king-switches',
    category: 'Switches',
    brand: 'Gateron',
    price: 690,
    compareAtPrice: 790,
    image: '/images/gateron-oil-king.png',
    description: 'สวิตช์ Linear ระดับท็อป Factory Lubed มาจากโรงงาน นุ่ม ลื่น เสียง Deep Thock 5-pin PCB Mount',
    stock: 50,
    inStock: true,
    isFeatured: false,
    rating: 4.9,
    numReviews: 45,
    partType: 'switch',
    layout: 'N/A',
    switchType: 'Linear 55g Actuation',
    switchSound: 'thock',
    switchFeel: 'Ultra Smooth Linear'
  },
  {
    name: 'Lavender Purple Tactile Switches (Pack 45 ชิ้น)',
    slug: 'lavender-purple-tactile',
    category: 'Switches',
    brand: 'Akko x Key Craft',
    price: 520,
    compareAtPrice: 600,
    image: '/images/lavender-purple.png',
    description: 'สวิตช์สัมผัสสองจังหวะ (Tactile) นุ่มแน่น แรงต้านกำลังดี โทนสีม่วงลาเวนเดอร์พรีเมียม',
    stock: 40,
    inStock: true,
    isFeatured: false,
    rating: 4.8,
    numReviews: 31,
    partType: 'switch',
    layout: 'N/A',
    switchType: 'Tactile 45g',
    switchSound: 'clack',
    switchFeel: 'Clean Tactile'
  },
  {
    name: 'Cyberpunk Purple PBT Keycaps Set (142 Keys)',
    slug: 'cyberpunk-purple-keycaps',
    category: 'Keycaps',
    brand: 'Key Craft Studio',
    price: 1290,
    compareAtPrice: 1590,
    image: '/images/cyberpunk-purple.png',
    description: 'เซ็ตปุ่มคีย์แคป PBT Dye-Sublimation โทนสีม่วง-ขาว หนา 1.5mm ทนทาน ไม่ขึ้นเงา รองรับทุก Layout',
    stock: 30,
    inStock: true,
    isFeatured: false,
    rating: 4.8,
    numReviews: 19,
    partType: 'keycap',
    layout: 'N/A',
    keycaps: 'Cherry Profile PBT Dye-Sub'
  },
  {
    name: 'Pastel Lilac Minimalist PBT Keycaps (130 Keys)',
    slug: 'pastel-lilac-keycaps',
    category: 'Keycaps',
    brand: 'Key Craft Studio',
    price: 990,
    compareAtPrice: 1200,
    image: '/images/pastel-lilac.png',
    description: 'ชุดปุ่มคีย์แคปสีม่วงพาสเทล มินิมอล สบายตา เหมาะสำหรับผู้ที่ชอบแต่งโต๊ะคอมคลีนๆ',
    stock: 25,
    inStock: true,
    isFeatured: false,
    rating: 4.9,
    numReviews: 22,
    partType: 'keycap',
    layout: 'N/A',
    keycaps: 'XDA Profile PBT Double-Shot'
  },
  {
    name: 'Coiled Aviator Cable (Lavender Purple)',
    slug: 'coiled-aviator-cable-purple',
    category: 'Accessories',
    brand: 'Key Craft Studio',
    price: 490,
    compareAtPrice: 650,
    image: '/images/coiled-aviator-cable.png',
    description: 'สายถักสปริงแบบ Coiled พร้อมหัวต่อโลหะ GX16 Aviator Type-C to USB-A ชุบทองนำสัญญาณดีเยี่ยม',
    stock: 35,
    inStock: true,
    isFeatured: false,
    rating: 4.9,
    numReviews: 18,
    partType: 'accessory',
    layout: 'N/A'
  }
]

export const INITIAL_CATEGORIES = [
  { name: 'Custom Keyboard', slug: 'custom-keyboard', icon: '⌨️', description: 'คีย์บอร์ดคัสตอมประกอบสำเร็จระดับพรีเมียม' },
  { name: 'Switches', slug: 'switches', icon: '🔘', description: 'สวิตช์แมคคานิคอล Linear, Tactile, Clicky' },
  { name: 'Keycaps', slug: 'keycaps', icon: '🎨', description: 'เซ็ตปุ่มคีย์แคป PBT หลากหลายโปรไฟล์' },
  { name: 'Accessories', slug: 'accessories', icon: '✨', description: 'สายถัก Coiled Cable และอุปกรณ์ปรับแต่ง' }
]

// @desc    Get products with comprehensive filtering (Layout, Price range, Category, Search)
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is not connected. Check MongoDB credentials in .env' })
    }

    const { category, partType, layout, minPrice, maxPrice, search, sort } = req.query
    const filter = {}

    if (category && category !== 'All' && category !== 'ทั้งหมด') {
      filter.category = category
    }

    if (partType && partType !== 'All') {
      filter.partType = partType
    }

    if (layout && layout !== 'All' && layout !== 'ทั้งหมด') {
      filter.layout = layout
    }

    // Price filtering
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Keyword search
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { switchType: { $regex: search.trim(), $options: 'i' } }
      ]
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
      switchType: switchType || 'Linear',
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

// @desc    Seed initial keyboard & e-commerce collections into MongoDB Atlas
// @route   POST /api/products/seed
export const seedDatabase = async (req, res) => {
  try {
    await Product.deleteMany({})
    await Category.deleteMany({})

    const createdCategories = await Category.insertMany(INITIAL_CATEGORIES)
    const createdProducts = await Product.insertMany(INITIAL_SEED_PRODUCTS)

    console.log(`🌱 [MongoDB Atlas Seeded]: ${createdCategories.length} Categories, ${createdProducts.length} Products`)

    res.json({
      success: true,
      message: `Seeded ${createdProducts.length} Products and ${createdCategories.length} Categories to MongoDB Atlas!`,
      products: createdProducts,
      categories: createdCategories
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
