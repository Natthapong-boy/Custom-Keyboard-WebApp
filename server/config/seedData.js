import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { connectDB } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

export const seedDatabase = async () => {
  try {
    console.log('🌱 Checking seed users & initial data...')

    // 1. Check & Seed Default Users (Owner, Staff, Customer)
    const existingOwner = await User.findOne({ email: 'owner@customkb.com' })
    if (!existingOwner) {
      await User.create({
        name: 'Somchai (Owner)',
        email: 'owner@customkb.com',
        password: 'owner123',
        role: 'owner',
        phone: '081-999-8888',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      })
      console.log('👑 [Seeded]: Owner account (owner@customkb.com / owner123)')
    }

    const existingStaff = await User.findOne({ email: 'staff@customkb.com' })
    if (!existingStaff) {
      await User.create({
        name: 'Somsri (Artisan Staff)',
        email: 'staff@customkb.com',
        password: 'staff123',
        role: 'staff',
        phone: '082-777-6666',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      })
      console.log('🛠️ [Seeded]: Staff account (staff@customkb.com / staff123)')
    }

    const existingCustomer = await User.findOne({ email: 'customer@customkb.com' })
    if (!existingCustomer) {
      await User.create({
        name: 'Natthapong (Customer)',
        email: 'customer@customkb.com',
        password: 'customer123',
        role: 'customer',
        phone: '089-123-4567',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      })
      console.log('👤 [Seeded]: Customer account (customer@customkb.com / customer123)')
    }

    // 2. Check & Seed Categories if empty
    const categoryCount = await Category.countDocuments()
    if (categoryCount === 0) {
      const { INITIAL_CATEGORIES } = await import('../controllers/productController.js')
      await Category.insertMany(INITIAL_CATEGORIES)
      console.log(`📁 [Seeded]: ${INITIAL_CATEGORIES.length} Categories in MongoDB Atlas!`)
    }

    // 3. Check & Seed Products if empty
    const productCount = await Product.countDocuments()
    if (productCount === 0) {
      const { INITIAL_SEED_PRODUCTS } = await import('../controllers/productController.js')
      await Product.insertMany(INITIAL_SEED_PRODUCTS)
      console.log(`⌨️ [Seeded]: ${INITIAL_SEED_PRODUCTS.length} Keyboard products & parts in MongoDB Atlas!`)
    }

      // 2. Check & Seed Sample Orders
      const orderCount = await Order.countDocuments()
      if (orderCount === 0) {
        await Order.insertMany([
          {
            orderId: 'KC-90821',
            orderType: 'custom',
            customer: {
              name: 'กิตติศักดิ์ ช่างศิลป์',
              email: 'kittisak@example.com',
              phone: '081-888-9999',
              address: '123/45 ถนนพหลโยธิน แขวงลาดยาว',
              city: 'กรุงเทพมหานคร',
              country: 'Thailand',
              zip: '10900'
            },
            items: [
              {
                name: 'Key Craft Void Artisan 75 (Custom Build)',
                specs: '75% • ม่วงพาสเทล • Gateron Oil King • Keycaps ลาเวนเดอร์',
                switchSound: 'thock',
                price: 3490,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
              }
            ],
            paymentMethod: { type: 'promptpay', brand: 'PromptPay QR' },
            paymentProof: '',
            subtotal: 3490,
            discount: 0,
            shipping: 0,
            total: 3490,
            status: 'processing_custom',
            trackingNumber: 'TH-KERRY-889104820',
            estimatedDelivery: '15 ต.ค. 2569',
            notes: 'ลูกค้าสั่งประกอบเอง: ปรับแต่งสวิตช์ Lube 205g0 เรียบเนียน'
          },
          {
            orderId: 'KC-90415',
            orderType: 'prebuilt',
            customer: {
              name: 'วรรณภา ใจดี',
              email: 'wannapa@example.com',
              phone: '089-111-2222',
              address: '55 หมู่ 2 ต.ช้างเผือก อ.เมือง',
              city: 'เชียงใหม่',
              country: 'Thailand',
              zip: '50300'
            },
            items: [
              {
                name: 'Pulse 60 Compact Gaming',
                specs: '60% • Red Linear • Matte Black',
                switchSound: 'linear',
                price: 1890,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80'
              }
            ],
            paymentMethod: { type: 'bank_transfer', brand: 'ธนาคารกสิกรไทย' },
            paymentProof: '',
            subtotal: 1890,
            discount: 0,
            shipping: 50,
            total: 1940,
            status: 'shipping',
            trackingNumber: 'TH-FLASH-991048114',
            estimatedDelivery: '14 ต.ค. 2569',
            notes: 'แพ็กแน่นหนา ใส่บับเบิ้ล 3 ชั้น'
          },
          {
            orderId: 'KC-91204',
            orderType: 'prebuilt',
            customer: {
              name: 'ปิติ รัตนกุล',
              email: 'piti.dev@example.co',
              phone: '082-333-4444',
              address: '88 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ',
              city: 'กรุงเทพมหานคร',
              country: 'Thailand',
              zip: '10110'
            },
            items: [
              {
                name: 'Zenith 65 Wireless Tri-Mode',
                specs: '65% • Yellow Linear • XDA Keycaps',
                switchSound: 'creamy',
                price: 2590,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
              }
            ],
            paymentMethod: { type: 'promptpay', brand: 'PromptPay QR' },
            paymentProof: '',
            subtotal: 2590,
            discount: 100,
            shipping: 0,
            total: 2490,
            status: 'checking_payment',
            trackingNumber: '',
            estimatedDelivery: '18 ต.ค. 2569',
            notes: 'รอเจ้าหน้าที่ตรวจสอบสลิปโอนเงิน'
          }
        ])
        console.log('📦 [Seeded]: 3 initial orders with Thai data in MongoDB Atlas')
      }

      const sampleSlipFilter = {
        paymentProof: { $regex: 'photo-1554224155-8d04cb21cd6c' }
      }
      await Order.updateMany(
        { ...sampleSlipFilter, status: 'checking_payment' },
        { $set: { paymentProof: '', status: 'pending_payment' } }
      )
      await Order.updateMany(sampleSlipFilter, { $set: { paymentProof: '' } })
  } catch (error) {
    console.warn('⚠️ Seeder notice (non-fatal):', error.message)
  }
}

if (process.argv[2] === '--run') {
  connectDB().then(async () => {
    await seedDatabase()
    process.exit(0)
  })
}
