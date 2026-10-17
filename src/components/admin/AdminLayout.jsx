import Icon from '../common/Icon'
import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { isOwnerRole } from '../../utils/roles'

export default function AdminLayout() {
  const { currentUser, orders } = useShop()
  const location = useLocation()

  const pendingCount = orders.filter(o => ['pending_payment', 'checking_payment'].includes(o.status)).length

  const navLinks = [
    {
      path: '/admin',
      label: 'ภาพรวมร้านค้า',
      icon: 'chart',
      desc: 'รายได้ / สินค้าขายดี / สต็อก',
      roles: ['owner', 'ceo', 'staff']
    },
    {
      path: '/admin/orders',
      label: 'รายการสั่งซื้อ',
      icon: 'package',
      badge: pendingCount > 0 ? pendingCount : null,
      desc: 'เปลี่ยนสถานะ / ออกใบเสร็จ',
      roles: ['owner', 'ceo', 'staff']
    },
    {
      path: '/admin/products',
      label: 'จัดการสินค้า',
      icon: 'keyboard',
      desc: 'เพิ่ม / แก้ไข / ลบสินค้า',
      roles: ['owner', 'ceo', 'staff']
    },
    {
      path: '/admin/staff',
      label: 'จัดการผู้ใช้งาน',
      icon: 'users',
      tag: 'เจ้าของเท่านั้น',
      desc: 'จัดการสิทธิ์พนักงาน และลูกค้า',
      roles: ['owner', 'ceo']
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
              <Icon name="sparkles" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Key<span className="text-purple-600">Craft</span>
            </span>
          </Link>

          <span className="h-4 w-[1px] bg-purple-200 mx-1" />

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 whitespace-nowrap">
            <Icon name="wrench" className="shrink-0" /> <span>หลังบ้าน (สำหรับพนักงานและเจ้าของ)</span>
          </span>
        </div>

        {/* User Info & Storefront return */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <span style={{ fontSize: 11, color: '#94A3B8' }}>บัญชีปัจจุบัน:</span>
            <span className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
              <Icon name={isOwnerRole(currentUser?.role) ? 'crown' : 'wrench'} className="shrink-0" />
              <span>{isOwnerRole(currentUser?.role) ? (currentUser?.role === 'ceo' ? 'CEO' : 'เจ้าของ') : 'พนักงาน'}</span>
            </span>
          </div>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 transition-colors"
          >
            ไปหน้าร้านค้า <Icon name="sparkles" />
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-purple-100 p-3 sm:p-5 flex-shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
            เมนูจัดการ
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-1.5">
            {navLinks.filter(link => link.roles.includes(currentUser?.role)).map((link) => {
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
                    <span className="text-base"><Icon name={link.icon} /></span>
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

        </aside>

        {/* Content Area */}
        <main className="min-w-0 flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
