const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export async function loginWithGoogleToken(idToken) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: idToken })
  })
  if (!res.ok) throw new Error('Google Login verification failed')
  return await res.json()
}
