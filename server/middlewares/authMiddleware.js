import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' })
  }

  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_key_craft_jwt_token_2026_dev'
    )
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'บัญชีผู้ใช้ไม่พบหรือถูกลบแล้ว' })
    }
    return next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' })
  }
}

export const requireOwner = (req, res, next) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของร้าน' })
  }
  return next()
}
