import express from 'express'
import {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  getAllUsers,
  updateUserRole,
  createStaffUser
} from '../controllers/authController.js'
import { protect, requireOwner } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/google', googleAuth)
router.get('/me', getMe)
router.get('/users', protect, requireOwner, getAllUsers)
router.patch('/users/:id/role', protect, requireOwner, updateUserRole)
router.post('/staff', protect, requireOwner, createStaffUser)

export default router
