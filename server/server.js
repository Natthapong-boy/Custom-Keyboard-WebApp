import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB, isDbConnected } from './config/db.js'
import { migrateLegacyProductImagesToGridFS } from './controllers/productController.js'

// Route Imports
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import productRoutes from './routes/productRoutes.js'

import path from 'path'
import { fileURLToPath } from 'url'

// Middleware Imports
import { notFound, errorHandler } from './middlewares/errorHandler.js'

// Load .env from server directory or project root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// Connect to MongoDB Atlas
connectDB().then(async (ok) => {
  if (ok) {
    await migrateLegacyProductImagesToGridFS()
  }
}).catch((error) => {
  console.error('❌ [MongoDB initialization error]:', error.message)
})

const app = express()

// Standard Middlewares
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/images', express.static(path.resolve(__dirname, '../public/images')))

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Key Craft API Server is running successfully!',
    frontendUrl: 'http://localhost:5173',
    healthCheck: 'http://localhost:5000/api/health'
  })
})

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: isDbConnected() ? 'ok' : 'degraded',
    service: 'Key Craft Custom Keyboard API',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/products', productRoutes)

// Error Handling Middlewares
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const WEB_URL = 'http://localhost:5173/'

const server = app.listen(PORT, () => {
  console.log(`🚀 [Key Craft Server] Running on http://localhost:${PORT}`)
  console.log(`📡 [Health Check]: http://localhost:${PORT}/api/health`)
  console.log(`🌐 [Website]: ${WEB_URL}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ℹ️  API is already running on http://localhost:${PORT}`)
    console.log(`🌐 Open the website here: ${WEB_URL}`)
    process.exit(0)
  }
  throw err
})
