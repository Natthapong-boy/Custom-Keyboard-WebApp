import Product from '../models/Product.js'
import Category from '../models/Category.js'

// Initial seed data for Custom Keyboard parts & assemblies
const INITIAL_SEED_PRODUCTS = [
  {
    name: 'Key Craft Void Artisan 75',
    slug: 'void-artisan-75',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 189,
    compareAtPrice: 229,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'พรีเมียม 75% Custom Mechanical Keyboard ตัวเรือน CNC อลูมิเนียมเกรด 6063 ระบบ Gasket Mount ซับเสียงด้วย Poron Foam และ Silicone Pad ครบชุด ให้เสียง Thock แน่นลึก',
    stock: 15,
    inStock: true,
    isFeatured: true,
    rating: 4.9,
    numReviews: 28,
    partType: 'keyboard',
    layout: '75%',
    mountType: 'Gasket Mount',
    caseMaterial: '6063 CNC Anodized Aluminum',
    switchType: 'Blue Clicky / Gateron Oil King',
    switchSound: 'thock',
    switchFeel: 'Tactile / Deep Acoustic',
    keycaps: 'Key Craft Cyberpunk PBT Dye-Sub Cherry Profile',
    connectivity: ['Type-C Wired', 'Bluetooth 5.2', '2.4GHz Wireless (1000Hz)'],
    hotSwappable: true,
    rgbBacklit: true
  },
  {
    name: 'Nebula Pro 65 Alice Ergo',
    slug: 'nebula-pro-65-alice',
    category: 'Custom Keyboard',
    brand: 'Key Craft Labs',
    price: 219,
    compareAtPrice: 259,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'Ergonomic Alice Layout ออกแบบตามหลักสรีรศาสตร์เพื่อการพิมพ์ที่สบายที่สุด พร้อม Rotary Knob อลูมิเนียม CNC',
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
    name: 'Gateron Oil King Linear Switches (35 pcs)',
    slug: 'gateron-oil-king-switches',
    category: 'Switches',
    brand: 'Gateron',
    price: 28,
    compareAtPrice: 32,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
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
    name: 'Cyberpunk Neon PBT Keycaps Set (142 Keys)',
    slug: 'cyberpunk-neon-keycaps',
    category: 'Keycaps',
    brand: 'Key Craft Studio',
    price: 49,
    compareAtPrice: 65,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    description: 'เซ็ตปุ่มคีย์แคป PBT Dye-Sublimation หนา 1.5mm ทนทาน ไม่ขึ้นเงา รองรับทุก Layout (60%, 65%, 75%, TKL, Full)',
    stock: 30,
    inStock: true,
    isFeatured: false,
    rating: 4.8,
    numReviews: 19,
    partType: 'keycap',
    layout: 'N/A',
    keycaps: 'Cherry Profile PBT Dye-Sub'
  }
]

const INITIAL_CATEGORIES = [
  { name: 'Custom Keyboard', slug: 'custom-keyboard', icon: '⌨️', description: 'คีย์บอร์ดคัสตอมประกอบสำเร็จระดับพรีเมียม' },
  { name: 'Switches', slug: 'switches', icon: '🔘', description: 'สวิตช์แมคคานิคอล Linear, Tactile, Clicky' },
  { name: 'Keycaps', slug: 'keycaps', icon: '🎨', description: 'เซ็ตปุ่มคีย์แคป PBT / ABS หลากหลายโปรไฟล์' },
  { name: 'Cases & Plates', slug: 'cases-plates', icon: '🛡️', description: 'บอดี้ CNC Aluminum, PC Plate, FR4 Plate' },
  { name: 'Accessories', slug: 'accessories', icon: '✨', description: 'น้ำยา Lube, Switch Puller, สายถัก Coiled Cable' }
]

export const getProducts = async (req, res) => {
  try {
    const { category, partType, search } = req.query
    const filter = {}

    if (category) filter.category = category
    if (partType) filter.partType = partType
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

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
