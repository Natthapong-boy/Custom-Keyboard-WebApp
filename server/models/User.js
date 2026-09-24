import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  subdistrict: { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  phone: {
    type: String,
    default: ''
  },
  shippingAddress: addressSchema,
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['customer', 'staff', 'artisan', 'admin', 'owner'],
    default: 'customer'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Password verification helper
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
