import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ShopProvider } from './context/ShopContext'
import AntigravityCanvas from './components/common/AntigravityCanvas'
import Navbar from './components/layout/Navbar'

// Storefront Pages
import Home from './pages/Home'
import Designer from './pages/Designer'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Auth from './pages/Auth'

// Admin & Staff Management Pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminProducts from './pages/admin/AdminProducts'
import AdminStaff from './pages/admin/AdminStaff'

function MainLayout() {
  return (
    <div className="min-h-screen text-white app-shell relative">
      <Routes>
        {/* Admin & Staff Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>

        {/* Storefront Customer Routes */}
        <Route
          path="*"
          element={
            <>
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
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
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
