import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'

export default function Navbar() {
  const { user, cartItemCount, orders, isStaff, isOwner } = useShop()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/designer', label: 'Designer' },
    { path: '/orders', label: 'Orders', badge: orders.length > 0 ? orders.length : null },
    { path: '/cart', label: 'Cart', badge: cartItemCount > 0 ? cartItemCount : null },
    ...((isStaff || isOwner) ? [{ path: '/admin', label: '🛠️ Staff Portal', isHighlight: true }] : [])
  ]

  return (
    <>
      <header
        className="site-header"
        style={{
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <Link to="/" className="brand">
          <span className="brand-mark">✦</span>
          <span>Key Craft</span>
        </Link>

        {/* Desktop / Tablet Nav */}
        <nav className="site-nav hidden md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-tab-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                {item.badge != null && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}

          {user ? (
            <Link to="/auth" className="login-link" title={user.name}>
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link to="/auth" className="login-link">
              <span>Log in</span>
            </Link>
          )}
        </nav>

        {/* Mobile Right Controls: Cart quick link + Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/cart"
            style={{
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>🛒</span>
            {cartItemCount > 0 && (
              <span className="nav-badge">{cartItemCount}</span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#ffffff',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 52,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 99,
            padding: '24px 20px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: isActive ? '#1c1c20' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid #3f3f46' : '1px solid rgba(255,255,255,0.06)',
                    color: isActive ? '#ffffff' : '#d4d4d8',
                    fontSize: 16,
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none'
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile User Profile Section */}
          <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {user ? (
              <Link
                to="/auth"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#18181b',
                  border: '1px solid #27272a',
                  textDecoration: 'none',
                  color: '#ffffff'
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{user.email}</div>
                </div>
              </Link>
            ) : (
              <Link
                to="/auth"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#09090b',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Log In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
