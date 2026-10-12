import express from 'express'
import {
  getProducts,
  getProductById,
  getStoredProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDatabase
} from '../controllers/productController.js'

const router = express.Router()

router.get('/images/:id', getStoredProductImage)
router.get('/', getProducts)
router.post('/', createProduct)
router.post('/seed', seedDatabase)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
