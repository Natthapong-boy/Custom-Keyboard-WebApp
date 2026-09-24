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
    enum: ['Custom Keyboard', 'Switches', 'Keycaps', 'Cases & Plates', 'PCB & Kits', 'Accessories'],
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
    enum: ['keyboard', 'switch', 'keycap', 'case', 'plate', 'pcb', 'accessory'],
    default: 'keyboard'
  },
  layout: {
    type: String,
    enum: ['60%', '65%', '75%', 'TKL (80%)', 'Full Size (100%)', 'Alice / Ergo', 'N/A'],
    default: '75%'
  },
  mountType: {
    type: String,
    enum: ['Gasket Mount', 'Top Mount', 'Tray Mount', 'Sandwich Mount', 'Integrated'],
    default: 'Gasket Mount'
  },
  caseMaterial: {
    type: String,
    default: '6063 CNC Anodized Aluminum'
  },
  switchType: {
    type: String,
    default: 'Blue Clicky'
  },
  switchSound: {
    type: String,
    enum: ['click', 'linear', 'soft', 'thock', 'creamy', 'clack'],
    default: 'click'
  },
  switchFeel: {
    type: String,
    default: 'Tactile / Clicky'
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
