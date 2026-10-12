import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'

export default function AdminLayout() {
  const { currentUser, switchRole, orders } = useShop()
  const location = useLocation()

  const pendingCount = orders.filter(o => ['pending_payment', 'checking_payment'].includes(o.status)).length

  const navLinks = [
    {
      path: '/admin',
      label: 'ภาพรวมร้านค้า',
      icon: '📊',
      desc: 'รายได้ / สินค้าขายดี / สต็อก',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/orders',
      label: 'รายการสั่งซื้อ',
      icon: '📦',
      badge: pendingCount > 0 ? pendingCount : null,
      desc: 'เปลี่ยนสถานะ / ออกใบเสร็จ',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/products',
      label: 'จัดการสินค้า',
      icon: '⌨️',
      desc: 'เพิ่ม / แก้ไข / ลบสินค้า',
      roles: ['owner', 'staff']
    },
    {
      path: '/admin/staff',
      label: 'จัดการผู้ใช้งาน',
      icon: '👥',
      tag: 'เจ้าของเท่านั้น',
      desc: 'จัดการสิทธิ์พนักงาน และลูกค้า',
      roles: ['owner', 'staff']
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
              ⌨️
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Key<span className="text-purple-600">Craft</span>
            </span>
          </Link>

          <span className="h-4 w-[1px] bg-purple-200 mx-1" />

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            🛠️ หลังบ้าน (สำหรับพนักงาน และเจ้าของ)
          </span>
        </div>

        {/* User Info & Storefront return */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span style={{ fontSize: 11, color: '#94A3B8' }}>บัญชีปัจจุบัน:</span>
            <span className="font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {currentUser?.role === 'owner' ? '👑 เจ้าของ' : '🛠️ พนักงาน'}
            </span>
          </div>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 transition-colors"
          >
            ไปหน้าร้านค้า ↗
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-purple-100 p-5 flex-shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
            เมนูจัดการ
          </div>

          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{link.icon}</span>
                    <div>
                      <div>{link.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>
                        {link.desc}
                      </div>
                    </div>
                  </div>

                  {link.badge != null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Role Switcher Box */}
          <div className="mt-8 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs">
            <div className="font-bold text-purple-900 mb-1">เลือกโหมดการใช้งาน:</div>
            <p className="text-slate-500 text-[11px] mb-3">
              สลับเพื่อทดสอบฟีเจอร์พนักงาน หรือเจ้าของ
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchRole('staff')}
                className={`py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                  currentUser?.role === 'staff'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                🛠️ พนักงาน
              </button>
              <button
                type="button"
                onClick={() => switchRole('owner')}
                className={`py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                  currentUser?.role === 'owner'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                👑 เจ้าของ
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
