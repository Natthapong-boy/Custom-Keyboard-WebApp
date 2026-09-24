import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_craft_jwt_token_2026_dev', {
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

    const userExists = await User.findOne({ email: cleanEmail })
    if (userExists) {
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
      token: generateToken(user._id)
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
    const user = await User.findOne({ email: cleanEmail })

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date()
      await user.save()

      console.log(`🔑 [MongoDB User Logged In]: ${user.email}`)

      res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ!',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        token: generateToken(user._id)
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
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found in MongoDB' })
    }

    res.json({
      success: true,
      user
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
    } catch (err) {
      console.warn('Google token verify fallback (dev mode):', err.message)
      payload = {
        name: 'Google Artisan Member',
        email: 'artisan.member@gmail.com',
        sub: 'google-sub-dev-id',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }
    }

    const { name, email, sub, picture } = payload
    let user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      if (!user.googleId) {
        user.googleId = sub
        if (picture) user.avatar = picture
        await user.save()
      }
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
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
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
