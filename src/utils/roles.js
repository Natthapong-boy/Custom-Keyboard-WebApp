export const isOwnerRole = (role) => {
  if (!role) return false
  const r = String(role).toLowerCase().trim()
  return r === 'owner' || r === 'ceo' || r === 'admin'
}

