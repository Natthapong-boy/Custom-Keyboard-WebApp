import React, { useEffect, useState } from 'react'
import Icon from './Icon'

export default function ProductImage({
  src,
  alt,
  className = '',
  imageClassName = 'h-full w-full object-contain',
  loading
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading={loading}
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon name="image" size={32} className="text-slate-300" />
      )}
    </div>
  )
}
