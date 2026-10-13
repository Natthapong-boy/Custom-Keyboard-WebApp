import express from 'express'
import {
  getProducts,
  getProductById,
  getStoredProductImage,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js'

const router = express.Router()

router.get('/images/:id', getStoredProductImage)
router.get('/', getProducts)
router.post('/', createProduct)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
