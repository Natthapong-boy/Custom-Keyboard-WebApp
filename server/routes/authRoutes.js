import express from 'express'
import {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  getAllUsers,
  updateUserRole
} from '../controllers/authController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/google', googleAuth)
router.get('/me', getMe)
router.get('/users', getAllUsers)
router.patch('/users/:id/role', updateUserRole)

export default router
