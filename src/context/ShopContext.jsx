import React, { createContext, useContext, useState, useEffect } from 'react'
import key1 from '../assets/key1.jpg'
import key2 from '../assets/key2.jpg'
import key3 from '../assets/key3.jpg'

const ShopContext = createContext()

export const ORDER_STAGES = [
  {
    id: 'payment_confirmed',
    label: 'Payment Verified',
    icon: '✓',
    desc: 'Transaction verified on payment gateway. Workshop notified.',
    progress: 15,
    badgeColor: '#10b981'
  },
  {
    id: 'machining',
    label: 'CNC Chassis Milling',
    icon: '⚙',
    desc: 'Precision CNC machining of aluminum housing and brass weight bar.',
    progress: 35,
    badgeColor: '#a855f7'
  },
  {
    id: 'soldering_lubing',
    label: 'Switch Lubing & Assembly',
    icon: '✨',
    desc: 'Hand-lubricating stems with Krytox 205g0 and tuning stabilizers.',
    progress: 60,
    badgeColor: '#6366f1'
  },
  {
    id: 'acoustic_qc',
    label: 'Acoustic Sound QC',
    icon: '🎧',
    desc: 'Decibel and frequency acoustic curve verified against artisan sound profiles.',
    progress: 80,
    badgeColor: '#ec4899'
  },
  {
    id: 'in_transit',
    label: 'Express Courier Dispatch',
    icon: '✈',
    desc: 'Dispatched via DHL Express Priority. Tracking code activated.',
    progress: 95,
    badgeColor: '#06b6d4'
  },
  {
    id: 'delivered',
    label: 'Delivered & Completed',
    icon: '📦',
    desc: 'Safely delivered to customer address. Ready to type and game!',
    progress: 100,
    badgeColor: '#22c55e'
  }
]

export const DEMO_USERS = {
  owner: {
    _id: 'usr-owner-001',
    name: 'Somchai (Shop Owner)',
    email: 'owner@customkb.com',
    role: 'owner',
    title: 'Founder & Master Artisan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '081-999-8888',
    department: 'Executive / All Workshop'
  },
  staff: {
    _id: 'usr-staff-002',
    name: 'Somsri (Artisan Staff)',
    email: 'staff@customkb.com',
    role: 'staff',
    title: 'Lead Assembly & Lubing Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '082-777-6666',
    department: 'Workshop Operations'
  },
  customer: {
    _id: 'usr-cust-003',
    name: 'Natthapong (Customer)',
    email: 'customer@customkb.com',
    role: 'customer',
    title: 'Enthusiast Customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '089-123-4567',
    department: 'Member'
  }
}

const INITIAL_STAFF_MEMBERS = [
  {
    id: 'st-01',
    name: 'Somchai Charoen',
    email: 'owner@customkb.com',
    role: 'owner',
    title: 'Founder & Master Craftsman',
    department: 'Management',
    shift: 'Full-time (9:00 - 18:00)',
    active: true,
    ordersCompleted: 215,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'st-02',
    name: 'Somsri Techawit',
    email: 'staff@customkb.com',
    role: 'staff',
    title: 'Senior Assembly & Lubing Specialist',
    department: 'Workshop',
    shift: 'Morning (08:30 - 17:30)',
    active: true,
    ordersCompleted: 142,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'st-03',
    name: 'Kittisak Wongsuwan',
    email: 'kittisak.qc@customkb.com',
    role: 'staff',
    title: 'Acoustic Sound & QC Engineer',
    department: 'Quality Control',
    shift: 'Day Shift (10:00 - 19:00)',
    active: true,
    ordersCompleted: 98,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'st-04',
    name: 'Ploy Srisawat',
    email: 'ploy.logistics@customkb.com',
    role: 'staff',
    title: 'Logistics & Packaging Lead',
    department: 'Fulfillment',
    shift: 'Afternoon (11:00 - 20:00)',
    active: true,
    ordersCompleted: 180,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  }
]

const INITIAL_INVENTORY = [
  { id: 'inv-01', category: 'Chassis', name: 'Aluminium CNC 75% Case (Midnight Purple)', sku: 'CASE-75-PUR', stock: 18, minStock: 10, unitPrice: 85 },
  { id: 'inv-02', category: 'Chassis', name: 'Aluminium CNC 65% Case (Space Grey)', sku: 'CASE-65-GRY', stock: 24, minStock: 10, unitPrice: 75 },
  { id: 'inv-03', category: 'Chassis', name: 'Brass Weight Bar (PVD Coated Mirror)', sku: 'WGT-BRASS-01', stock: 6, minStock: 8, unitPrice: 35 },
  { id: 'inv-04', category: 'Switches', name: 'Gateron Blue Clicky (110 pcs pack)', sku: 'SW-GAT-BLU', stock: 45, minStock: 15, unitPrice: 42 },
  { id: 'inv-05', category: 'Switches', name: 'Cherry MX Red Linear (110 pcs pack)', sku: 'SW-CHY-RED', stock: 32, minStock: 15, unitPrice: 45 },
  { id: 'inv-06', category: 'Switches', name: 'Gateron Oil King Linear (Factory Lubed)', sku: 'SW-OIL-KNG', stock: 8, minStock: 12, unitPrice: 65 },
  { id: 'inv-07', category: 'Keycaps', name: 'Artisan Lilac Double-shot PBT Keycaps', sku: 'KC-LILAC-PBT', stock: 14, minStock: 10, unitPrice: 49 },
  { id: 'inv-08', category: 'Keycaps', name: 'Carbon Retro Cherry Profile Keycaps', sku: 'KC-CARB-CHY', stock: 29, minStock: 10, unitPrice: 55 },
  { id: 'inv-09', category: 'Keycaps', name: 'Black on White (BoW) Minimalist PBT', sku: 'KC-BOW-MIN', stock: 3, minStock: 10, unitPrice: 39 },
  { id: 'inv-10', category: 'Materials', name: 'Krytox 205g0 Switch Lubricant (50ml jar)', sku: 'LUB-KRY-205', stock: 19, minStock: 5, unitPrice: 28 },
  { id: 'inv-11', category: 'Materials', name: 'Durock V2 Screw-in Stabilizers Set', sku: 'STAB-DRK-V2', stock: 5, minStock: 8, unitPrice: 22 }
]

const INITIAL_CART = [
  {
    id: 'custom-init-1',
    name: 'Custom Void Artisan 75',
    type: 'Custom Build',
    layout: '75%',
    caseColor: 'Purple',
    caseColorHex: '#5b237d',
    caseEdgeHex: '#a855f7',
    switchType: 'Blue',
    switchSound: 'click',
    switchFeel: 'Clicky / tactile',
    keycaps: 'Lilac',
    price: 189,
    quantity: 1,
    image: key1
  }
]

const INITIAL_ORDERS = [
  {
    id: 'KC-90821',
    date: '2026-09-24 14:32',
    status: 'acoustic_qc',
    customer: {
      name: 'Kenji Sato',
      email: 'kenji.sato@craftworks.dev',
      phone: '+81 90-1234-5678',
      address: '7-2-1 Minato-ku, Roppongi Hills 42F',
      city: 'Tokyo',
      country: 'Japan',
      zip: '106-6142'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa'
    },
    items: [
      {
        id: 'ord-item-1',
        name: 'Custom Void 75',
        specs: '75% • Purple Anodized • Blue Clicky • Lilac Keycaps',
        switchSound: 'click',
        price: 189,
        quantity: 1,
        image: key1
      }
    ],
    subtotal: 189,
    discount: 18.9,
    shipping: 0,
    total: 170.1,
    trackingNumber: 'DHL-JP-889104820',
    estimatedDelivery: 'Sep 28, 2026',
    notes: 'Laser engraving on brass weight: "FLOW STATE"'
  },
  {
    id: 'KC-91204',
    date: '2026-09-23 18:10',
    status: 'soldering_lubing',
    customer: {
      name: 'Piti Rattanakul',
      email: 'piti.dev@bangkok.co',
      phone: '081-445-5678',
      address: '88 Sukhumvit Soi 21, Asoke Tower 15th Fl',
      city: 'Bangkok',
      country: 'Thailand',
      zip: '10110'
    },
    paymentMethod: {
      type: 'promptpay',
      brand: 'PromptPay QR'
    },
    items: [
      {
        id: 'ord-item-2',
        name: 'Zenith TKL Pro (Thai Legend)',
        specs: 'TKL 80% • Silver Frost • Gateron Oil King • BoW Keycaps',
        switchSound: 'thock',
        price: 219,
        quantity: 1,
        image: key3
      }
    ],
    subtotal: 219,
    discount: 20,
    shipping: 0,
    total: 199,
    trackingNumber: 'TH-KERRY-7729103',
    estimatedDelivery: 'Sep 27, 2026',
    notes: 'Krytox 205g0 lube + Holee mod on spacebar'
  },
  {
    id: 'KC-91550',
    date: '2026-09-22 11:45',
    status: 'machining',
    customer: {
      name: 'Sarah Connor',
      email: 'sarah.c@techcyber.org',
      phone: '+1 415-555-0199',
      address: '100 Cyberdyne Blvd, Suite 400',
      city: 'Austin',
      country: 'USA',
      zip: '78701'
    },
    paymentMethod: {
      type: 'card',
      last4: '9921',
      brand: 'Mastercard'
    },
    items: [
      {
        id: 'ord-item-3',
        name: 'Cyber Blade 60',
        specs: '60% • Forest Green • Red Linear • Carbon Keycaps',
        switchSound: 'linear',
        price: 169,
        quantity: 1,
        image: key2
      }
    ],
    subtotal: 169,
    discount: 0,
    shipping: 15,
    total: 184,
    trackingNumber: 'DHL-US-10294811',
    estimatedDelivery: 'Sep 30, 2026',
    notes: 'Extra silicone dampener pad included'
  },
  {
    id: 'KC-90415',
    date: '2026-09-18 09:15',
    status: 'delivered',
    customer: {
      name: 'Alex Vance',
      email: 'alex@designgrid.io',
      phone: '+1 415-882-9901',
      address: '452 Fremont St, Ste 300',
      city: 'San Francisco',
      country: 'USA',
      zip: '94105'
    },
    paymentMethod: {
      type: 'apple_pay',
      last4: '8831',
      brand: 'Apple Pay'
    },
    items: [
      {
        id: 'ord-item-4',
        name: 'Nebula 65 Edition',
        specs: '65% • Space Grey • Linear Red • Carbon Keycaps',
        switchSound: 'linear',
        price: 159,
        quantity: 1,
        image: key2
      }
    ],
    subtotal: 159,
    discount: 0,
    shipping: 15,
    total: 174,
    trackingNumber: 'DHL-US-991048114',
    estimatedDelivery: 'Sep 22, 2026',
    notes: 'Signed for upon delivery'
  }
]

export function playSwitchSound(type) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  try {
    const context = new AudioContext()
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type === 'click' ? 'square' : type === 'thock' ? 'sine' : 'triangle'
    oscillator.frequency.setValueAtTime(type === 'click' ? 260 : type === 'thock' ? 110 : 145, now)
    oscillator.frequency.exponentialRampToValueAtTime(type === 'click' ? 90 : type === 'thock' ? 50 : 70, now + (type === 'linear' ? .09 : .055))
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(type === 'click' ? .16 : type === 'thock' ? .2 : .1, now + .004)
    gain.gain.exponentialRampToValueAtTime(.0001, now + (type === 'linear' ? .12 : .075))
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + .13)
    oscillator.addEventListener('ended', () => context.close())
  } catch (e) {
    console.error('Audio play error', e)
  }
}

export function ShopProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kc_user')
    return saved ? JSON.parse(saved) : DEMO_USERS.customer
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('kc_token') || 'demo_jwt_token_2026'
  })

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kc_cart')
    return saved ? JSON.parse(saved) : INITIAL_CART
  })

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('kc_orders')
    return saved ? JSON.parse(saved) : INITIAL_ORDERS
  })

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('kc_inventory')
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY
  })

  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('kc_staff_list')
    return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS
  })

  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (user) {
      localStorage.setItem('kc_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('kc_user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('kc_token', token)
    } else {
      localStorage.removeItem('kc_token')
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('kc_orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('kc_inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem('kc_staff_list', JSON.stringify(staffList))
  }, [staffList])

  const login = (userData, userToken) => {
    setUser(userData)
    if (userToken) setToken(userToken)
    showToast(`ยินดีต้อนรับคุณ ${userData.name}!`)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info')
  }

  const switchDemoRole = (roleKey) => {
    const targetUser = DEMO_USERS[roleKey] || DEMO_USERS.customer
    setUser(targetUser)
    setToken(`demo_jwt_${roleKey}_2026`)
    showToast(`สลับบทบาทเป็น: ${targetUser.name} (${targetUser.role.toUpperCase()})`)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => {
      setToast(null)
    }, 3800)
  }

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p)
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
    showToast(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
    showToast('ลบสินค้าออกจากตะกร้าแล้ว', 'info')
  }

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const clearCart = () => {
    setCart([])
  }

  // Order operations
  const createOrder = (orderData) => {
    const newOrder = {
      id: `KC-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'payment_confirmed',
      trackingNumber: `DHL-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...orderData
    }

    setOrders(prev => [newOrder, ...prev])
    clearCart()
    showToast(`สร้างคำสั่งซื้อ ${newOrder.id} เรียบร้อยแล้ว!`)
    return newOrder
  }

  const updateOrderStatus = (orderId, newStatus, trackingNo = null) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status: newStatus }
        if (trackingNo) updated.trackingNumber = trackingNo
        return updated
      }
      return order
    }))
    const stage = ORDER_STAGES.find(s => s.id === newStatus)
    showToast(`อัปเดตสถานะออเดอร์ ${orderId} เป็น: ${stage ? stage.label : newStatus}`)
  }

  const updateOrderDetails = (orderId, updatedFields) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, ...updatedFields }
      }
      return order
    }))
    showToast(`อัปเดตข้อมูลคำสั่งซื้อ ${orderId} เรียบร้อยแล้ว`)
  }

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId))
    showToast(`ยกเลิกคำสั่งซื้อ ${orderId} แล้ว`, 'info')
  }

  // Inventory operations
  const updateInventoryStock = (itemId, deltaOrValue, isAbsolute = false) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = isAbsolute ? Math.max(0, deltaOrValue) : Math.max(0, item.stock + deltaOrValue)
        return { ...item, stock: newStock }
      }
      return item
    }))
    showToast('ปรับปรุงจำนวนสต็อกสินค้าแล้ว')
  }

  const addInventoryItem = (newItem) => {
    const itemWithId = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      ...newItem
    }
    setInventory(prev => [itemWithId, ...prev])
    showToast(`เพิ่มชิ้นส่วน "${newItem.name}" ในคลังสินค้าแล้ว`)
  }

  // Staff operations
  const addStaffMember = (newStaff) => {
    const staffWithId = {
      id: `st-0${staffList.length + 1}`,
      ordersCompleted: 0,
      active: true,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999999)}?auto=format&fit=crop&w=200&q=80`,
      ...newStaff
    }
    setStaffList(prev => [...prev, staffWithId])
    showToast(`เพิ่มพนักงานคุณ ${newStaff.name} เรียบร้อยแล้ว`)
  }

  const toggleStaffStatus = (staffId) => {
    setStaffList(prev => prev.map(st => {
      if (st.id === staffId) {
        const nextActive = !st.active
        return { ...st, active: nextActive }
      }
      return st
    }))
    showToast('อัปเดตสถานะการทำงานของพนักงานแล้ว')
  }

  const deleteStaffMember = (staffId) => {
    setStaffList(prev => prev.filter(st => st.id !== staffId))
    showToast('ลบข้อมูลพนักงานออกจากระบบแล้ว', 'info')
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Roles permission helpers
  const isOwner = user?.role === 'owner' || user?.role === 'admin'
  const isStaff = isOwner || user?.role === 'staff' || user?.role === 'artisan'

  return (
    <ShopContext.Provider value={{
      user,
      token,
      login,
      logout,
      switchDemoRole,
      isLoggedIn: !!user,
      isOwner,
      isStaff,
      cart,
      orders,
      inventory,
      staffList,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      updateOrderDetails,
      cancelOrder,
      updateInventoryStock,
      addInventoryItem,
      addStaffMember,
      toggleStaffStatus,
      deleteStaffMember,
      cartTotal,
      cartItemCount,
      showToast
    }}>
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(24, 24, 28, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f5f5f7',
            padding: '10px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.25s ease-out',
            pointerEvents: 'none',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: toast.type === 'info' ? '#38bdf8' : '#10b981', display: 'inline-block', flexShrink: 0 }} />
          {toast.message}
        </div>
      )}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
