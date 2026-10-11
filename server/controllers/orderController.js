import Order from '../models/Order.js'
import Product from '../models/Product.js'

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      customer,
      items,
      paymentMethod,
      paymentProof,
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
    const trackingNumber = `TH-KERRY-${Math.floor(1000000 + Math.random() * 9000000)}`
    const estimatedDelivery = new Date(Date.now() + 3 * 86400000).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

    const initialStatus = paymentProof ? 'checking_payment' : 'pending_payment'

    const order = new Order({
      orderId,
      orderType: orderType || 'prebuilt',
      user: req.user ? req.user._id : undefined,
      customer,
      items,
      paymentMethod: paymentMethod || { type: 'promptpay', brand: 'PromptPay QR' },
      paymentProof: paymentProof || '',
      subtotal,
      discount: discount || 0,
      shipping: shipping || 0,
      total,
      trackingNumber,
      estimatedDelivery,
      notes,
      status: initialStatus
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

// @desc    Update order lifecycle status & deduct stock on payment_success
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentProof } = req.body
    const order = await Order.findOne({ orderId: req.params.id })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const previousStatus = order.status
    order.status = status
    if (paymentProof) {
      order.paymentProof = paymentProof
    }

    // According to Diagram 3: ล็อคคำสั่งซื้อ -> ตัดสต็อคสินค้าในคลัง
    if (status === 'payment_success' && previousStatus !== 'payment_success') {
      for (const item of order.items) {
        if (item.name) {
          // Decrement stock if matching product found
          await Product.findOneAndUpdate(
            { name: item.name, stock: { $gt: 0 } },
            { $inc: { stock: - (item.quantity || 1) } }
          )
        }
      }
    }

    const updated = await order.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Attach payment proof / slip
// @route   PATCH /api/orders/:id/payment-proof
export const uploadPaymentProof = async (req, res) => {
  try {
    const { paymentProof } = req.body
    const order = await Order.findOne({ orderId: req.params.id })

    if (order) {
      order.paymentProof = paymentProof
      order.status = 'checking_payment' // Move to checking_payment per Diagram 1 & 3
      const updated = await order.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order full details
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
      if (req.body.paymentProof !== undefined) order.paymentProof = req.body.paymentProof

      const updated = await order.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Order not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get Owner Reports (รายได้, สินค้าขายดี, สินค้าใกล้หมดสต็อก ตาม Diagram 2)
// @route   GET /api/orders/reports/all
export const getOwnerReports = async (req, res) => {
  try {
    const orders = await Order.find({})
    const products = await Product.find({})

    // 1. รายงานรายได้ (Revenue)
    const totalRevenue = orders
      .filter(o => o.status !== 'payment_failed')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const processingOrders = orders.filter(o =>
      ['payment_success', 'preparing', 'processing_custom', 'pickup', 'shipping'].includes(o.status)
    ).length
    const pendingPaymentOrders = orders.filter(o =>
      ['pending_payment', 'checking_payment'].includes(o.status)
    ).length

    // 2. รายงานสินค้าขายดี (Best Sellers)
    const productSales = {}
    orders.forEach(order => {
      if (order.status !== 'payment_failed') {
        order.items.forEach(item => {
          const key = item.name
          if (!productSales[key]) {
            productSales[key] = {
              name: item.name,
              unitsSold: 0,
              totalSales: 0,
              image: item.image || ''
            }
          }
          productSales[key].unitsSold += (item.quantity || 1)
          productSales[key].totalSales += ((item.price || 0) * (item.quantity || 1))
        })
      }
    })

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)

    // 3. รายงานสินค้าใกล้หมดสต็อก (Low Stock)
    const lowStockProducts = products
      .filter(p => (p.stock || 0) <= 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        price: p.price,
        image: p.image
      }))

    res.json({
      revenue: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders,
        processingOrders,
        pendingPaymentOrders
      },
      bestSellers,
      lowStockProducts
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
