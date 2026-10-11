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

const router = express.Router()

router.post('/', createOrder)
router.get('/', getOrders)
router.get('/reports/all', getOwnerReports)
router.get('/:id', getOrderById)
router.patch('/:id/status', updateOrderStatus)
router.patch('/:id/payment-proof', uploadPaymentProof)
router.put('/:id', updateOrder)
router.delete('/:id', cancelOrder)

export default router
