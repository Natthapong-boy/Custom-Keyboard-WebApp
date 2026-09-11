import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specs: { type: String },
  switchSound: { type: String, default: 'click' },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String }
})

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
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
    country: { type: String, default: 'United States' }
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'payment_confirmed',
      'machining',
      'soldering_lubing',
      'acoustic_qc',
      'in_transit',
      'delivered',
      'cancelled'
    ],
    default: 'payment_confirmed'
  },
  paymentMethod: {
    type: { type: String, default: 'card' },
    last4: { type: String },
    brand: { type: String, default: 'Visa' },
    transactionId: { type: String }
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
