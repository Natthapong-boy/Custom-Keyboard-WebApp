import React, { useEffect, useMemo, useState } from 'react'
import { resolveImageUrl } from '../../services/api'

const getFallbackImage = (type, color, secondaryColor) => {
  const fill = color || '#a78bfa'
  const accent = secondaryColor || '#ede9fe'
  const common = 'fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'
  let illustration

  if (type === 'เคส' || type === 'case') {
    illustration = `<rect x="18" y="34" width="164" height="112" rx="18" fill="${fill}" stroke="#475569" stroke-width="6"/><rect x="30" y="46" width="140" height="88" rx="10" fill="#fff" fill-opacity=".35"/>`
  } else if (type === 'สวิตช์' || type === 'switch') {
    illustration = `<path d="M60 42h80l12 24v64l-12 18H60l-12-18V66z" fill="${fill}" stroke="#475569" stroke-width="6"/><rect x="76" y="28" width="48" height="40" rx="7" fill="${accent}" stroke="#475569" stroke-width="5"/><path d="M80 103h40" ${common}/>`
  } else if (type === 'เพลต' || type === 'plate') {
    illustration = `<rect x="22" y="40" width="156" height="100" rx="12" fill="${fill}" stroke="#475569" stroke-width="6"/><g fill="#fff" fill-opacity=".8"><rect x="38" y="56" width="22" height="18" rx="4"/><rect x="70" y="56" width="22" height="18" rx="4"/><rect x="102" y="56" width="22" height="18" rx="4"/><rect x="134" y="56" width="22" height="18" rx="4"/><rect x="38" y="88" width="22" height="18" rx="4"/><rect x="70" y="88" width="22" height="18" rx="4"/><rect x="102" y="88" width="22" height="18" rx="4"/><rect x="134" y="88" width="22" height="18" rx="4"/></g>`
  } else {
    illustration = `<g stroke="#475569" stroke-width="5" stroke-linejoin="round"><path d="m28 62 20-18h48l20 18v56l-20 18H48l-20-18z" fill="${fill}"/><path d="m86 62 20-18h48l20 18v56l-20 18h-48l-20-18z" fill="${accent}"/></g>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180"><rect width="200" height="180" rx="24" fill="#f5f3ff"/>${illustration}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function PartImage({
  src,
  type,
  color,
  secondaryColor,
  alt = '',
  className = '',
  imageClassName = 'h-full w-full object-contain'
}) {
  const [failed, setFailed] = useState(false)
  const fallback = useMemo(() => getFallbackImage(type, color, secondaryColor), [type, color, secondaryColor])
  const imageSrc = failed || !src ? fallback : resolveImageUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className || imageClassName}
      onError={() => {
        if (!failed) setFailed(true)
      }}
    />
  )
}
