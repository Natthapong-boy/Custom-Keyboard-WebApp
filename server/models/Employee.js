import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const employeeSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String },
  avatar: { type: String },
  phone: { type: String, default: '' },
  role: { type: String, default: 'staff' },
  lastLogin: { type: Date }
}, {
  collection: 'employees',
  strict: false
})

employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password || /^\$2[aby]\$\d\d\$/.test(this.password)) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

employeeSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false
  if (/^\$2[aby]\$\d\d\$/.test(this.password)) {
    return bcrypt.compare(enteredPassword, this.password)
  }
  if (this.password !== enteredPassword) return false

  this.password = await bcrypt.hash(enteredPassword, await bcrypt.genSalt(10))
  return true
}

export default mongoose.model('Employee', employeeSchema)
