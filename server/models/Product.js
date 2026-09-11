import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  switchType: {
    type: String,
    default: 'Blue Clicky'
  },
  switchSound: {
    type: String,
    enum: ['click', 'linear', 'soft'],
    default: 'click'
  },
  desc: {
    type: String
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Product', productSchema)
