import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

// @desc    Generate standard PromptPay Dynamic QR Code
// @route   POST /api/payment/promptpay/generate
export const generatePromptPayQR = async (req, res) => {
  try {
    const { amount, mobileNumber } = req.body

    const targetAccount = mobileNumber || process.env.PROMPTPAY_ACCOUNT_ID || '0812345678'
    const targetAmount = parseFloat(amount) || 0

    // Generate EMVCo standard PromptPay payload
    const payload = generatePayload(targetAccount, { amount: targetAmount })

    // Generate QR Code data URL (base64 image)
    const qrImage = await QRCode.toDataURL(payload, {
      color: {
        dark: '#a855f7',
        light: '#090510'
      },
      width: 320,
      margin: 2
    })

    res.json({
      success: true,
      account: targetAccount,
      amount: targetAmount,
      qrImage,
      payload
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Simulate Payment Webhook / Instant Slip Verification
// @route   POST /api/payment/verify-slip
export const verifySlip = async (req, res) => {
  try {
    const { orderId, slipData } = req.body

    // Simulated instant verification response
    res.json({
      verified: true,
      orderId: orderId || 'KC-SAMPLE',
      verifiedAt: new Date().toISOString(),
      bank: 'PromptPay Express',
      amountValid: true,
      message: 'Transaction successfully verified with bank node'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
