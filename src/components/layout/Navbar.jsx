import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'

export default function Navbar() {
  const { cartItemCount, orders } = useShop()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/designer', label: 'Designer' },
    { path: '/orders', label: 'Orders', badge: orders.length > 0 ? orders.length : null },
    { path: '/cart', label: 'Cart', badge: cartItemCount > 0 ? cartItemCount : null, isCart: true },
  ]

  return (
    <header className="site-header">
      <Link to="/" className="brand flex items-center group">
        <span className="brand-mark group-hover:rotate-45 transition-transform duration-300">✦</span>
        <span>Key Craft</span>
      </Link>

      <nav className="site-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-tab-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="nav-badge">
                  {item.badge}
                </span>
              )}
              {isActive && <span className="nav-active-pill" />}
            </Link>
          )
        })}

        <Link to="/auth" className="login-link">
          <span>Log in</span>
          <span className="text-purple-400">↗</span>
        </Link>
      </nav>
    </header>
  )
}
