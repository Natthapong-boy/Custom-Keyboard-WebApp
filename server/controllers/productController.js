import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Product from '../models/Product.js'
import { isDbConnected } from '../config/db.js'
import Category from '../models/Category.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesDir = path.resolve(__dirname, '../../public/images')

// Helper to save base64 image as real .png file on disk
export const processProductImage = (imageData, nameSlug = 'product') => {
  if (!imageData || typeof imageData !== 'string') {
    return '/images/void-artisan-75.png'
  }
  if (!imageData.startsWith('data:image/')) {
    return imageData
  }
  try {
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
    if (!matches) return imageData
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }
    const cleanSlug = nameSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
    const fileName = `${cleanSlug}-${Date.now()}.png`
    const filePath = path.join(imagesDir, fileName)
    fs.writeFileSync(filePath, buffer)
    console.log(`📸 [Image Saved]: Successfully saved new product PNG image to ${filePath}`)
    return `/images/${fileName}`
  } catch (err) {
    console.error('Failed to save base64 PNG image to disk:', err)
    return imageData
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
    res.json(products)
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
      res.json(product)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create new product (Staff / Owner)
// @route   POST /api/products
export const createProduct = async (req, res) => {
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

    const processedImage = processProductImage(image, name || 'product')
    const processedImages = Array.isArray(images) && images.length > 0
      ? images.map((img, idx) => processProductImage(img, `${name || 'product'}-${idx + 1}`))
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
    res.status(201).json(saved)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update product (Staff / Owner)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      if (req.body.image) {
        req.body.image = processProductImage(req.body.image, req.body.name || product.name)
        req.body.images = [req.body.image]
      }
      Object.assign(product, req.body)
      if (req.body.stock !== undefined) {
        product.inStock = Number(req.body.stock) > 0
      }
      const updated = await product.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete product (Staff / Owner)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      await product.deleteOne()
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
