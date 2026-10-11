import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import dns from 'dns'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  // Ignore if not permitted
}

const buildUriFromParts = () => {
  const user = process.env.DB_USER || process.env.MONGODB_USER
  const password = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MONGODB_PASSWORD
  const host = process.env.DB_HOST || process.env.DB_CLUSTER || 'cluster0.s9tq6pl.mongodb.net'
  const dbName = process.env.DB_NAME || 'KeyCraft'
  const appName = process.env.DB_APP_NAME || 'Cluster0'

  if (!user || !password) return null

  const encodedUser = encodeURIComponent(user)
  const encodedPass = encodeURIComponent(password)
  return `mongodb+srv://${encodedUser}:${encodedPass}@${host}/${dbName}?retryWrites=true&w=majority&appName=${appName}`
}

/**
 * Prefer DB_USER + DB_PASSWORD (what Compass uses) over a stale full URI.
 */
export const getMongoCandidates = () => {
  const candidates = []
  const fromParts = buildUriFromParts()
  if (fromParts) candidates.push(fromParts)
  if (process.env.MONGODB_URI) candidates.push(process.env.MONGODB_URI)
  if (process.env.MONGO_URI) candidates.push(process.env.MONGO_URI)
  return [...new Set(candidates)]
}

export const getMongoURI = () => getMongoCandidates()[0] || null

export const isDbConnected = () => mongoose.connection.readyState === 1

const connectWithUri = async (connUri) => {
  const maskedUri = connUri.replace(/:([^@]+)@/, ':****@')
  console.log(`🔌 [MongoDB] Connecting to: ${maskedUri}`)

  const conn = await mongoose.connect(connUri, {
    serverSelectionTimeoutMS: 12000,
    family: 4,
  })

  console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`)
  return conn
}

export const connectDB = async () => {
  const candidates = getMongoCandidates()
  if (candidates.length === 0) {
    console.warn('⚠️ [MongoDB] Neither MONGODB_URI nor (DB_USER & DB_PASSWORD) is set in .env.')
    return false
  }

  let lastError = null
  for (const uri of candidates) {
    try {
      await connectWithUri(uri)
      return true
    } catch (error) {
      lastError = error
      console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`)
      try {
        await mongoose.disconnect()
      } catch (e) {
        // ignore
      }
    }
  }

  console.error('❌ [MongoDB] All connection strings failed. Last error:', lastError?.message)
  return false
}
