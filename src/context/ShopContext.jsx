import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
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
  createStaffApi,
  deleteUserApi,
  updateUserApi,
  loginUserApi,
  registerUserApi
} from '../services/api'
import { isOwnerRole } from '../utils/roles'

const ShopContext = createContext()

// Order Stages aligned 100% with Diagram 1 & Diagram 3
export const ORDER_STAGES = [
  {
    id: 'pending_payment',
    label: 'รอชำระเงิน',
    desc: 'สร้างคำสั่งซื้อแล้ว อยู่ระหว่างรอลูกค้าโอนเงินชำระสินค้า',
    icon: 'creditCard',
    color: '#8b5cf6',
    step: 1
  },
  {
    id: 'checking_payment',
    label: 'รอตรวจสอบการชำระเงิน',
    desc: 'ลูกค้าแนบหลักฐานการโอนแล้ว รอเจ้าหน้าที่ตรวจสอบสลิป',
    icon: 'search',
    color: '#f59e0b',
    step: 2
  },
  {
    id: 'payment_failed',
    label: 'การชำระเงินล้มเหลว',
    desc: 'การตรวจสอบสลิปไม่ผ่าน กรุณาทำรายการหรือแนบสลิปใหม่',
    icon: 'circleX',
    color: '#ef4444',
    step: 2
  },
  {
    id: 'cancelled',
    label: 'ยกเลิกคำสั่งซื้อแล้ว',
    desc: 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว',
    icon: 'circleX',
    color: '#64748b',
    step: 0
  },
  {
    id: 'payment_success',
    label: 'ชำระเงินสำเร็จ (ล็อคคำสั่งซื้อ)',
    desc: 'ตรวจสอบยอดเงินเรียบร้อย ระบบล็อคคำสั่งซื้อและตัดสต็อกในคลัง',
    icon: 'circleCheck',
    color: '#10b981',
    step: 3
  },
  {
    id: 'preparing',
    label: 'กำลังเตรียมสินค้า',
    desc: 'พนักงานกำลังจัดเตรียมอุปกรณ์และชิ้นส่วนตามคำสั่งซื้อ',
    icon: 'package',
    color: '#6366f1',
    step: 4
  },
  {
    id: 'processing_custom',
    label: 'กำลังดำเนินการ (ประกอบเอง)',
    desc: 'ช่างฝีมือดำเนินการประกอบ ปรับแต่ง Lube สวิตช์ และจูนเสียงตามสั่ง',
    icon: 'wrench',
    color: '#7c3aed',
    step: 4
  },
  {
    id: 'pickup',
    label: 'ขนส่งเข้ามารับ',
    desc: 'สินค้าแพ็กเรียบร้อย อยู่ระหว่างรอเจ้าหน้าที่ขนส่งเข้ารับพัสดุ',
    icon: 'truck',
    color: '#3b82f6',
    step: 5
  },
  {
    id: 'shipping',
    label: 'กำลังจัดส่ง',
    desc: 'พัสดุอยู่ระหว่างการนำจ่ายโดยบริษัทขนส่งเอกชน',
    icon: 'truck',
    color: '#06b6d4',
    step: 6
  },
  {
    id: 'delivered',
    label: 'จัดส่งสำเร็จ',
    desc: 'ลูกค้าได้รับคีย์บอร์ดเรียบร้อยแล้ว พิมพ์ใบเสร็จได้ทันที',
    icon: 'badgeCheck',
    color: '#059669',
    step: 7
  }
]

export function ShopProvider({ children }) {
  const location = useLocation()
  // 1. Database Products state
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 2. Database Orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Keep authentication per tab so a customer and owner can use separate tabs.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('kc_user')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
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

  // Refresh products from MongoDB (always keeps full inventory catalog in global state)
  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true)
    const data = await fetchProducts()
    if (data && Array.isArray(data)) {
      setProducts(data)
    }
    setLoadingProducts(false)
  }, [])

  // Refresh orders from MongoDB
  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      if (!currentUser?.token) {
        setOrders([])
        return
      }
      const data = await fetchOrders(currentUser.token)
      if (data && Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
      }
    } finally {
      setLoadingOrders(false)
    }
  }, [currentUser?.token])

  // Refresh users from MongoDB
  const refreshUsers = useCallback(async () => {
    try {
      if (!isOwnerRole(currentUser?.role) || !currentUser.token) {
        setAllUsers([])
        return
      }
      const data = await fetchAllUsersApi(currentUser.token)
      if (data && Array.isArray(data)) {
        setAllUsers(data)
      }
    } catch (e) {
      console.warn('Failed loading all users:', e)
    }
  }, [currentUser])

  // Load the full catalog only on screens that use the complete inventory.
  useEffect(() => {
    if (location.pathname === '/designer' || location.pathname === '/admin/products') {
      refreshProducts()
    }
  }, [location.pathname, refreshProducts])

  // Initial load
  useEffect(() => {
    refreshOrders()
    refreshUsers()
  }, [refreshOrders, refreshUsers])

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart))
  }, [cart])

  // Save current user session changes
  useEffect(() => {
    localStorage.removeItem('kc_user')
    if (currentUser) {
      sessionStorage.setItem('kc_user', JSON.stringify(currentUser))
    } else {
      sessionStorage.removeItem('kc_user')
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
    const created = await createRemoteOrder(payload, currentUser?.token)
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
    if (!isOwnerRole(currentUser?.role) || !currentUser.token) {
      throw new Error('ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของร้าน')
    }
    const res = await updateUserRoleApi(userId, newRole, currentUser.token)
    await refreshUsers()
    if (currentUser?._id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }))
    }
    return res
  }

  // Create new staff account (Owner only per Diagram 2)
  const addStaff = async (staffData) => {
    if (!isOwnerRole(currentUser?.role) || !currentUser.token) {
      throw new Error('ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของร้าน')
    }
    const res = await createStaffApi(staffData, currentUser.token)
    await refreshUsers()
    return res
  }

  // Delete user account (Owner only - Customers & Staff only per Diagram 2)
  const deleteUser = async (userId) => {
    if (!isOwnerRole(currentUser?.role) || !currentUser.token) {
      throw new Error('ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของร้าน')
    }
    const res = await deleteUserApi(userId, currentUser.token)
    await refreshUsers()
    return res
  }

  // Update user profile and reset staff password (Owner only)
  const updateUser = async (userId, userData) => {
    if (!isOwnerRole(currentUser?.role) || !currentUser.token) {
      throw new Error('ต้องเข้าสู่ระบบด้วยบัญชีเจ้าของร้าน')
    }
    const res = await updateUserApi(userId, userData, currentUser.token)
    await refreshUsers()
    return res
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
          accountType: data.accountType,
          avatar: data.avatar,
          phone: data.phone,
          token: data.token
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
        changeUserRole,
        addStaff,
        deleteUser,
        updateUser
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