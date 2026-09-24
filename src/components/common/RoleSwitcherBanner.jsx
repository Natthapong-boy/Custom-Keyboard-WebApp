import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useShop, DEMO_USERS } from '../../context/ShopContext'

export default function RoleSwitcherBanner() {
  const { user, switchDemoRole, isStaff, isOwner } = useShop()
  const location = useLocation()

  const currentRole = user?.role || 'customer'

  return (
    <div
      style={{
        background: '#09090b',
        borderBottom: '1px solid #27272a',
        padding: '6px 16px',
        fontSize: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}
    >
      {/* Left: Current Active Role Indicator */}
      <div className="flex items-center gap-2">
        <span style={{ color: '#a1a1aa', fontWeight: 500 }}>
          ⚡ Simulation Role:
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: currentRole === 'owner' ? 'rgba(234, 179, 8, 0.15)' : currentRole === 'staff' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(161, 161, 170, 0.15)',
            border: `1px solid ${currentRole === 'owner' ? 'rgba(234, 179, 8, 0.4)' : currentRole === 'staff' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(161, 161, 170, 0.3)'}`,
            color: currentRole === 'owner' ? '#fde047' : currentRole === 'staff' ? '#38bdf8' : '#e4e4e7',
            padding: '2px 8px',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 11
          }}
        >
          <span>{currentRole === 'owner' ? '👑 Owner' : currentRole === 'staff' ? '🛠️ Staff' : '👤 Customer'}</span>
          <span>({user?.name?.split(' ')[0] || 'Guest'})</span>
        </span>
      </div>

      {/* Center/Right: Quick Switch Buttons & Admin Portal Link */}
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ color: '#71717a', fontSize: 11 }}>Switch to:</span>
        <button
          onClick={() => switchDemoRole('owner')}
          style={{
            background: currentRole === 'owner' ? '#ca8a04' : '#18181b',
            color: currentRole === 'owner' ? '#000000' : '#d4d4d8',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: currentRole === 'owner' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          👑 Owner
        </button>

        <button
          onClick={() => switchDemoRole('staff')}
          style={{
            background: currentRole === 'staff' ? '#0284c7' : '#18181b',
            color: currentRole === 'staff' ? '#ffffff' : '#d4d4d8',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: currentRole === 'staff' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          🛠️ Staff
        </button>

        <button
          onClick={() => switchDemoRole('customer')}
          style={{
            background: currentRole === 'customer' ? '#ffffff' : '#18181b',
            color: currentRole === 'customer' ? '#09090b' : '#d4d4d8',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: currentRole === 'customer' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          👤 Customer
        </button>

        {(isStaff || isOwner) && (
          <Link
            to={location.pathname.startsWith('/admin') ? '/' : '/admin'}
            style={{
              marginLeft: 8,
              background: location.pathname.startsWith('/admin') ? '#27272a' : '#10b981',
              color: location.pathname.startsWith('/admin') ? '#f4f4f5' : '#000000',
              fontWeight: 700,
              fontSize: 11,
              padding: '2px 10px',
              borderRadius: 6,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {location.pathname.startsWith('/admin') ? '← Back to Store' : '⚙️ Staff/Owner Portal →'}
          </Link>
        )}
      </div>
    </div>
  )
}
