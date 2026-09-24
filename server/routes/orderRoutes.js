import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrder,
  getDashboardStats,
  cancelOrder
} from '../controllers/orderController.js'

const router = express.Router()

router.get('/stats/summary', getDashboardStats)

router.route('/')
  .post(createOrder)
  .get(getOrders)

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(cancelOrder)

router.patch('/:id/status', updateOrderStatus)

export default router

