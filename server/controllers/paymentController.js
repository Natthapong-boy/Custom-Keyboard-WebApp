import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { canAccessOrder } from '../utils/orderAccess.js'

const PAYMENT_QR_VALIDITY_MINUTES = 15
const normalizePromptPayAccount = (account) => String(account || '').replace(/\D/g, '')

const isReceivingAccountMismatch = (message) =>
  /บัญชี.{0,30}(?:ไม่ตรง|ไม่ถูกต้อง)|(?:ไม่ตรง|ไม่ถูกต้อง).{0,30}บัญชี|receiver.*mismatch|receiving account.*mismatch/i.test(message)

// @desc    Generate standard PromptPay Dynamic QR Code
// @route   POST /api/payment/promptpay/generate
export const generatePromptPayQR = async (req, res) => {
  try {
    const { orderId } = req.body
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'ไม่พบรหัสคำสั่งซื้อสำหรับสร้าง QR' })
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อสำหรับสร้าง QR' })
    }
    if (!canAccessOrder(order, req)) {
      return res.status(req.user ? 404 : 401).json({
        success: false,
        message: req.user ? 'ไม่พบคำสั่งซื้อหรือไม่มีสิทธิ์เข้าถึง' : 'กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อ'
      })
    }
    if (!['pending_payment', 'checking_payment', 'payment_failed'].includes(order.status)) {
      return res.status(409).json({ success: false, message: 'คำสั่งซื้อนี้ไม่อยู่ในสถานะที่รับชำระเงิน' })
    }

    const targetAccount = process.env.PROMPTPAY_ACCOUNT_ID?.trim()
    if (!targetAccount) {
      return res.status(500).json({
        success: false,
        message: 'ยังไม่ได้ตั้งค่า PROMPTPAY_ACCOUNT_ID สำหรับสร้าง QR รับเงิน'
      })
    }
    const targetAmount = Number(order.total)
    if (targetAmount <= 0) {
      return res.status(400).json({ success: false, message: 'ยอดชำระไม่ถูกต้อง' })
    }

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

    const expiresAt = new Date(Date.now() + PAYMENT_QR_VALIDITY_MINUTES * 60 * 1000)
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId, status: { $in: ['pending_payment', 'checking_payment', 'payment_failed'] } },
      {
        $set: {
          'paymentMethod.promptPayAccount': targetAccount,
          paymentQrExpiresAt: expiresAt
        }
      },
      { new: true }
    )
    if (!updatedOrder) {
      return res.status(409).json({ success: false, message: 'คำสั่งซื้อนี้ได้รับการชำระเงินแล้ว' })
    }

    res.json({
      success: true,
      orderId,
      account: targetAccount,
      amount: targetAmount,
      expiresAt: updatedOrder.paymentQrExpiresAt,
      validityMinutes: PAYMENT_QR_VALIDITY_MINUTES,
      qrImage,
      payload
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Verify a PromptPay slip via SlipOK
// @route   POST /api/payment/verify-slip
export const verifySlip = async (req, res) => {
  try {
    const { orderId, slipImageBase64, isDemo } = req.body

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนตรวจสอบสลิป' })
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อที่ต้องการตรวจสอบ' })
    }
    if (!canAccessOrder(order, req)) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อหรือไม่มีสิทธิ์เข้าถึง' })
    }

    if (order.status === 'payment_success' || !['pending_payment', 'checking_payment', 'payment_failed'].includes(order.status)) {
      return res.status(409).json({ success: false, message: 'คำสั่งซื้อนี้ไม่อยู่ในสถานะที่รับชำระเงิน' })
    }
    if (!order.paymentQrExpiresAt || new Date(order.paymentQrExpiresAt).getTime() <= Date.now()) {
      return res.status(409).json({
        success: false,
        message: 'QR ชำระเงินหมดอายุแล้ว กรุณาสร้าง QR ใหม่ก่อนตรวจสอบสลิป'
      })
    }

    const qrAccount = normalizePromptPayAccount(order.paymentMethod?.promptPayAccount)
    const configuredAccount = normalizePromptPayAccount(process.env.PROMPTPAY_ACCOUNT_ID)
    if (qrAccount && configuredAccount && qrAccount !== configuredAccount) {
      return res.status(409).json({
        success: false,
        message: 'บัญชีรับเงินของร้านมีการเปลี่ยนแปลง กรุณาสร้างคิวอาร์ใหม่และชำระผ่านคิวอาร์ล่าสุดเท่านั้น'
      })
    }

    if (isDemo) {
      return res.status(400).json({
        success: false,
        message: 'ปิดการจำลองชำระเงินแล้ว กรุณาแนบสลิปการโอนเงินจริง'
      })
    }

    const targetAmount = Number(order.total)
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({ success: false, message: 'ยอดคำสั่งซื้อไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' })
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

      if (isReceivingAccountMismatch(errMsg)) {
        console.warn(
          `[SlipOK] Receiving account mismatch for order ${orderId}. Check that the SlipOK branch receiving account matches PROMPTPAY_ACCOUNT_ID and that the backend was restarted after configuration changes.`
        )
        return res.status(400).json({
          success: false,
          message: 'บัญชีปลายทางในสลิปไม่ตรงกับบัญชีรับเงินของร้าน ระบบจึงยังยืนยันรายการนี้ไม่ได้ กรุณาติดต่อร้านให้ตรวจสอบบัญชีปลายทางในคิวอาร์และระบบตรวจสอบสลิปก่อนทำรายการอีกครั้ง และอย่าโอนซ้ำ'
        })
      }

      return res.status(400).json({
        success: false,
        message: errMsg
      })
    }

    const slipData = result.data || {}
    const verifiedAmount = Number(slipData.amount)

    if (!Number.isFinite(verifiedAmount) || Math.abs(verifiedAmount - targetAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: Number.isFinite(verifiedAmount)
          ? `ยอดเงินในสลิปไม่ตรงกับยอดคำสั่งซื้อ (สลิป ฿${verifiedAmount.toLocaleString()} / ต้องชำระ ฿${targetAmount.toLocaleString()})`
          : 'ไม่พบยอดเงินที่ตรวจสอบได้ในสลิป กรุณาใช้สลิปตัวจริงที่อ่านชัดเจน'
      })
    }

    // SlipOK validates the receiving account for this API branch when log=true.
    // Its receiver.proxy.value is intentionally masked, so it cannot be compared
    // with the full PromptPay ID configured for QR generation.

    if (!slipData.transRef) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบเลขอ้างอิงธุรกรรมในสลิป กรุณาใช้สลิปตัวจริงที่ตรวจสอบได้'
      })
    }

    const duplicateTransfer = await Order.findOne({
      'paymentMethod.transactionId': slipData.transRef,
      orderId: { $ne: orderId },
      status: { $in: ['payment_success', 'preparing', 'processing_custom', 'pickup', 'shipping', 'delivered'] }
    })
    if (duplicateTransfer) {
      return res.status(400).json({
        success: false,
        message: 'สลิปนี้ถูกใช้กับคำสั่งซื้ออื่นแล้ว กรุณาแนบสลิปการโอนใหม่'
      })
    }

    const paidOrder = await Order.findOneAndUpdate(
      {
        orderId,
        status: { $in: ['pending_payment', 'checking_payment', 'payment_failed'] },
        paymentQrExpiresAt: { $gt: new Date() }
      },
      {
        $set: {
          status: 'payment_success',
          paymentProof: slipImageBase64,
          paymentMethod: {
            type: 'promptpay',
            brand: 'PromptPay QR (ตรวจสอบแล้ว)',
            transactionId: slipData.transRef
          }
        }
      },
      { new: true }
    )
    if (!paidOrder) {
      return res.status(409).json({
        success: false,
        message: 'ไม่สามารถยืนยันการชำระเงินได้ สถานะคำสั่งซื้อเปลี่ยนแล้วหรือ QR หมดอายุ กรุณาสร้าง QR ใหม่'
      })
    }

    for (const item of paidOrder.items) {
      if (item.name) {
        await Product.findOneAndUpdate(
          { name: item.name, stock: { $gt: 0 } },
          { $inc: { stock: -(item.quantity || 1) } }
        )
      }
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
