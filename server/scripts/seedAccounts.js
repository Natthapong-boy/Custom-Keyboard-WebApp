import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Employee from '../models/Employee.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const migrateLegacyEmployees = async () => {
  const legacyEmployees = await User.find({ role: { $in: ['owner', 'staff'] } }).select('+password')

  for (const user of legacyEmployees) {
    if (!user.password) {
      throw new Error(`บัญชี ${user.email} ไม่มีรหัสผ่าน กรุณาตั้งรหัสผ่านก่อนย้ายไป employees`)
    }

    const employeeExists = await Employee.exists({ email: user.email })
    if (!employeeExists) {
      const employee = user.toObject()
      delete employee.shippingAddress
      await Employee.collection.insertOne(employee)
    }
    await user.deleteOne()
    console.log(`ย้ายบัญชี ${user.email} ไปยัง employees แล้ว`)
  }
}

const seedAccounts = async () => {
  const owner = {
    name: process.env.OWNER_NAME?.trim(),
    email: process.env.OWNER_EMAIL?.trim().toLowerCase(),
    password: process.env.OWNER_PASSWORD
  }
  const employee = {
    name: process.env.EMPLOYEE_NAME?.trim() || 'พนักงาน 01',
    email: process.env.EMPLOYEE_EMAIL?.trim().toLowerCase(),
    password: process.env.EMPLOYEE_PASSWORD
  }

  if (!owner.name || !owner.email || !owner.password) {
    throw new Error('กำหนด OWNER_NAME, OWNER_EMAIL และ OWNER_PASSWORD ใน server/.env ก่อน')
  }
  if (!employee.email || !employee.password) {
    throw new Error('กำหนด EMPLOYEE_EMAIL และ EMPLOYEE_PASSWORD ใน server/.env ก่อน')
  }
  if (owner.email === employee.email) {
    throw new Error('อีเมลเจ้าของและพนักงานต้องไม่ซ้ำกัน')
  }

  const connected = await connectDB()
  if (!connected) {
    throw new Error('เชื่อมต่อ MongoDB ไม่สำเร็จ ตรวจสอบค่าการเชื่อมต่อใน server/.env')
  }

  await migrateLegacyEmployees()

  const existingOwner = await Employee.findOne({ role: 'owner' })
  if (existingOwner && existingOwner.email !== owner.email) {
    throw new Error('มีบัญชีเจ้าของร้านอยู่แล้ว OWNER_EMAIL ต้องตรงกับอีเมลของเจ้าของเดิม')
  }

  const ownerUser = await User.findOne({ email: owner.email }).select('+password')
  if (ownerUser) {
    if (!(await ownerUser.matchPassword(owner.password))) {
      throw new Error('อีเมลเจ้าของมีบัญชีลูกค้าอยู่แล้ว แต่รหัสผ่านไม่ตรงกับบัญชีนั้น')
    }
    await ownerUser.deleteOne()
  }

  const ownerPasswordHash = await bcrypt.hash(owner.password, 10)
  await Employee.findOneAndUpdate(
    { email: owner.email },
    { ...owner, password: ownerPasswordHash, role: 'owner' },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )

  const employeeUser = await User.findOne({ email: employee.email })
  if (employeeUser) {
    throw new Error('อีเมลพนักงานมีบัญชีผู้ใช้อยู่แล้ว กรุณาเลือกอีเมลอื่น')
  }

  const employeePasswordHash = await bcrypt.hash(employee.password, 10)
  await Employee.findOneAndUpdate(
    { email: employee.email },
    { ...employee, password: employeePasswordHash, role: 'staff' },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )

  console.log(`สร้าง/ปรับปรุงบัญชีเจ้าของและพนักงานใน employees สำเร็จ`)
}

seedAccounts()
  .catch((error) => {
    console.error(`สร้างบัญชีไม่สำเร็จ: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
