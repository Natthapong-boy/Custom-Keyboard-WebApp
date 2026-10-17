import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { canAccessOrder, getOrderAccessFilter } from '../utils/orderAccess.js'

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
    const accessFilter = getOrderAccessFilter(req)
    if (!accessFilter) return res.json([])

    const orders = await Order.find(accessFilter).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single order by orderId
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const accessFilter = getOrderAccessFilter(req)
    if (!accessFilter) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อ' })
    }

    const order = await Order.findOne({ orderId: req.params.id })
    if (order && canAccessOrder(order, req)) {
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
    if (!req.user) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบเพื่อแนบหลักฐานการโอน' })
    }

    const { paymentProof } = req.body
    const order = await Order.findOne({ orderId: req.params.id })

    if (order && canAccessOrder(order, req)) {
      order.paymentProof = paymentProof
      order.status = 'checking_payment' // Move to checking_payment per Diagram 1 & 3
      const updated = await order.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'ไม่พบคำสั่งซื้อหรือไม่มีสิทธิ์เข้าถึง' })
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
    const yearParam = req.query.year
    const monthParam = req.query.month
    const year = yearParam && yearParam !== 'all' ? Number(yearParam) : null
    const month = monthParam && monthParam !== 'all' ? Number(monthParam) : null

    if (
      (year !== null && (!Number.isInteger(year) || year < 2000 || year > 9999)) ||
      (month !== null && (!Number.isInteger(month) || month < 1 || month > 12))
    ) {
      return res.status(400).json({ message: 'ตัวกรองเดือนหรือปีไม่ถูกต้อง' })
    }

    const orders = await Order.find({})
    const products = await Product.find({})
    const availableYears = [...new Set(orders
      .map(order => new Date(order.createdAt).getUTCFullYear())
      .filter(orderYear => Number.isInteger(orderYear)))]
      .sort((a, b) => b - a)
    const reportOrders = orders.filter(order => {
      const createdAt = new Date(order.createdAt)
      return !Number.isNaN(createdAt.getTime()) &&
        (year === null || createdAt.getUTCFullYear() === year) &&
        (month === null || createdAt.getUTCMonth() + 1 === month)
    })

    // 1. รายงานรายได้ (Revenue)
    const totalRevenue = reportOrders
      .filter(o => o.status !== 'payment_failed')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    const completedOrders = reportOrders.filter(o => o.status === 'delivered').length
    const processingOrders = reportOrders.filter(o =>
      ['payment_success', 'preparing', 'processing_custom', 'pickup', 'shipping'].includes(o.status)
    ).length
    const pendingPaymentOrders = reportOrders.filter(o =>
      ['pending_payment', 'checking_payment'].includes(o.status)
    ).length

    // 2. รายงานสินค้าขายดี (Best Sellers)
    const productSales = {}
    reportOrders.forEach(order => {
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
        totalOrders: reportOrders.length,
        completedOrders,
        processingOrders,
        pendingPaymentOrders
      },
      bestSellers,
      lowStockProducts,
      availableYears
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
    if (!order || !canAccessOrder(order, req)) {
      return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อหรือไม่มีสิทธิ์เข้าถึง' })
    }

    if (req.accountType === 'employee' || ['owner', 'ceo', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'บัญชีพนักงานไม่สามารถยกเลิกคำสั่งซื้อแทนลูกค้าได้' })
    }

    const paidStatuses = ['payment_success', 'preparing', 'processing_custom', 'pickup', 'shipping', 'delivered']
    if (paidStatuses.includes(order.status)) {
      return res.status(409).json({ message: 'ไม่สามารถยกเลิกได้ เนื่องจากคำสั่งซื้อชำระเงินสำเร็จแล้ว' })
    }
    if (order.status === 'cancelled') {
      return res.status(409).json({ message: 'คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว' })
    }

    const cancelledOrder = await Order.findOneAndUpdate(
      {
        orderId: req.params.id,
        status: { $in: ['pending_payment', 'checking_payment', 'payment_failed'] }
      },
      { $set: { status: 'cancelled' } },
      { new: true }
    )
    if (!cancelledOrder) {
      return res.status(409).json({ message: 'ไม่สามารถยกเลิกได้ เนื่องจากสถานะคำสั่งซื้อเปลี่ยนแปลงแล้ว' })
    }

    return res.json({ message: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว', order: cancelledOrder })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
