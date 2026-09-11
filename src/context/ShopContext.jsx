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
    desc: 'Transaction secured on ledger. Order sent to Tokyo lab.',
    progress: 15,
    badgeColor: '#10b981'
  },
  {
    id: 'machining',
    label: 'CNC Chassis Milling',
    icon: '⚙',
    desc: 'Anodizing aluminium body and cutting brass weight.',
    progress: 35,
    badgeColor: '#a855f7'
  },
  {
    id: 'soldering_lubing',
    label: 'Switch Lubing & Soldering',
    icon: '✨',
    desc: 'Krytox 205g0 hand-lubrication on stems & stabilizers.',
    progress: 60,
    badgeColor: '#6366f1'
  },
  {
    id: 'acoustic_qc',
    label: 'Acoustic Sound Test & QC',
    icon: '🎧',
    desc: 'Decibel & frequency curve verified against artisan standards.',
    progress: 80,
    badgeColor: '#ec4899'
  },
  {
    id: 'in_transit',
    label: 'Air Courier In Transit',
    icon: '✈',
    desc: 'Package handled by DHL Express Priority with active sensor tracking.',
    progress: 95,
    badgeColor: '#06b6d4'
  },
  {
    id: 'delivered',
    label: 'Delivered & Unboxed',
    icon: '📦',
    desc: 'Delivered to recipient address. Enjoy your daily driver!',
    progress: 100,
    badgeColor: '#22c55e'
  }
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
    date: '2026-09-10 14:32',
    status: 'acoustic_qc',
    customer: {
      name: 'Kenji Sato',
      email: 'kenji.sato@craftworks.dev',
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
    estimatedDelivery: 'Sep 15, 2026',
    notes: 'Custom brass laser engraving: "FLOW STATE"'
  },
  {
    id: 'KC-90415',
    date: '2026-09-02 09:15',
    status: 'delivered',
    customer: {
      name: 'Alex Vance',
      email: 'alex@designgrid.io',
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
        id: 'ord-item-2',
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
    estimatedDelivery: 'Sep 06, 2026',
    notes: 'Standard lubricant tuning'
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
    oscillator.type = type === 'click' ? 'square' : 'triangle'
    oscillator.frequency.setValueAtTime(type === 'click' ? 260 : type === 'linear' ? 145 : 190, now)
    oscillator.frequency.exponentialRampToValueAtTime(type === 'click' ? 90 : 70, now + (type === 'linear' ? .09 : .055))
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(type === 'click' ? .16 : .1, now + .004)
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
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kc_cart')
    return saved ? JSON.parse(saved) : INITIAL_CART
  })

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('kc_orders')
    return saved ? JSON.parse(saved) : INITIAL_ORDERS
  })

  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('kc_orders', JSON.stringify(orders))
  }, [orders])

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => {
      setToast(null)
    }, 3800)
  }

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p)
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
    showToast(`Added "${item.name}" to cart!`)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
    showToast('Item removed from cart', 'info')
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
    showToast(`Order ${newOrder.id} created successfully!`)
    return newOrder
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    }))
    const stage = ORDER_STAGES.find(s => s.id === newStatus)
    showToast(`Order status updated to: ${stage ? stage.label : newStatus}`)
  }

  const updateOrderDetails = (orderId, updatedFields) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, ...updatedFields }
      }
      return order
    }))
    showToast('Order details updated successfully!')
  }

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId))
    showToast(`Order ${orderId} has been cancelled.`, 'info')
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <ShopContext.Provider value={{
      cart,
      orders,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      updateOrderDetails,
      cancelOrder,
      cartTotal,
      cartItemCount,
      showToast
    }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#170e24] border border-[#a855f7]/60 text-white px-5 py-3.5 rounded-xl shadow-[0_10px_35px_rgba(168,85,247,0.35)] backdrop-blur-md animate-bounce-short">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-pulse"></span>
          <span className="text-xs font-mono tracking-wider">{toast.message}</span>
        </div>
      )}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
