import express from 'express'
import { registerUser, loginUser, googleAuth, getMe } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/google', googleAuth)
router.get('/me', getMe)

export default router
