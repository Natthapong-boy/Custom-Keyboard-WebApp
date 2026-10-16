import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Product from '../models/Product.js'

await connectDB()

const result = await Product.updateMany(
  { category: 'Accessories' },
  { $set: { category: 'Plate Material' } }
)

console.log(`Updated ${result.modifiedCount} items from "Accessories" to "Plate Material".`)

const plates = await Product.find({ category: 'Plate Material' })
console.log(`Current items in "Plate Material" (${plates.length}):`)
plates.forEach(p => console.log(`- ${p.name} | category: "${p.category}" | partType: "${p.partType}"`))

await mongoose.disconnect()
