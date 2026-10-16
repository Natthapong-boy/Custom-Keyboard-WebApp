import React from 'react'

/**
 * KeycapVisual: Vector-based mechanical keycap illustration
 * Displays realistic 3D angled keycap profile (Cherry, OEM, SA, XDA) with top dish and legend
 */
export default function KeycapVisual({
  profile = 'Cherry',
  topColor = '#583670',
  botColor = '#1a0e22',
  legend = 'KC',
  size = 64,
  className = ''
}) {
  const normProf = (profile || 'Cherry').toUpperCase()
  const isSA = normProf.includes('SA')
  const isXDA = normProf.includes('XDA')
  const isOEM = normProf.includes('OEM')

  // Height and slope adjustments
  const heightRatio = isSA ? 0.95 : isOEM ? 0.82 : isXDA ? 0.72 : 0.76

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`topGrad-${topColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={topColor} stopOpacity="1" />
            <stop offset="100%" stopColor={topColor} stopOpacity="0.82" />
          </linearGradient>

          <linearGradient id={`sideGrad-${botColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={topColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={botColor} stopOpacity="1" />
          </linearGradient>

          <radialGradient id="dishGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </radialGradient>
        </defs>

        {/* Base / Skirt Shadow */}
        <ellipse cx="50" cy="86" rx="42" ry="7" fill="rgba(0,0,0,0.18)" />

        {/* 1. Keycap Body / Side Skirts */}
        {isSA ? (
          // SA Profile: Tall, bulbous rounded retro corners
          <path
            d="M 16 82 C 16 82, 22 26, 26 22 C 30 18, 70 18, 74 22 C 78 26, 84 82, 84 82 C 84 86, 16 86, 16 82 Z"
            fill={`url(#sideGrad-${botColor.replace('#', '')})`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
        ) : isXDA ? (
          // XDA Profile: Flat uniform square with soft rounded shoulders
          <path
            d="M 15 82 L 23 32 C 24 28, 76 28, 77 32 L 85 82 Z"
            fill={`url(#sideGrad-${botColor.replace('#', '')})`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
        ) : isOEM ? (
          // OEM Profile: Medium-tall sculpted slope
          <path
            d="M 14 83 L 24 26 C 25 22, 75 22, 76 26 L 86 83 Z"
            fill={`url(#sideGrad-${botColor.replace('#', '')})`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
        ) : (
          // Cherry Profile: Low, sharp ergonomic angle
          <path
            d="M 13 83 L 25 30 C 26 26, 74 26, 75 30 L 87 83 Z"
            fill={`url(#sideGrad-${botColor.replace('#', '')})`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
        )}

        {/* Front Lip / Highlight Line */}
        <path
          d="M 17 81 L 83 81"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 2. Top Face / Spherical or Cylindrical Dish */}
        {isSA ? (
          // Deep spherical dish
          <ellipse
            cx="50"
            cy="27"
            rx="24"
            ry="11"
            fill={`url(#topGrad-${topColor.replace('#', '')})`}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
        ) : isXDA ? (
          // Wide flat rounded dish
          <rect
            x="24"
            y="28"
            width="52"
            height="18"
            rx="7"
            fill={`url(#topGrad-${topColor.replace('#', '')})`}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
        ) : isOEM ? (
          // Cylindrical dish medium
          <rect
            x="25"
            y="23"
            width="50"
            height="18"
            rx="5"
            fill={`url(#topGrad-${topColor.replace('#', '')})`}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
        ) : (
          // Cherry cylindrical dish
          <rect
            x="26"
            y="27"
            width="48"
            height="17"
            rx="4"
            fill={`url(#topGrad-${topColor.replace('#', '')})`}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
        )}

        {/* Dish Depth Overlay */}
        {isSA ? (
          <ellipse cx="50" cy="27" rx="22" ry="9" fill="url(#dishGrad)" />
        ) : (
          <rect
            x="27"
            y={isOEM ? 24 : 28}
            width="46"
            height="15"
            rx="4"
            fill="url(#dishGrad)"
          />
        )}

        {/* Legend Text / Profile Stamp */}
        <text
          x="50"
          y={isSA ? "31" : isOEM ? "36" : "39"}
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="rgba(255,255,255,0.85)"
          letterSpacing="0.5"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {legend}
        </text>

        {/* Profile badge pill at bottom-right of graphic */}
        <rect x="58" y="72" width="34" height="13" rx="4" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <text
          x="75"
          y="81.5"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="800"
          fill="#c084fc"
          fontFamily="system-ui, sans-serif"
        >
          {normProf.includes('SA') ? 'SA' : normProf.includes('XDA') ? 'XDA' : normProf.includes('OEM') ? 'OEM' : 'CHERRY'}
        </text>
      </svg>
    </div>
  )
}
