import { useEffect, useState } from 'react'

export function useQrExpiration(expiresAt) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!expiresAt) {
      return undefined
    }

    setNow(Date.now())
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [expiresAt])

  const expiryTime = new Date(expiresAt).getTime()
  const remainingSeconds = Number.isFinite(expiryTime)
    ? Math.max(0, Math.ceil((expiryTime - now) / 1000))
    : 0

  return {
    remainingSeconds,
    isExpired: Boolean(expiresAt) && remainingSeconds === 0
  }
}

export function formatQrCountdown(remainingSeconds) {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
