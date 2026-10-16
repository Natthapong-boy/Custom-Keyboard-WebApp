const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL.replace(/\/$/, '') : `${RAW_URL.replace(/\/$/, '')}/api`

// ==========================================
// Authentication & User APIs
// ==========================================
export async function registerUserApi(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Registration failed')
  return data
}

export async function loginUserApi(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data
}

export async function getMeApi(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch user')
  return data.user
}

export async function fetchAllUsersApi(token) {
  const res = await fetch(`${API_BASE_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch users')
  return data
}

export async function updateUserRoleApi(userId, role, token) {
  const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update user role')
  return data
}

export async function createStaffApi(staffData, token) {
  const res = await fetch(`${API_BASE_URL}/auth/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(staffData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create staff account')
  return data
}


// ==========================================
// Product APIs (Database connected with filtering)
// ==========================================
export async function fetchProducts(filters = {}) {
  try {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'All' && filters.category !== 'ทั้งหมด') {
      params.append('category', filters.category)
    }
    if (filters.layout && filters.layout !== 'All' && filters.layout !== 'ทั้งหมด') {
      params.append('layout', filters.layout)
    }
    if (filters.switchType && filters.switchType !== 'All' && filters.switchType !== 'ทั้งหมด') {
      params.append('switchType', filters.switchType)
    }
    if (filters.plateCategory && filters.plateCategory !== 'All' && filters.plateCategory !== 'ทั้งหมด') {
      params.append('plateCategory', filters.plateCategory)
    }
    if (filters.keycapProfile && filters.keycapProfile !== 'All' && filters.keycapProfile !== 'ทั้งหมด') {
      params.append('keycapProfile', filters.keycapProfile)
    }
    if (filters.caseMaterial && filters.caseMaterial !== 'All' && filters.caseMaterial !== 'ทั้งหมด') {
      params.append('caseMaterial', filters.caseMaterial)
    }
    if (filters.partType && filters.partType !== 'All') {
      params.append('partType', filters.partType)
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      params.append('minPrice', filters.minPrice)
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      params.append('maxPrice', filters.maxPrice)
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim())
    }
    if (filters.sort) {
      params.append('sort', filters.sort)
    }

    const url = `${API_BASE_URL}/products?${params.toString()}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch products')
    const data = await res.json()
    return Array.isArray(data) ? data : (data.products || [])
  } catch (err) {
    console.warn('API error fetching products:', err)
    return null
  }
}

export async function fetchProductById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`)
    if (!res.ok) throw new Error('Product not found')
    return await res.json()
  } catch (err) {
    console.warn('API error fetching product by id:', err)
    return null
  }
}

export async function createProductApi(productData) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create product')
  return data
}

export async function updateProductApi(id, productData) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update product')
  return data
}

export async function deleteProductApi(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete product')
  return data
}

// ==========================================
// Order APIs (Lifecycle per Diagram)
// ==========================================
export async function fetchOrders(token) {
  try {
    const headers = token ? { Authorization: 'Bearer ' + token } : {}
    const res = await fetch(`${API_BASE_URL}/orders`, { headers })
    if (!res.ok) throw new Error('Failed to fetch orders')
    return await res.json()
  } catch (err) {
    console.warn('API error fetching orders:', err)
    return null
  }
}

export async function fetchOrderById(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`)
    if (!res.ok) throw new Error('Failed to fetch order')
    return await res.json()
  } catch (err) {
    console.warn('API error fetching order by id:', err)
    return null
  }
}

export async function createRemoteOrder(orderData, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })
    if (!res.ok) throw new Error('Failed to create order')
    return await res.json()
  } catch (err) {
    console.warn('Order API error:', err)
    return null
  }
}

export async function cancelOrderApi(orderId, token) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'ยกเลิกคำสั่งซื้อไม่สำเร็จ')
  return data
}

export async function updateRemoteOrderStatus(orderId, status, paymentProof = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentProof })
    })
    return await res.json()
  } catch (err) {
    console.warn('Update order status error:', err)
    return null
  }
}

export async function uploadPaymentProofApi(orderId, paymentProof) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentProof })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to upload payment proof')
  return data
}

// ==========================================
// Owner Reports API (Diagram 2: เจ้าของร้าน)
// ==========================================
export async function fetchOwnerReports() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/reports/all`)
    if (!res.ok) throw new Error('Failed to fetch reports')
    return await res.json()
  } catch (err) {
    console.warn('Failed to fetch owner reports:', err)
    return null
  }
}

// ==========================================
// Payment & Slip Verification APIs (PromptPay & SlipOK)
// ==========================================
export async function generatePromptPayQrApi(orderId, token) {
  const res = await fetch(`${API_BASE_URL}/payment/promptpay/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ orderId })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to generate PromptPay QR')
  return data
}

export async function verifySlipApi(payload, token) {
  const res = await fetch(`${API_BASE_URL}/payment/verify-slip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'การตรวจสอบสลิปล้มเหลว')
  return data
}
