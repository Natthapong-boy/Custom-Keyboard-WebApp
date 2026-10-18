import Icon from '../common/Icon'
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { isOwnerRole, isStaffAccount } from '../../utils/roles'

export default function Navbar() {
  const { currentUser, cart, orders } = useShop()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const isStaff = isStaffAccount(currentUser)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'หน้าแรก', icon: 'home' },
    { path: '/designer', label: 'ประกอบคีย์บอร์ดเอง', icon: 'palette' },
    ...(!isStaff
      ? [{ path: '/orders', label: 'ติดตามคำสั่งซื้อ', icon: 'package', badge: orders.length > 0 ? orders.length : null }]
      : []),
    ...((currentUser?.role === 'staff' || isOwnerRole(currentUser?.role) || currentUser?.accountType === 'employee')
      ? [{ path: '/admin', label: 'ระบบหลังบ้าน', icon: 'settings', isHighlight: true }]
      : [])
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          height: 64,
          background: scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(250, 248, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(221, 214, 254, 0.6)',
          boxShadow: scrolled ? '0 4px 24px -4px rgba(124, 58, 237, 0.10)' : 'none'
        }}
      >
        <div className="h-full px-2 sm:px-6 lg:px-8 flex items-center" style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" style={{ textDecoration: 'none' }}>
            <div
              className="navbar-brand-mark flex items-center justify-center text-white rounded-xl shadow-md"
              style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: 20 }}><Icon name="sparkles" /></span>
            </div>
            <div>
              <span className="navbar-brand-name" style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Key<span style={{ color: '#7C3AED' }}>Craft</span>
              </span>
              <div
                className="hidden sm:block"
                style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED', letterSpacing: '0.05em', marginTop: 1 }}
              >
                Custom Keyboard
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── เรียงแนวนอน ── */}
          <nav
            className="hidden lg:flex items-center"
            style={{ marginLeft: 32, gap: 4, flex: 1 }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.path === '/designer' && isStaff) {
                      e.preventDefault()
                      alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 9999,
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    background: isActive
                      ? '#7C3AED'
                      : item.isHighlight
                      ? 'rgba(124,58,237,0.1)'
                      : 'transparent',
                    color: isActive
                      ? '#FFFFFF'
                      : item.isHighlight
                      ? '#7C3AED'
                      : '#475569',
                    boxShadow: isActive ? '0 2px 10px rgba(124,58,237,0.25)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                      e.currentTarget.style.color = '#7C3AED'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = item.isHighlight ? 'rgba(124,58,237,0.1)' : 'transparent'
                      e.currentTarget.style.color = item.isHighlight ? '#7C3AED' : '#475569'
                    }
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 9999,
                        background: isActive ? 'rgba(255,255,255,0.3)' : '#7C3AED',
                        color: isActive ? '#FFF' : '#FFF',
                        lineHeight: 1.4
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Right Side Actions ── */}
          <div className="navbar-actions flex items-center gap-2 ml-auto">

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="navbar-cart"
              aria-label="ตะกร้าสินค้า"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 9999,
                background: 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 20 }}><Icon name="cart" /></span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    background: '#7C3AED',
                    color: '#FFF',
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(124,58,237,0.4)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Avatar / Login */}
            {currentUser ? (
              <Link
                to="/auth"
                className="navbar-account-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px 5px 5px',
                  borderRadius: 9999,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#FAF5FF'
                  e.currentTarget.style.borderColor = '#DDD6FE'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: 28, height: 28, borderRadius: 9999, objectFit: 'cover', border: '2px solid #DDD6FE' }}
                />
                <span
                  className="hidden sm:inline"
                  style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {currentUser.name}
                </span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="navbar-account-link"
                style={{
                  padding: '8px 18px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFF',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-menu-toggle lg:hidden"
              aria-label="เปิดเมนู"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                background: mobileMenuOpen ? 'rgba(124,58,237,0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: '#475569',
                transition: 'background 0.15s'
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed animate-fadeIn"
          style={{
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: 'rgba(250,248,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid #EDE9FE',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 16px',
            overflowY: 'auto'
          }}
        >
          {/* Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>
              เมนูหลัก
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.path === '/designer' && isStaff) {
                      e.preventDefault()
                      alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
                      return
                    }
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 16,
                    textDecoration: 'none',
                    background: isActive
                      ? 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)'
                      : item.isHighlight
                      ? 'rgba(124,58,237,0.07)'
                      : '#F8FAFC',
                    color: isActive ? '#FFF' : '#1E293B',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 15,
                    boxShadow: isActive ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
                    border: isActive ? 'none' : '1px solid #F1F5F9',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge != null && (
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 800,
                        background: isActive ? 'rgba(255,255,255,0.25)' : '#7C3AED',
                        color: '#FFF'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Cart in mobile */}
            <Link
              to="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 16,
                textDecoration: 'none',
                background: location.pathname === '/cart' ? 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' : '#F8FAFC',
                color: location.pathname === '/cart' ? '#FFF' : '#1E293B',
                fontWeight: 600,
                fontSize: 15,
                border: '1px solid #F1F5F9'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}><Icon name="cart" /></span>
                <span>ตะกร้าสินค้า</span>
              </span>
              {cartCount > 0 && (
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: '#7C3AED',
                    color: '#FFF'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* User Profile Footer */}
          <div style={{ borderTop: '1px solid #EDE9FE', paddingTop: 16, marginTop: 20 }}>
            {currentUser ? (
              <Link
                to="/auth"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#FAF5FF',
                  borderRadius: 16,
                  border: '1px solid #EDE9FE',
                  textDecoration: 'none'
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover', border: '2px solid #DDD6FE' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{currentUser.name}</div>
                  <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>{currentUser.email}</div>
                </div>
              </Link>
            ) : (
              <Link
                to="/auth"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)'
                }}
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
