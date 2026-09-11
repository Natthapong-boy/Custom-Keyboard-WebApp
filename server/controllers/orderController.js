import Order from '../models/Order.js'

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod,
      subtotal,
      discount,
      shipping,
      total,
      notes
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    const orderId = `KC-${Math.floor(10000 + Math.random() * 90000)}`
    const trackingNumber = `DHL-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`
    const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const order = new Order({
      orderId,
      user: req.user ? req.user._id : undefined,
      customer,
      items,
      paymentMethod,
      subtotal,
      discount: discount || 0,
      shipping: shipping || 0,
      total,
      trackingNumber,
      estimatedDelivery,
      notes,
      status: 'payment_confirmed'
    })

    const createdOrder = await order.save()
    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single order by orderId
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id })
    if (order) {
      res.json(order)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order lifecycle status
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findOne({ orderId: req.params.id })

    if (order) {
      order.status = status
      const updated = await order.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Cancel order
// @route   DELETE /api/orders/:id
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id })
    if (order) {
      await order.deleteOne()
      res.json({ message: 'Order removed successfully' })
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
