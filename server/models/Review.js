import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  soundExperience: {
    type: String,
    enum: ['thock', 'clack', 'clicky', 'silent', 'creamy']
  },
  verifiedPurchase: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Review', reviewSchema)
