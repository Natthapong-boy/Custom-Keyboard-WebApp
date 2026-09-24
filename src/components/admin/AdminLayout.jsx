import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'

export default function AdminLayout() {
  const { user, isOwner, isStaff, orders, inventory } = useShop()
  const location = useLocation()

  // Count low stock items
  const lowStockCount = inventory.filter(i => i.stock <= (i.minStock || 10)).length

  const navLinks = [
    {
      path: '/admin',
      label: 'Overview & Charts',
      icon: '📊',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/orders',
      label: 'Orders & Workshop',
      icon: '📦',
      badge: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/inventory',
      label: 'Inventory & Parts',
      icon: '🧰',
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: '#f59e0b',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/products',
      label: 'Product Catalog',
      icon: '⌨️',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/staff',
      label: 'Staff Team',
      icon: '👥',
      tag: 'Owner Only',
      roles: ['owner']
    }
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0d0d10', color: '#f4f4f5' }}>
      {/* Admin Top Navigation */}
      <header
        style={{
          background: '#121215',
          borderBottom: '1px solid #27272a',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, color: '#ffffff' }}>✦</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>KEY CRAFT</span>
          </Link>
          <span style={{ height: 16, width: 1, background: '#3f3f46' }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: isOwner ? 'rgba(234, 179, 8, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              color: isOwner ? '#fde047' : '#38bdf8',
              border: `1px solid ${isOwner ? 'rgba(234, 179, 8, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
              padding: '2px 8px',
              borderRadius: 6
            }}
          >
            {isOwner ? '👑 Owner Portal' : '🛠️ Staff Workshop'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#a1a1aa' }}>
            <img
              src={user?.avatar}
              alt={user?.name}
              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid #52525b' }}
            />
            <div className="hidden sm:block">
              <div style={{ fontWeight: 600, color: '#ffffff' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: '#71717a' }}>{user?.title || user?.role}</div>
            </div>
          </div>

          <Link
            to="/"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#d4d4d8',
              background: '#27272a',
              border: '1px solid #3f3f46',
              padding: '6px 12px',
              borderRadius: 8,
              textDecoration: 'none'
            }}
          >
            Storefront ↗
          </Link>
        </div>
      </header>

      {/* Admin Body with Sidebar */}
      <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '100%',
            maxWidth: 240,
            background: '#121215',
            borderRight: '1px solid #27272a',
            padding: '20px 12px',
            flexShrink: 0
          }}
          className="hidden md:block"
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 10px' }}>
            Management
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              // Permission check
              const isAllowed = link.roles.includes(user?.role || 'customer')
              if (!isAllowed) return null

              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path))

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : '#a1a1aa',
                    background: isActive ? '#27272a' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </div>

                  {link.badge != null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: link.badgeColor ? `${link.badgeColor}20` : 'rgba(56, 189, 248, 0.2)',
                        color: link.badgeColor || '#38bdf8',
                        border: `1px solid ${link.badgeColor ? `${link.badgeColor}40` : 'rgba(56, 189, 248, 0.4)'}`
                      }}
                    >
                      {link.badge}
                    </span>
                  )}

                  {link.tag && !link.badge && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'rgba(234, 179, 8, 0.15)',
                        color: '#fde047'
                      }}
                    >
                      {link.tag}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Role Info Box at bottom */}
          <div
            style={{
              marginTop: 40,
              padding: '14px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 10
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Current Permission Level
            </div>
            <p style={{ fontSize: 11, color: '#a1a1aa', margin: 0, lineHeight: 1.4 }}>
              {isOwner
                ? 'Full Owner Clearance: Financial dashboards, revenue charts, staff roster, and workshop control.'
                : 'Artisan Staff Clearance: Order fulfillment, stage updates, and inventory tracking.'}
            </p>
          </div>
        </aside>

        {/* Mobile Horizontal Subnav */}
        <div
          className="flex md:hidden overflow-x-auto p-2 gap-2"
          style={{ background: '#121215', borderBottom: '1px solid #27272a' }}
        >
          {navLinks.map((link) => {
            const isAllowed = link.roles.includes(user?.role || 'customer')
            if (!isAllowed) return null
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  background: isActive ? '#27272a' : 'transparent',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  textDecoration: 'none'
                }}
              >
                {link.icon} {link.label}
              </Link>
            )
          })}
        </div>

        {/* Main Admin Content Area */}
        <main style={{ flex: 1, padding: '28px 24px 60px', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
