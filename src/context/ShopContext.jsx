import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  fetchProducts,
  fetchOrders,
  createRemoteOrder,
  updateRemoteOrderStatus,
  uploadPaymentProofApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  fetchAllUsersApi,
  updateUserRoleApi,
  loginUserApi,
  registerUserApi
} from '../services/api'

const ShopContext = createContext()

// Order Stages aligned 100% with Diagram 1 & Diagram 3
export const ORDER_STAGES = [
  {
    id: 'pending_payment',
    label: 'รอชำระเงิน',
    desc: 'สร้างคำสั่งซื้อแล้ว อยู่ระหว่างรอลูกค้าโอนเงินชำระสินค้า',
    icon: '💳',
    color: '#8b5cf6',
    step: 1
  },
  {
    id: 'checking_payment',
    label: 'รอตรวจสอบการชำระเงิน',
    desc: 'ลูกค้าแนบหลักฐานการโอนแล้ว รอเจ้าหน้าที่ตรวจสอบสลิป',
    icon: '🔍',
    color: '#f59e0b',
    step: 2
  },
  {
    id: 'payment_failed',
    label: 'การชำระเงินล้มเหลว',
    desc: 'การตรวจสอบสลิปไม่ผ่าน กรุณาทำรายการหรือแนบสลิปใหม่',
    icon: '❌',
    color: '#ef4444',
    step: 2
  },
  {
    id: 'payment_success',
    label: 'ชำระเงินสำเร็จ (ล็อคคำสั่งซื้อ)',
    desc: 'ตรวจสอบยอดเงินเรียบร้อย ระบบล็อคคำสั่งซื้อและตัดสต็อกในคลัง',
    icon: '✅',
    color: '#10b981',
    step: 3
  },
  {
    id: 'preparing',
    label: 'กำลังเตรียมสินค้า',
    desc: 'พนักงานกำลังจัดเตรียมอุปกรณ์และชิ้นส่วนตามคำสั่งซื้อ',
    icon: '📦',
    color: '#6366f1',
    step: 4
  },
  {
    id: 'processing_custom',
    label: 'กำลังดำเนินการ (ประกอบเอง)',
    desc: 'ช่างฝีมือดำเนินการประกอบ ปรับแต่ง Lube สวิตช์ และจูนเสียงตามสั่ง',
    icon: '🛠️',
    color: '#7c3aed',
    step: 4
  },
  {
    id: 'pickup',
    label: 'ขนส่งเข้ามารับ',
    desc: 'สินค้าแพ็กเรียบร้อย อยู่ระหว่างรอเจ้าหน้าที่ขนส่งเข้ารับพัสดุ',
    icon: '🚛',
    color: '#3b82f6',
    step: 5
  },
  {
    id: 'shipping',
    label: 'กำลังจัดส่ง',
    desc: 'พัสดุอยู่ระหว่างการนำจ่ายโดยบริษัทขนส่งเอกชน',
    icon: '🚚',
    color: '#06b6d4',
    step: 6
  },
  {
    id: 'delivered',
    label: 'จัดส่งสำเร็จ',
    desc: 'ลูกค้าได้รับคีย์บอร์ดเรียบร้อยแล้ว พิมพ์ใบเสร็จได้ทันที',
    icon: '🎉',
    color: '#059669',
    step: 7
  }
]

export const DEMO_ROLES = [
  {
    role: 'customer',
    name: 'ณัฐพงษ์ (ลูกค้า)',
    email: 'customer@customkb.com',
    desc: 'ลูกค้าทั่วไป: ช้อปคีย์บอร์ด, ปรับแต่งเอง, ติดตามสถานะ, ดูใบเสร็จ'
  },
  {
    role: 'staff',
    name: 'สมศรี (พนักงานร้าน)',
    email: 'staff@customkb.com',
    desc: 'พนักงาน: ตรวจสอบการชำระเงิน, เปลี่ยนสถานะคำสั่งซื้อ, ตัดสต็อก, จัดการสินค้า'
  },
  {
    role: 'owner',
    name: 'สมชาย (เจ้าของร้าน/Admin)',
    email: 'owner@customkb.com',
    desc: 'เจ้าของร้าน: ดูรายงานรายได้/สินค้าขายดี/สินค้าใกล้หมดสต็อก, กำหนดสิทธิ์'
  }
]

export function ShopProvider({ children }) {
  // 1. Database Products state
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 2. Database Orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // 3. User Authentication state (Session)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kc_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      _id: 'usr-cust-003',
      name: 'ณัฐพงษ์ (ลูกค้า)',
      email: 'customer@customkb.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    }
  })

  // 4. Cart state (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kc_cart')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return []
  })

  // 5. System Users (for Owner Role Management per Diagram 2)
  const [allUsers, setAllUsers] = useState([])

  // Refresh products from MongoDB
  const refreshProducts = useCallback(async (filters = {}) => {
    setLoadingProducts(true)
    const data = await fetchProducts(filters)
    if (data && Array.isArray(data)) {
      setProducts(data)
    }
    setLoadingProducts(false)
  }, [])

  // Refresh orders from MongoDB
  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true)
    const data = await fetchOrders()
    if (data && Array.isArray(data)) {
      setOrders(data)
    }
    setLoadingOrders(false)
  }, [])

  // Refresh users from MongoDB
  const refreshUsers = useCallback(async () => {
    try {
      const data = await fetchAllUsersApi()
      if (data && Array.isArray(data)) {
        setAllUsers(data)
      }
    } catch (e) {
      console.warn('Failed loading all users:', e)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshProducts()
    refreshOrders()
    refreshUsers()
  }, [refreshProducts, refreshOrders, refreshUsers])

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart))
  }, [cart])

  // Save user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kc_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('kc_user')
    }
  }, [currentUser])

  // Cart operations
  const addToCart = (productItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === productItem.id || (i._id && i._id === productItem._id)
      )
      if (existing) {
        return prev.map((i) =>
          (i.id === productItem.id || (i._id && i._id === productItem._id))
            ? { ...i, quantity: (i.quantity || 1) + (productItem.quantity || 1) }
            : i
        )
      }
      return [...prev, { ...productItem, quantity: productItem.quantity || 1 }]
    })
  }

  const updateCartQty = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        (item.id === itemId || item._id === itemId) ? { ...item, quantity } : item
      )
    )
  }

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId && item._id !== itemId))
  }

  const clearCart = () => setCart([])

  // Order submission (Directly saves to MongoDB Atlas)
  const placeOrder = async (orderPayload) => {
    const payload = {
      ...orderPayload,
      user: currentUser?._id
    }
    const created = await createRemoteOrder(payload)
    if (created) {
      await refreshOrders()
      clearCart()
      return created
    }
    throw new Error('ไม่สามารถบันทึกคำสั่งซื้อไปยังฐานข้อมูลได้')
  }

  // Update order status (Staff / System per Diagram 2 & 3)
  const updateOrderStatus = async (orderId, newStatus, paymentProof = null) => {
    const updated = await updateRemoteOrderStatus(orderId, newStatus, paymentProof)
    if (updated) {
      await refreshOrders()
      await refreshProducts() // Stock may have changed
      return updated
    }
    throw new Error('ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้')
  }

  // Upload payment proof slip (Customer per Diagram 3)
  const uploadPaymentProof = async (orderId, proofString) => {
    const updated = await uploadPaymentProofApi(orderId, proofString)
    if (updated) {
      await refreshOrders()
      return updated
    }
    throw new Error('ไม่สามารถแนบสลิปการโอนเงินได้')
  }

  // Product CRUD (Staff per Diagram 2)
  const addProduct = async (productData) => {
    const res = await createProductApi(productData)
    await refreshProducts()
    return res
  }

  const editProduct = async (id, productData) => {
    const res = await updateProductApi(id, productData)
    await refreshProducts()
    return res
  }

  const removeProduct = async (id) => {
    const res = await deleteProductApi(id)
    await refreshProducts()
    return res
  }

  // Role management (Owner per Diagram 2)
  const changeUserRole = async (userId, newRole) => {
    const res = await updateUserRoleApi(userId, newRole)
    await refreshUsers()
    if (currentUser?._id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }))
    }
    return res
  }

  // Quick switch role for seamless testing
  const switchRole = (role) => {
    const roleInfo = {
      customer: {
        _id: 'usr-cust-003',
        name: 'ณัฐพงษ์ (ลูกค้า)',
        email: 'customer@customkb.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      },
      staff: {
        _id: 'usr-staff-002',
        name: 'สมศรี (พนักงานร้าน)',
        email: 'staff@customkb.com',
        role: 'staff',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      owner: {
        _id: 'usr-owner-001',
        name: 'สมชาย (เจ้าของร้าน)',
        email: 'owner@customkb.com',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }
    }
    if (roleInfo[role]) {
      setCurrentUser(roleInfo[role])
    }
  }

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await loginUserApi({ email, password })
      if (data && data._id) {
        const u = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar
        }
        setCurrentUser(u)
        return u
      }
    } catch (e) {
      throw e
    }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        loadingProducts,
        refreshProducts,
        orders,
        loadingOrders,
        refreshOrders,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        logout,
        placeOrder,
        updateOrderStatus,
        uploadPaymentProof,
        addProduct,
        editProduct,
        removeProduct,
        allUsers,
        refreshUsers,
        changeUserRole
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}
