import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Employee from '../models/Employee.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id, accountType = 'user') => {
  return jwt.sign({ id, accountType }, process.env.JWT_SECRET || 'super_secret_key_craft_jwt_token_2026_dev', {
    expiresIn: '30d'
  })
}

// @desc    Register a new user in MongoDB Atlas
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อ, อีเมล และรหัสผ่านให้ครบถ้วน' })
    }

    const cleanEmail = email.toLowerCase().trim()

    const [userExists, employeeExists] = await Promise.all([
      User.exists({ email: cleanEmail }),
      Employee.exists({ email: cleanEmail })
    ])
    if (userExists || employeeExists) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบ' })
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone || '',
      role: 'customer'
    })

    console.log(`👤 [MongoDB New User Registered]: ${user.email} (${user._id})`)

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จและบันทึกลง MongoDB Atlas เรียบร้อยแล้ว!',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accountType: 'user',
      token: generateToken(user._id, 'user')
    })
  } catch (error) {
    console.error('❌ Register Error:', error)
    res.status(500).json({ message: `เกิดข้อผิดพลาดในการสมัครสมาชิก: ${error.message}` })
  }
}

// @desc    Login with Email & Password
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const employee = await Employee.findOne({ email: cleanEmail }).select('+password')
    const user = employee ? null : await User.findOne({ email: cleanEmail })
    const account = employee || user
    const passwordMatches = employee
      ? await employee.matchPassword(password)
      : user && await user.matchPassword(password)

    if (account && passwordMatches) {
      account.lastLogin = new Date()
      await account.save()

      console.log(`🔑 [MongoDB ${employee ? 'Employee' : 'User'} Logged In]: ${account.email}`)

      res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ!',
        _id: account._id,
        accountType: employee ? 'employee' : 'user',
        name: account.name,
        email: account.email,
        role: account.role,
        avatar: account.avatar,
        phone: account.phone,
        shippingAddress: user?.shippingAddress,
        token: generateToken(account._id, employee ? 'employee' : 'user')
      })
    } else {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' })
    }
  } catch (error) {
    console.error('❌ Login Error:', error)
    res.status(500).json({ message: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}` })
  }
}

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_craft_jwt_token_2026_dev')
    const account = decoded.accountType === 'employee'
      ? await Employee.findById(decoded.id)
      : await User.findById(decoded.id).select('-password') ||
        (!decoded.accountType ? await Employee.findById(decoded.id) : null)

    if (!account) {
      return res.status(404).json({ message: 'User not found in MongoDB' })
    }

    res.json({
      success: true,
      user: {
        ...account.toObject(),
        accountType: decoded.accountType || 'user'
      }
    })
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// @desc    Google Sign-In / OAuth 2.0
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: 'Google ID token is required' })
    }

    let payload
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      payload = ticket.getPayload()
    } catch (error) {
      return res.status(401).json({ message: 'Google ID token is invalid or expired' })
    }
    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: 'Google account information is incomplete' })
    }

    const { name, email, sub, picture } = payload
    const cleanEmail = email.toLowerCase()
    if (await Employee.exists({ email: cleanEmail })) {
      return res.status(409).json({ message: 'อีเมลนี้เป็นบัญชีพนักงาน กรุณาเข้าสู่ระบบด้วยรหัสผ่าน' })
    }
    let user = await User.findOne({ email: cleanEmail })

    if (user) {
      if (!user.googleId) {
        user.googleId = sub
        if (picture) user.avatar = picture
        await user.save()
      }
    } else {
      user = await User.create({
        name,
        email: cleanEmail,
        googleId: sub,
        avatar: picture || undefined,
        role: 'customer'
      })
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accountType: 'user',
      token: generateToken(user._id, 'user')
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get customers and employees (for Owner role management)
// @route   GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    const [users, employees] = await Promise.all([
      User.find({}).select('-password').lean(),
      Employee.find({}).lean()
    ])
    res.json([
      ...users.map(user => ({ ...user, accountType: 'user' })),
      ...employees.map(employee => ({ ...employee, accountType: 'employee' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user role (Owner only)
// @route   PATCH /api/auth/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role, accountType = 'user' } = req.body
    if (!['customer', 'staff', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง (ต้องเป็น customer, staff หรือ owner)' })
    }

    if (!['user', 'employee'].includes(accountType) || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ข้อมูลบัญชีไม่ถูกต้อง' })
    }

    const source = accountType === 'employee'
      ? await Employee.findById(req.params.id).select('+password')
      : await User.findById(req.params.id).select('+password')
    if (!source) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' })
    }

    const targetType = role === 'customer' ? 'user' : 'employee'
    const targetModel = targetType === 'employee' ? Employee : User
    const existingTarget = await targetModel.findOne({ email: source.email })
    if (existingTarget && String(existingTarget._id) !== String(source._id)) {
      return res.status(409).json({ message: 'มีบัญชีอีเมลนี้ในระบบปลายทางอยู่แล้ว' })
    }

    let updatedAccount
    if (targetType === accountType) {
      source.role = role
      await source.save()
      updatedAccount = source
    } else {
      if (!source.password) {
        return res.status(400).json({ message: 'บัญชีนี้ไม่มีรหัสผ่านสำหรับเข้าสู่ระบบ' })
      }
      const transferred = {
        ...source.toObject(),
        _id: source._id,
        role
      }
      delete transferred.__v
      if (targetType === 'employee' || /^\$2[aby]\$/.test(source.password)) {
        await targetModel.collection.insertOne(transferred)
        updatedAccount = await targetModel.findById(source._id)
      } else {
        updatedAccount = await User.create(transferred)
      }
      await source.deleteOne()
    }

    res.json({
      success: true,
      message: `อัปเดตสิทธิ์ของ ${updatedAccount.name} เป็น ${role} เรียบร้อยแล้ว`,
      user: {
        _id: updatedAccount._id,
        name: updatedAccount.name,
        email: updatedAccount.email,
        role: updatedAccount.role,
        accountType: targetType
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
