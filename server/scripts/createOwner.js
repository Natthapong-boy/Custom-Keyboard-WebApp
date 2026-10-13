import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const createOwner = async () => {
  const name = process.env.OWNER_NAME?.trim()
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD

  if (!name || !email || !password) {
    throw new Error('กำหนด OWNER_NAME, OWNER_EMAIL และ OWNER_PASSWORD ใน server/.env ก่อน')
  }
  const connected = await connectDB()
  if (!connected) {
    throw new Error('เชื่อมต่อ MongoDB ไม่สำเร็จ ตรวจสอบค่าการเชื่อมต่อใน server/.env')
  }

  const existingOwner = await User.findOne({ role: 'owner' })
  if (existingOwner) {
    if (existingOwner.email !== email) {
      throw new Error('มีบัญชีเจ้าของร้านอยู่แล้ว OWNER_EMAIL ต้องตรงกับอีเมลของเจ้าของเดิม')
    }
    if (password.length < 12) {
      throw new Error('OWNER_PASSWORD ต้องมีความยาวอย่างน้อย 12 ตัวอักษร')
    }

    existingOwner.password = password
    await existingOwner.save()
    console.log(`ตั้งรหัสผ่านใหม่ให้บัญชีเจ้าของ ${existingOwner.email} สำเร็จ`)
    return
  }

  let user = await User.findOne({ email })
  if (user) {
    if (!(await user.matchPassword(password))) {
      throw new Error('อีเมลนี้มีบัญชีอยู่แล้ว แต่รหัสผ่านไม่ตรงกับบัญชี')
    }
    user.role = 'owner'
  } else {
    if (password.length < 12) {
      throw new Error('OWNER_PASSWORD ต้องมีความยาวอย่างน้อย 12 ตัวอักษรสำหรับบัญชีใหม่')
    }
    user = new User({ name, email, password, role: 'owner' })
  }

  await user.save()
  console.log(`สร้างสิทธิ์เจ้าของร้านให้บัญชี ${user.email} สำเร็จ`)
}

createOwner()
  .catch((error) => {
    console.error(`สร้างบัญชีเจ้าของไม่สำเร็จ: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
