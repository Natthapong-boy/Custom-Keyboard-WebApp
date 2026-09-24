import express from 'express'
import { getProducts, getProductById, seedDatabase } from '../controllers/productController.js'

const router = express.Router()

router.get('/', getProducts)
router.post('/seed', seedDatabase)
router.get('/:id', getProductById)

export default router
