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
    <div className="min-h-screen text-white">
      <header className="py-4 px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold brand">CustomKey</Link>
        <nav className="space-x-4">
          <Link to="/designer" className="hover:opacity-80">Designer</Link>
          <Link to="/orders" className="hover:opacity-80">Orders</Link>
          <Link to="/cart" className="hover:opacity-80">Cart</Link>
          <Link to="/auth" className="ml-4 px-3 py-1 rounded bg-primary text-black">Login</Link>
        </nav>
      </header>

      <main className="px-6">
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
