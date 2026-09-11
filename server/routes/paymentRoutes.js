import express from 'express'
import { generatePromptPayQR, verifySlip } from '../controllers/paymentController.js'

const router = express.Router()

router.post('/promptpay/generate', generatePromptPayQR)
router.post('/verify-slip', verifySlip)

export default router
