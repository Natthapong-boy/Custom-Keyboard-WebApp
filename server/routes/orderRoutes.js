import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js'

const router = express.Router()

router.route('/')
  .post(createOrder)
  .get(getOrders)

router.route('/:id')
  .get(getOrderById)
  .delete(cancelOrder)

router.patch('/:id/status', updateOrderStatus)

export default router
