import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useShop, DEMO_ROLES } from '../../context/ShopContext'

export default function Navbar() {
  const { currentUser, cart, orders, switchRole } = useShop()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setRoleMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'หน้าแรก' },
    { path: '/designer', label: 'ประกอบคีย์บอร์ดเอง' },
    { path: '/orders', label: 'ติดตามคำสั่งซื้อ', badge: orders.length > 0 ? orders.length : null },
    { path: '/cart', label: 'ตะกร้าสินค้า', badge: cartCount > 0 ? cartCount : null },
    ...((currentUser?.role === 'staff' || currentUser?.role === 'owner')
      ? [{ path: '/admin', label: '🛠️ ระบบจัดการหลังบ้าน', isHighlight: true }]
      : [])
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(250, 248, 255, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(221, 214, 254, 0.7)',
          boxShadow: scrolled ? '0 4px 20px -2px rgba(124, 58, 237, 0.08)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">⌨️</span>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
                Key<span className="text-purple-600">Craft</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Custom Keyboard
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                      : item.isHighlight
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'text-slate-640 hover:text-purple-700 hover:bg-purple-50 text-slate-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Role Switcher & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Role Switcher Pill (Helpful for testing Diagram roles: Customer / Staff / Owner) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 transition-colors"
                title="คลิกเพื่อสลับบทบาททดสอบตาม Diagram (ลูกค้า / พนักงาน / เจ้าของ)"
              >
                <span>สิทธิ์:</span>
                <span className="font-bold text-purple-700 underline">
                  {currentUser?.role === 'owner'
                    ? '👑 เจ้าของ'
                    : currentUser?.role === 'staff'
                    ? '🛠️ พนักงาน'
                    : '👤 ลูกค้า'}
                </span>
                <span className="text-[10px]">▼</span>
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-purple-100 p-2 z-50 animate-fadeIn"
                >
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    สลับบทบาทตาม Diagram
                  </div>
                  {DEMO_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        switchRole(r.role)
                        setRoleMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                        currentUser?.role === r.role
                          ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{r.name}</span>
                        {currentUser?.role === r.role && <span className="text-purple-600">✓</span>}
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full text-slate-700 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center"
              aria-label="ตะกร้าสินค้า"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Avatar / Login */}
            {currentUser ? (
              <Link
                to="/auth"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-all text-xs font-semibold text-slate-800"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-purple-200"
                />
                <span className="hidden sm:inline max-w-[85px] truncate">{currentUser.name}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-purple-50 text-xl"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white/95 backdrop-blur-xl p-6 flex flex-col justify-between border-t border-purple-100 md:hidden animate-fadeIn"
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-purple-50/60 text-slate-800 hover:bg-purple-100/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-purple-600">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="pt-6 border-t border-slate-100">
            {currentUser ? (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                  <div className="text-xs text-purple-700 font-medium">{currentUser.email}</div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="w-full block py-3 rounded-2xl bg-purple-600 text-white text-center font-bold"
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
