import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Designer from './pages/Designer'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Auth from './pages/Auth'

export default function App(){
  return (
    <div className="min-h-screen text-white app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><span className="brand-mark">✦</span>Key Craft</Link>
        <nav className="site-nav">
          <Link to="/designer">Designer</Link>
          <Link to="/orders">Journal</Link>
          <Link to="/cart" className="cart-link">Cart <span>0</span></Link>
          <Link to="/auth" className="login-link">Log in <span>↗</span></Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/designer" element={<Designer/>} />
          <Route path="/product/:id" element={<Product/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/auth" element={<Auth/>} />
        </Routes>
      </main>
    </div>
  )
}
