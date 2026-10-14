import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Custom Keyboard'
  },
  brand: {
    type: String,
    default: 'Key Craft Labs'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  image: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  stock: {
    type: Number,
    default: 25
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.8
  },
  numReviews: {
    type: Number,
    default: 12
  },

  // === Keyboard & Part Specifications ===
  partType: {
    type: String,
    default: 'keyboard'
  },
  layout: {
    type: String,
    default: '75%'
  },
  mountType: {
    type: String,
    default: 'Gasket Mount'
  },
  caseMaterial: {
    type: String,
    default: '6063 CNC Anodized Aluminum'
  },
  switchType: {
    type: String,
    default: 'Linear (Red)'
  },
  switchSound: {
    type: String,
    default: 'click'
  },
  switchFeel: {
    type: String,
    default: 'Tactile / Clicky'
  },
  switchOperatingForce: {
    type: String,
    default: '50gf'
  },
  switchPreTravel: {
    type: String,
    default: '2.0mm'
  },
  switchTotalTravel: {
    type: String,
    default: '4.0mm'
  },
  switchAudioUrl: {
    type: String,
    default: ''
  },
  switchSoundTone: {
    type: String,
    default: 'Deep Thock'
  },
  switchLubed: {
    type: Boolean,
    default: false
  },
  keycaps: {
    type: String,
    default: 'PBT Double-Shot Cherry Profile'
  },
  connectivity: [{
    type: String,
    default: ['Type-C Wired', 'Bluetooth 5.0', '2.4GHz Wireless']
  }],
  hotSwappable: {
    type: Boolean,
    default: true
  },
  rgbBacklit: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Product', productSchema)
