export const isOwnerRole = (role) => {
  if (!role) return false
  const r = String(role).toLowerCase().trim()
  return r === 'owner' || r === 'ceo' || r === 'admin'
}

export const isStaffAccount = (user) => {
  if (!user) return false
  const role = String(user.role || '').toLowerCase().trim()
  return user.accountType === 'employee' ||
    isOwnerRole(role) ||
    role === 'staff' ||
    role === 'artisan'
}
