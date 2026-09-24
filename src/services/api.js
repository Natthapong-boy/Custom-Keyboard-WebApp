const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL.replace(/\/$/, '') : `${RAW_URL.replace(/\/$/, '')}/api`

// ==========================================
// Authentication APIs
// ==========================================
export async function registerUserApi(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed')
  }
  return data
}

export async function loginUserApi(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }
  return data
}

export async function getMeApi(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch user')
  }
  return data.user
}

export async function loginWithGoogleToken(idToken) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: idToken })
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Google Login verification failed')
  }
  return data
}

// ==========================================
// Product APIs
// ==========================================
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`)
    if (!res.ok) throw new Error('Failed to fetch products')
    return await res.json()
  } catch (err) {
    console.warn('API unavailable, falling back to local state:', err)
    return null
  }
}

// ==========================================
// Order APIs
// ==========================================
export async function createRemoteOrder(orderData, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })
    if (!res.ok) throw new Error('Failed to create remote order')
    return await res.json()
  } catch (err) {
    console.warn('Backend unavailable, stored locally in ShopContext:', err)
    return null
  }
}

export async function updateRemoteOrderStatus(orderId, status, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    })
    return await res.json()
  } catch (err) {
    console.warn('Backend unavailable, updated in local ShopContext:', err)
    return null
  }
}
