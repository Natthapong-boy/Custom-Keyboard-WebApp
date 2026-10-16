import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
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
      User.findOne({ email: cleanEmail }),
      Employee.findOne({ email: cleanEmail })
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
    const [user, employee] = await Promise.all([
      User.findOne({ email: cleanEmail }),
      Employee.findOne({ email: cleanEmail })
    ])
    const [employeeMatches, userMatches] = await Promise.all([
      employee ? employee.matchPassword(password) : false,
      user ? user.matchPassword(password) : false
    ])

    if (employeeMatches && userMatches) {
      return res.status(409).json({
        message: 'พบข้อมูลบัญชีลูกค้าและพนักงานที่ใช้อีเมลและรหัสผ่านเดียวกัน กรุณาเปลี่ยนรหัสผ่านของบัญชีใดบัญชีหนึ่งแล้วลองใหม่'
      })
    }

    if (!employeeMatches && !userMatches) {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' })
      return
    }

    const accountType = employeeMatches ? 'employee' : 'user'
    const account = employeeMatches ? employee : user
    account.lastLogin = new Date()
    await account.save()

    console.log(`🔑 [MongoDB ${accountType === 'employee' ? 'Employee' : 'User'} Logged In]: ${account.email}`)

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ!',
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      avatar: account.avatar,
      phone: account.phone,
      accountType,
      ...(accountType === 'user' ? { shippingAddress: account.shippingAddress } : {}),
      token: generateToken(account._id, accountType)
    })
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
    const accountModel = decoded.accountType === 'employee' ? Employee : User
    const user = await accountModel.findById(decoded.id).select('-password')

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
    } catch (error) {
      return res.status(401).json({ message: 'Google ID token is invalid or expired' })
    }
    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: 'Google account information is incomplete' })
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
      accountType: 'user',
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all users (for Owner role management - includes User and Employee records)
// @route   GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    const [users, employees] = await Promise.all([
      User.find({}).select('-password').lean(),
      Employee.find({}).select('-password').lean()
    ])

    const emailMap = new Map()

    // Add employees first (includes owner and staff accounts from Employee collection)
    for (const emp of employees) {
      if (emp.email) {
        emailMap.set(emp.email.toLowerCase().trim(), {
          ...emp,
          _id: emp._id.toString(),
          accountType: 'employee'
        })
      }
    }

    // Add users from User collection
    for (const u of users) {
      if (u.email) {
        const cleanEmail = u.email.toLowerCase().trim()
        if (!emailMap.has(cleanEmail)) {
          emailMap.set(cleanEmail, {
            ...u,
            _id: u._id.toString(),
            accountType: 'user'
          })
        }
      }
    }

    // Ensure the currently authenticated user is always included in the results
    if (req.user && req.user.email) {
      const currentEmail = req.user.email.toLowerCase().trim()
      if (!emailMap.has(currentEmail)) {
        emailMap.set(currentEmail, {
          _id: req.user._id.toString(),
          name: req.user.name || 'Owner',
          email: req.user.email,
          phone: req.user.phone || '',
          role: req.user.role || 'owner',
          avatar: req.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          accountType: 'user'
        })
      }
    }

    const allList = Array.from(emailMap.values())

    // Sort by role hierarchy: owner/ceo/admin first, then staff/artisan, then customer
    const roleRank = {
      ceo: 1,
      owner: 2,
      admin: 3,
      staff: 4,
      artisan: 5,
      customer: 6
    }

    allList.sort((a, b) => {
      const rankA = roleRank[String(a.role).toLowerCase()] || 99
      const rankB = roleRank[String(b.role).toLowerCase()] || 99
      if (rankA !== rankB) return rankA - rankB
      return (a.name || '').localeCompare(b.name || '', 'th')
    })

    res.json(allList)
  } catch (error) {
    console.error('❌ getAllUsers error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user role (Owner only)
// @route   PATCH /api/auth/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['customer', 'staff', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง (ต้องเป็น customer, staff หรือ owner)' })
    }

    // Look for target account in User model first, then Employee model
    let account = await User.findById(req.params.id)
    if (!account) {
      account = await Employee.findById(req.params.id)
    }

    if (!account) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' })
    }

    // Security check: Prevent owner from modifying their own role
    if (
      (req.user?._id && String(req.user._id) === String(account._id)) ||
      (req.user?.email && account.email && req.user.email.toLowerCase().trim() === account.email.toLowerCase().trim())
    ) {
      return res.status(400).json({ message: 'ไม่อนุญาตให้เปลี่ยนสิทธิ์ของบัญชีตนเอง เพื่อความปลอดภัยของระบบ' })
    }

    account.role = role
    await account.save()

    res.json({
      success: true,
      message: `อัปเดตสิทธิ์ของ ${account.name || account.email} เป็น ${role} เรียบร้อยแล้ว`,
      user: {
        _id: account._id,
        name: account.name,
        email: account.email,
        role: account.role
      }
    })
  } catch (error) {
    console.error('❌ updateUserRole error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create new staff user (Owner only)
// @route   POST /api/auth/staff
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อ, อีเมล และรหัสผ่านให้ครบถ้วน' })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
    }

    const cleanEmail = email.toLowerCase().trim()

    const [userExists, employeeExists] = await Promise.all([
      User.findOne({ email: cleanEmail }),
      Employee.findOne({ email: cleanEmail })
    ])

    if (userExists || employeeExists) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น' })
    }

    // Creating in User model with role 'staff'
    // userSchema.pre('save') automatically hashes the password using bcrypt
    const staffUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    })

    console.log(`👨‍💼 [MongoDB Staff Created]: ${staffUser.email} (${staffUser._id})`)

    res.status(201).json({
      success: true,
      message: `เพิ่มพนักงาน "${staffUser.name}" สำเร็จเรียบร้อยแล้ว`,
      user: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone,
        role: staffUser.role,
        avatar: staffUser.avatar,
        createdAt: staffUser.createdAt
      }
    })
  } catch (error) {
    console.error('❌ Create Staff Error:', error)
    res.status(500).json({ message: `เกิดข้อผิดพลาดในการสร้างบัญชีพนักงาน: ${error.message}` })
  }
}

// @desc    Delete user account (Owner only - Customers & Staff only, never Owner)
// @route   DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Check if target user exists in User or Employee
    let account = await User.findById(userId)
    let isEmployee = false
    if (!account) {
      account = await Employee.findById(userId)
      isEmployee = true
    }

    if (!account) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานที่ต้องการลบในระบบ' })
    }

    // Safety Check 1: Strictly disallow deleting Owner, CEO, or Admin accounts
    const targetRole = String(account.role || '').toLowerCase().trim()
    if (targetRole === 'owner' || targetRole === 'ceo' || targetRole === 'admin') {
      return res.status(403).json({ message: 'ไม่อนุญาตให้ลบบัญชีผู้ใช้งานที่มีสิทธิ์เป็นเจ้าของร้าน (Owner) โดยเด็ดขาด' })
    }

    // Safety Check 2: Strictly disallow deleting currently logged in user
    if (
      (req.user?._id && String(req.user._id) === String(account._id)) ||
      (req.user?.email && account.email && req.user.email.toLowerCase().trim() === account.email.toLowerCase().trim())
    ) {
      return res.status(403).json({ message: 'ไม่อนุญาตให้ลบบัญชีของตนเอง' })
    }

    const deletedName = account.name || account.email
    const deletedEmail = account.email

    // Delete from primary collection
    if (isEmployee) {
      await Employee.findByIdAndDelete(userId)
    } else {
      await User.findByIdAndDelete(userId)
    }

    // Also clean up if there is an account in the other collection with the same email
    if (deletedEmail) {
      await Promise.all([
        User.deleteMany({ email: deletedEmail.toLowerCase().trim(), _id: { $ne: req.user?._id } }),
        Employee.deleteMany({ email: deletedEmail.toLowerCase().trim(), _id: { $ne: req.user?._id } })
      ])
    }

    console.log(`🗑️ [User Deleted]: ${deletedName} (${userId}) by Owner ${req.user?.email}`)

    res.json({
      success: true,
      message: `ลบผู้ใช้งาน "${deletedName}" ออกจากระบบเรียบร้อยแล้ว`,
      id: userId
    })
  } catch (error) {
    console.error('❌ deleteUser error:', error)
    res.status(500).json({ message: `เกิดข้อผิดพลาดในการลบผู้ใช้งาน: ${error.message}` })
  }
}

// @desc    Update user profile & optional reset password (Owner only)
// @route   PUT /api/auth/users/:id or PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id
    const { name, email, phone, password } = req.body

    // 1. Find account in User or Employee
    let account = await User.findById(userId)
    let isEmployee = false
    if (!account) {
      account = await Employee.findById(userId)
      isEmployee = true
    }

    if (!account) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานที่ต้องการแก้ไขในระบบ' })
    }

    const oldEmail = (account.email || '').toLowerCase().trim()

    // 2. Name validation and update
    if (name && name.trim()) {
      account.name = name.trim()
    }

    // 3. Phone update
    if (phone !== undefined) {
      account.phone = phone ? phone.trim() : ''
    }

    // 4. Email validation and uniqueness check
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim()
      if (cleanEmail !== oldEmail) {
        const [dupUser, dupEmp] = await Promise.all([
          User.findOne({ email: cleanEmail, _id: { $ne: account._id } }),
          Employee.findOne({ email: cleanEmail, _id: { $ne: account._id } })
        ])
        if (dupUser || dupEmp) {
          return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นในระบบแล้ว กรุณาใช้อีเมลอื่น' })
        }
        account.email = cleanEmail
      }
    }

    // 5. Password Reset (for Staff or user by Owner)
    // Only update if password was explicitly provided as non-empty
    let passwordUpdated = false
    let trimmedPassword = ''
    if (password && String(password).trim().length > 0) {
      trimmedPassword = String(password).trim()
      if (trimmedPassword.length < 6) {
        return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
      }
      account.password = trimmedPassword
      passwordUpdated = true
    }

    // Save account (Mongoose pre('save') hook hashes password if modified)
    await account.save()

    // 6. Also sync data to matching account in the other collection if present
    const updatedEmail = account.email
    if (isEmployee) {
      const matchingUser = await User.findOne({ email: oldEmail })
      if (matchingUser) {
        matchingUser.name = account.name
        matchingUser.email = updatedEmail
        matchingUser.phone = account.phone
        if (passwordUpdated) matchingUser.password = trimmedPassword
        await matchingUser.save()
      }
    } else {
      const matchingEmp = await Employee.findOne({ email: oldEmail })
      if (matchingEmp) {
        matchingEmp.name = account.name
        matchingEmp.email = updatedEmail
        matchingEmp.phone = account.phone
        if (passwordUpdated) matchingEmp.password = trimmedPassword
        await matchingEmp.save()
      }
    }

    console.log(`✏️ [User Updated]: ${account.name} (${userId}) ${passwordUpdated ? '[Password Reset]' : ''} by Owner ${req.user?.email}`)

    res.json({
      success: true,
      message: `อัปเดตข้อมูลของ "${account.name}" สำเร็จเรียบร้อยแล้ว${passwordUpdated ? ' (รีเซ็ตรหัสผ่านสำเร็จ)' : ''}`,
      user: {
        _id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        avatar: account.avatar,
        updatedAt: account.updatedAt
      }
    })
  } catch (error) {
    console.error('❌ updateUser error:', error)
    res.status(500).json({ message: `เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน: ${error.message}` })
  }
}
