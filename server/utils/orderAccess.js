const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function getOrderAccessFilter(req) {
  if (!req.user) return null
  if (['owner', 'ceo', 'staff'].includes(req.user.role)) {
    return {}
  }

  const filter = [{ user: req.user._id }]
  if (req.user.email) {
    filter.push({
      'customer.email': { $regex: `^${escapeRegex(req.user.email)}$`, $options: 'i' }
    })
  }
  return { $or: filter }
}

export function canAccessOrder(order, req) {
  if (!req.user) return false
  if (['owner', 'ceo', 'staff'].includes(req.user.role)) {
    return true
  }
  const userId = String(req.user._id)
  return String(order.user || '') === userId ||
    String(order.customer?.email || '').toLowerCase() === String(req.user.email || '').toLowerCase()
}
