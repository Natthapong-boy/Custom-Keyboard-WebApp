import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import dns from 'dns'
import { fileURLToPath } from 'url'

// Ensure .env is loaded whether run from server/ or root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

// Fix for Windows DNS SRV lookup (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  // Ignore if not permitted
}

/**
 * Builds MongoDB Connection URI flexibly based on environment variables.
 * Supports either a complete URI (MONGODB_URI / MONGO_URI)
 * or individual developer credentials (DB_USER, DB_PASSWORD, etc.)
 */
export const getMongoURI = () => {
  // 1. If full connection URI is provided
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  if (process.env.MONGO_URI) return process.env.MONGO_URI

  // 2. If separate credentials are provided (Best for team collaboration)
  const user = process.env.DB_USER || process.env.MONGODB_USER
  const password = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MONGODB_PASSWORD
  const host = process.env.DB_HOST || process.env.DB_CLUSTER || 'cluster0.s9tq6pl.mongodb.net'
  const dbName = process.env.DB_NAME || 'KeyCraft'
  const appName = process.env.DB_APP_NAME || 'Cluster0'

  if (user && password) {
    const encodedUser = encodeURIComponent(user)
    const encodedPass = encodeURIComponent(password)
    return `mongodb+srv://${encodedUser}:${encodedPass}@${host}/${dbName}?appName=${appName}`
  }

  return null
}

export const connectDB = async () => {
  try {
    const connUri = getMongoURI()
    if (!connUri) {
      console.warn('⚠️ [MongoDB] Neither MONGODB_URI nor (DB_USER & DB_PASSWORD) is set in .env.')
      console.warn('👉 Please configure your .env file with your credentials.')
      return
    }

    // Mask password when logging for security
    const maskedUri = connUri.replace(/:([^@]+)@/, ':****@')
    console.log(`🔌 [MongoDB] Connecting to: ${maskedUri}`)

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 8000,
    })

    console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`)
  }
}
