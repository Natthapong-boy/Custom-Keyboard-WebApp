import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specs: { type: String },
  switchSound: { type: String, default: 'click' },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String },
  selectedParts: [{
    type: { type: String },
    name: { type: String },
    image: { type: String },
    color: { type: String },
    price: { type: Number, default: 0 }
  }]
})

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  orderType: {
    type: String,
    enum: ['prebuilt', 'custom'],
    default: 'prebuilt'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String, required: true },
    country: { type: String, default: 'Thailand' }
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'pending_payment',       // รอชำระเงิน
      'checking_payment',      // รอตรวจสอบการชำระเงิน
      'payment_failed',        // การชำระเงินล้มเหลว
      'cancelled',              // ยกเลิกคำสั่งซื้อ
      'payment_success',       // ชำระเงินสำเร็จ (ระบบล็อคคำสั่งซื้อ)
      'preparing',             // กำลังเตรียมสินค้า
      'processing_custom',     // กำลังดำเนินการ (ประกอบเอง)
      'pickup',                // ขนส่งเข้ามารับ
      'shipping',              // กำลังจัดส่ง
      'delivered'              // จัดส่งสำเร็จ
    ],
    default: 'pending_payment'
  },
  paymentMethod: {
    type: { type: String, default: 'bank_transfer' },
    last4: { type: String },
    brand: { type: String, default: 'PromptPay / Bank Transfer' },
    transactionId: { type: String },
    promptPayAccount: { type: String }
  },
  paymentQrExpiresAt: { type: Date },
  paymentProof: {
    type: String, // Slip image URL or base64 data
    default: ''
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  trackingNumber: { type: String },
  estimatedDelivery: { type: String },
  notes: { type: String }
}, {
  timestamps: true
})

export default mongoose.model('Order', orderSchema)
