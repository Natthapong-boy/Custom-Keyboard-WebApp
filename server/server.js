import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { seedDatabase } from './config/seedData.js'

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

// Connect to MongoDB Atlas & Seed Default Accounts
connectDB().then(() => {
  seedDatabase()
})

const app = express()

// Standard Middlewares
app.use(cors())
app.use(express.json())

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Key Craft Custom Keyboard API',
    database: 'MongoDB Atlas',
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

app.listen(PORT, () => {
  console.log(`🚀 [Key Craft Server] Running on http://localhost:${PORT}`)
  console.log(`📡 [Health Check]: http://localhost:${PORT}/api/health`)
})
