import React from 'react'

/**
 * SwitchVisual: Vector-based high-detail mechanical switch graphic (similar to Keychron switch illustrations)
 * Displays realistic transparent/milky top housing, colored stem, spring, and contact pins.
 */
export default function SwitchVisual({
  color = '#eab308',
  stemType = 'cross',
  isPlaying = false,
  size = 80,
  className = ''
}) {
  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-300 ${
        isPlaying ? 'scale-105' : 'hover:scale-105'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle 3D Linear Gradients */}
          <linearGradient id={`stemGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="housingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#e2e8f0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Metal Pins (Bottom Contacts) */}
        <rect x="36" y="86" width="3.5" height="10" rx="1" fill="url(#pinGrad)" />
        <rect x="60.5" y="86" width="3.5" height="10" rx="1" fill="url(#pinGrad)" />
        <rect x="47.5" y="88" width="5" height="9" rx="1" fill="#475569" />

        {/* 2. Bottom Housing */}
        <path
          d="M20 62 L80 62 L74 86 L26 86 Z"
          fill="url(#baseGrad)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Clip notches on sides */}
        <rect x="18" y="65" width="4" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        <rect x="78" y="65" width="4" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />

        {/* 3. Center Internal Spring (Seen through translucent housing) */}
        <g stroke="#94a3b8" strokeWidth="1.6" opacity="0.65" strokeLinecap="round">
          <line x1="43" y1="52" x2="57" y2="55" />
          <line x1="57" y1="55" x2="43" y2="59" />
          <line x1="43" y1="59" x2="57" y2="63" />
          <line x1="57" y1="63" x2="43" y2="67" />
          <line x1="43" y1="67" x2="57" y2="71" />
        </g>

        {/* 4. Switch Stem (MX Cross Stem) */}
        <g transform={isPlaying ? 'translate(0, 4)' : 'translate(0, 0)'} className="transition-transform duration-150">
          {/* Stem base collar */}
          <rect
            x="35"
            y="34"
            width="30"
            height="18"
            rx="2"
            fill={color}
            stroke="#000000"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          {/* Vertical Stem Pillar */}
          <rect
            x="44"
            y="14"
            width="12"
            height="26"
            rx="1.5"
            fill={color}
            stroke="#ffffff"
            strokeOpacity="0.3"
            strokeWidth="0.8"
          />
          {/* Horizontal Stem Wing */}
          <rect
            x="36"
            y="21"
            width="28"
            height="10"
            rx="1.5"
            fill={color}
            stroke="#000000"
            strokeOpacity="0.2"
            strokeWidth="0.8"
          />
          {/* MX Cross (+) Center Cutout / Detail */}
          <rect x="47" y="16" width="6" height="18" rx="0.5" fill="#000000" fillOpacity="0.18" />
          <rect x="38" y="23" width="24" height="6" rx="0.5" fill="#000000" fillOpacity="0.18" />
        </g>

        {/* 5. Translucent Top Housing */}
        <path
          d="M22 36 L78 36 L82 64 L18 64 Z"
          fill="url(#housingGrad)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
          opacity="0.88"
        />

        {/* LED Lens Slot / Inverted Dome on Top Housing */}
        <rect
          x="38"
          y="56"
          width="24"
          height="6"
          rx="3"
          fill="#ffffff"
          fillOpacity="0.5"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />

        {/* Highlight Glare */}
        <path
          d="M24 38 L38 38 L32 58 L20 58 Z"
          fill="#ffffff"
          opacity="0.35"
        />

        {/* Outer Border Rim */}
        <rect
          x="16"
          y="61"
          width="68"
          height="4.5"
          rx="1"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />
      </svg>

      {/* Pulse Wave Effect when Playing */}
      {isPlaying && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}
