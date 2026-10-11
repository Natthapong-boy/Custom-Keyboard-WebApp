import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop, DEMO_ROLES } from '../context/ShopContext'
import { registerUserApi, loginUserApi } from '../services/api'

export default function Auth() {
  const { currentUser, setCurrentUser, switchRole, logout } = useShop()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await registerUserApi(formData)
        setCurrentUser(res)
        navigate('/')
      } else {
        const res = await loginUserApi({ email: formData.email, password: formData.password })
        setCurrentUser(res)
        navigate('/')
      }
    } catch (err) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-28 pb-24 px-4 max-w-lg mx-auto">
      {currentUser ? (
        /* Logged in Profile Card */
        <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-purple-200">
            <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {currentUser.role === 'owner' ? '👑 เจ้าของร้าน' : currentUser.role === 'staff' ? '🛠️ พนักงาน' : '👤 ลูกค้า'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          <div className="pt-4 border-t border-purple-50 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-full bg-purple-600 text-white font-bold text-xs"
            >
              ไปหน้าแรก
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-6 py-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      ) : (
        /* Login / Register Form */
        <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-10 shadow-sm space-y-6 animate-fadeIn">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              ⌨️
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {mode === 'login' ? 'เข้าสู่ระบบ Key Craft' : 'สมัครสมาชิกใหม่'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login' ? 'เข้าสู่ระบบเพื่อติดตามสถานะคำสั่งซื้อและจัดการบัญชี' : 'สร้างบัญชีเพื่อเริ่มต้นสั่งซื้อคีย์บอร์ด'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-purple-50 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg('') }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg('') }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-bold text-slate-600 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ณัฐพงษ์ ใจมั่นคง"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-600 mb-1">อีเมล *</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">รหัสผ่าน *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-bold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  placeholder="081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'ยืนยันสมัครสมาชิก'}
            </button>
          </form>

          {/* Quick Demo Switcher for Diagram Roles */}
          <div className="pt-4 border-t border-purple-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              เข้าสู่ระบบด่วนเพื่อทดสอบสิทธิ์ตาม Diagram
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    switchRole(r.role)
                    navigate('/')
                  }}
                  className="py-2 px-2 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 text-[11px] font-bold text-purple-800 transition-colors text-center"
                >
                  {r.role === 'customer' ? '👤 ลูกค้า' : r.role === 'staff' ? '🛠️ พนักงาน' : '👑 เจ้าของ'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
