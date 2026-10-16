import express from 'express'
import { generatePromptPayQR, verifySlip } from '../controllers/paymentController.js'
import { optionalProtect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/promptpay/generate', optionalProtect, generatePromptPayQR)
router.post('/verify-slip', optionalProtect, verifySlip)

export default router
