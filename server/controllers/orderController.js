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

// @desc    Update order full details (address, tracking, notes)
// @route   PUT /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id })
    if (order) {
      if (req.body.customer) order.customer = { ...order.customer, ...req.body.customer }
      if (req.body.trackingNumber !== undefined) order.trackingNumber = req.body.trackingNumber
      if (req.body.estimatedDelivery !== undefined) order.estimatedDelivery = req.body.estimatedDelivery
      if (req.body.notes !== undefined) order.notes = req.body.notes
      if (req.body.status !== undefined) order.status = req.body.status
      
      const updated = await order.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard metrics & revenue stats
// @route   GET /api/orders/stats/summary
export const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find({})
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length
    
    // Status breakdown
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    res.json({
      totalRevenue,
      totalOrders,
      activeOrders,
      statusCounts
    })
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

