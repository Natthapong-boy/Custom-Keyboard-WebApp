import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
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

    // 2. Check & Seed Sample Orders
    const orderCount = await Order.countDocuments()
    if (orderCount === 0) {
      await Order.insertMany([
        {
          orderId: 'KC-90821',
          customer: {
            name: 'Kenji Sato',
            email: 'kenji.sato@craftworks.dev',
            address: '7-2-1 Minato-ku, Roppongi Hills 42F',
            city: 'Tokyo',
            country: 'Japan',
            zip: '106-6142'
          },
          items: [
            {
              name: 'Custom Void 75',
              specs: '75% • Purple Anodized • Blue Clicky • Lilac Keycaps',
              switchSound: 'click',
              price: 189,
              quantity: 1
            }
          ],
          paymentMethod: { type: 'card', last4: '4242', brand: 'Visa' },
          subtotal: 189,
          discount: 18.9,
          shipping: 0,
          total: 170.1,
          status: 'acoustic_qc',
          trackingNumber: 'DHL-JP-889104820',
          estimatedDelivery: 'Sep 15, 2026',
          notes: 'Laser engraving: "FLOW STATE"'
        },
        {
          orderId: 'KC-90415',
          customer: {
            name: 'Alex Vance',
            email: 'alex@designgrid.io',
            address: '452 Fremont St, Ste 300',
            city: 'San Francisco',
            country: 'USA',
            zip: '94105'
          },
          items: [
            {
              name: 'Nebula 65 Edition',
              specs: '65% • Space Grey • Linear Red • Carbon Keycaps',
              switchSound: 'linear',
              price: 159,
              quantity: 1
            }
          ],
          paymentMethod: { type: 'apple_pay', last4: '8831', brand: 'Apple Pay' },
          subtotal: 159,
          discount: 0,
          shipping: 15,
          total: 174,
          status: 'delivered',
          trackingNumber: 'DHL-US-991048114',
          estimatedDelivery: 'Sep 06, 2026',
          notes: 'Standard lubricant tuning'
        },
        {
          orderId: 'KC-91204',
          customer: {
            name: 'Piti Rattanakul',
            email: 'piti.dev@bangkok.co',
            address: '88 Sukhumvit Soi 21, Asoke Tower 15th Fl',
            city: 'Bangkok',
            country: 'Thailand',
            zip: '10110'
          },
          items: [
            {
              name: 'Zenith TKL Pro (Thai Legend)',
              specs: 'TKL (80%) • Silver Frost • Gateron Oil King • BoW Keycaps',
              switchSound: 'thock',
              price: 219,
              quantity: 1
            }
          ],
          paymentMethod: { type: 'promptpay', brand: 'PromptPay QR' },
          subtotal: 219,
          discount: 20,
          shipping: 0,
          total: 199,
          status: 'soldering_lubing',
          trackingNumber: 'TH-KERRY-7729103',
          estimatedDelivery: 'Sep 18, 2026',
          notes: 'Krytox 205g0 lube + Holee mod'
        }
      ])
      console.log('📦 [Seeded]: 3 initial orders in MongoDB')
    }
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
