import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../common/Icon'
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

  const isActivePath = (path) => location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path))

  const handleNavClick = (event, item, closeMobileMenu = false) => {
    if (item.path === '/designer' && isStaff) {
      event.preventDefault()
      alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
      return
    }

    if (closeMobileMenu) setMobileMenuOpen(false)
  }

  return (
    <>
      <header className={`store-header${scrolled ? ' store-header--scrolled' : ''}`}>
        <div className="store-header__inner">
          <Link to="/" className="store-brand" aria-label="KeyCraft - หน้าแรก">
            <span className="store-brand__mark">
              <Icon name="sparkles" size={19} strokeWidth={2} />
            </span>
            <span className="store-brand__copy">
              <span className="store-brand__name">KeyCraft</span>
              <span className="store-brand__caption">CUSTOM KEYBOARD STUDIO</span>
            </span>
          </Link>

          <nav className="store-nav" aria-label="เมนูหลัก">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(event) => handleNavClick(event, item)}
                  className={[
                    'store-nav__link',
                    isActive && 'is-active',
                    item.isHighlight && 'is-highlight'
                  ].filter(Boolean).join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                  {item.badge != null && <span className="store-nav__badge">{item.badge}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="store-actions">
            <Link
              to="/designer"
              onClick={(event) => handleNavClick(event, { path: '/designer' })}
              className="store-header__cta"
            >
              ออกแบบคีย์บอร์ด <Icon name="arrowRight" size={15} />
            </Link>
            <Link to="/cart" className="store-cart" aria-label={`ตะกร้าสินค้า${cartCount > 0 ? ` (${cartCount} รายการ)` : ''}`}>
              <Icon name="cart" size={19} />
              <span className="store-cart__label">ตะกร้า</span>
              {cartCount > 0 && <span className="store-cart__count">{cartCount}</span>}
            </Link>

            {currentUser ? (
              <Link to="/auth" className="store-account" aria-label={`บัญชีของ ${currentUser.name}`}>
                <img src={currentUser.avatar} alt="" className="store-account__avatar" />
                <span className="store-account__name">{currentUser.name}</span>
              </Link>
            ) : (
              <Link to="/auth" className="store-signin">เข้าสู่ระบบ</Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="store-menu-toggle"
              aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
              aria-expanded={mobileMenuOpen}
              aria-controls="store-mobile-menu"
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={19} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="store-mobile-menu" id="store-mobile-menu">
          <div className="store-mobile-menu__content">
            <p className="store-mobile-menu__eyebrow">เมนูหลัก</p>
            <nav className="store-mobile-nav" aria-label="เมนูสำหรับมือถือ">
              {navItems.map((item) => {
                const isActive = isActivePath(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(event) => handleNavClick(event, item, true)}
                    className={[
                      'store-mobile-nav__link',
                      isActive && 'is-active',
                      item.isHighlight && 'is-highlight'
                    ].filter(Boolean).join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="store-mobile-nav__label">
                      <Icon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge != null && <span className="store-mobile-nav__badge">{item.badge}</span>}
                  </Link>
                )
              })}

              <Link
                to="/cart"
                className={`store-mobile-nav__link${location.pathname === '/cart' ? ' is-active' : ''}`}
              >
                <span className="store-mobile-nav__label">
                  <Icon name="cart" size={18} />
                  <span>ตะกร้าสินค้า</span>
                </span>
                {cartCount > 0 && <span className="store-mobile-nav__badge">{cartCount}</span>}
              </Link>
            </nav>

            <Link
              to="/designer"
              onClick={(event) => handleNavClick(event, { path: '/designer' }, true)}
              className="store-mobile-menu__cta"
            >
              ออกแบบคีย์บอร์ด <Icon name="arrowRight" size={17} />
            </Link>

            <div className="store-mobile-menu__footer">
              {currentUser ? (
                <Link to="/auth" className="store-mobile-account">
                  <img src={currentUser.avatar} alt="" className="store-account__avatar" />
                  <span className="store-mobile-account__copy">
                    <span className="store-mobile-account__name">{currentUser.name}</span>
                    <span className="store-mobile-account__email">{currentUser.email}</span>
                  </span>
                  <Icon name="arrowRight" size={17} />
                </Link>
              ) : (
                <Link to="/auth" className="store-mobile-signin">
                  เข้าสู่ระบบ / สมัครสมาชิก
                  <Icon name="arrowRight" size={17} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
