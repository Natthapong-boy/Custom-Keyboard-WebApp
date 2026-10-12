import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'
import Order from '../models/Order.js'

// @desc    Generate standard PromptPay Dynamic QR Code
// @route   POST /api/payment/promptpay/generate
export const generatePromptPayQR = async (req, res) => {
  try {
    const { amount, mobileNumber } = req.body

    const targetAccount = mobileNumber || process.env.PROMPTPAY_ACCOUNT_ID || '0812345678'
    const targetAmount = parseFloat(amount) || 0

    // Generate EMVCo standard PromptPay payload
    const payload = generatePayload(targetAccount, { amount: targetAmount })

    // Generate standard QR Code data URL (black on white for camera / banking app compatibility)
    const qrImage = await QRCode.toDataURL(payload, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 340,
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

// @desc    Verify Slip via SlipOK API or Demo Bypass
// @route   POST /api/payment/verify-slip
export const verifySlip = async (req, res) => {
  try {
    const { orderId, slipImageBase64, expectedAmount, isDemo } = req.body

    const order = await Order.findOne({ orderId })
    const targetAmount = Number(expectedAmount || order?.total || 0)

    // Demo / Simulation mode
    if (isDemo) {
      if (order) {
        order.status = 'payment_success'
        order.paymentProof = slipImageBase64 || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
        await order.save()
      }
      return res.json({
        success: true,
        isDemo: true,
        message: 'จำลองการตรวจสอบยอดเงินสำเร็จ (Demo Mode)',
        verifiedAmount: targetAmount,
        orderId
      })
    }

    const slipOkUrl = process.env.SLIPOK_URL
    const slipOkKey = process.env.SLIPOK_API_KEY

    if (!slipOkUrl || !slipOkKey) {
      return res.status(400).json({
        success: false,
        message: 'ยังไม่ได้ตั้งค่า SLIPOK_URL หรือ SLIPOK_API_KEY ใน .env'
      })
    }

    if (!slipImageBase64) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาแนบรูปภาพสลิป'
      })
    }

    // แปลง base64 -> Buffer -> ส่งเป็น multipart/form-data
    // SlipOK ต้องการรับเป็นไฟล์จริง (files) ไม่ใช่ JSON base64
    const base64Data = slipImageBase64.includes(',')
      ? slipImageBase64.split(',')[1]
      : slipImageBase64

    // ตรวจจับชนิดไฟล์จาก data URI
    let mimeType = 'image/jpeg'
    let ext = 'jpg'
    if (slipImageBase64.startsWith('data:image/png')) { mimeType = 'image/png'; ext = 'png' }
    else if (slipImageBase64.startsWith('data:image/webp')) { mimeType = 'image/webp'; ext = 'webp' }

    const imageBuffer = Buffer.from(base64Data, 'base64')

    // สร้าง FormData เพื่อส่งไฟล์รูปสลิปแบบ multipart
    const formData = new FormData()
    const imageBlob = new Blob([imageBuffer], { type: mimeType })
    formData.append('files', imageBlob, `slip.${ext}`)
    formData.append('log', 'true')
    if (targetAmount > 0) {
      formData.append('amount', String(targetAmount))
    }

    // Call SlipOK API (multipart/form-data)
    const response = await fetch(slipOkUrl, {
      method: 'POST',
      headers: {
        'x-authorization': slipOkKey
        // ไม่ตั้ง Content-Type เพราะ FormData จะตั้งให้เองพร้อม boundary
      },
      body: formData
    })


    const result = await response.json()

    if (!response.ok || !result.success) {
      const errMsg = result.message || result.error || 'สลิปไม่ถูกต้อง หรือไม่สามารถตรวจสอบได้'
      return res.status(400).json({
        success: false,
        message: errMsg,
        detail: result
      })
    }

    const slipData = result.data || {}
    const verifiedAmount = Number(slipData.amount) || targetAmount

    // Check if amount is enough
    if (targetAmount > 0 && verifiedAmount < targetAmount) {
      return res.status(400).json({
        success: false,
        message: `ยอดเงินในสลิป (฿${verifiedAmount.toLocaleString()}) ไม่ครบตามยอดที่ต้องชำระ (฿${targetAmount.toLocaleString()})`
      })
    }

    // Update order in MongoDB to payment_success
    if (order) {
      order.status = 'payment_success'
      order.paymentProof = slipImageBase64
      order.paymentMethod = {
        type: 'promptpay',
        brand: 'PromptPay QR (สแกนพร้อมเพย์ - ตรวจสอบแล้ว)',
        transactionId: slipData.transRef || `TX-${Date.now()}`
      }
      await order.save()
    }

    res.json({
      success: true,
      message: 'ตรวจสอบสลิปสำเร็จ ได้รับยอดเงินเรียบร้อยแล้ว!',
      verifiedAmount,
      transRef: slipData.transRef,
      bank: slipData.sendingBank,
      receiver: slipData.receiver,
      date: slipData.transDate,
      time: slipData.transTime
    })
  } catch (error) {
    console.error('Verify slip error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

