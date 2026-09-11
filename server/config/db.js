import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI
    if (!connUri) {
      console.warn('⚠️ [MongoDB] MONGODB_URI is not set in .env. Running without Atlas DB connection.')
      return
    }

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    })

    console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host} / DB: ${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`)
  }
}
