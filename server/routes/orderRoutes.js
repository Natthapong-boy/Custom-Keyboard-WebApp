import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  uploadPaymentProof,
  updateOrder,
  getOwnerReports,
  cancelOrder
} from '../controllers/orderController.js'
import { optionalProtect, protect, requireOwner } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', optionalProtect, createOrder)
router.get('/', optionalProtect, getOrders)
router.get('/reports/all', protect, requireOwner, getOwnerReports)
router.get('/:id', optionalProtect, getOrderById)
router.patch('/:id/status', updateOrderStatus)
router.patch('/:id/payment-proof', optionalProtect, uploadPaymentProof)
router.put('/:id', updateOrder)
router.delete('/:id', protect, cancelOrder)

export default router
