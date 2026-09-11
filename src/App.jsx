import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ShopProvider } from './context/ShopContext'
import AntigravityCanvas from './components/common/AntigravityCanvas'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Designer from './pages/Designer'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Auth from './pages/Auth'

function MainLayout() {
  return (
    <div className="min-h-screen text-white app-shell relative">
      {/* Dynamic 60fps Antigravity Fluid & Constellation Canvas */}
      <AntigravityCanvas />

      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  )
}
