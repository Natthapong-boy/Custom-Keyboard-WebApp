import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPasswordApi } from '../services/api'
import Icon from '../components/common/Icon'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validate that link has required params
  const isValidLink = token && email

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
      return
    }

    if (password.trim().length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    try {
      await resetPasswordApi({ token, email, password: password.trim() })
      setSuccess(true)
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาขอลิงก์รีเซ็ตใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 px-3 sm:px-4 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-10 shadow-sm space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Icon name={success ? 'check' : 'lock'} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {success ? 'รีเซ็ตสำเร็จ!' : 'ตั้งรหัสผ่านใหม่'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {success
              ? 'รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว'
              : `สำหรับบัญชี ${email}`}
          </p>
        </div>

        {/* Invalid link */}
        {!isValidLink && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <div className="text-2xl">⚠️</div>
            <p className="text-rose-700 text-xs font-semibold">
              ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-2 px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all"
            >
              ขอลิงก์ใหม่
            </button>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-emerald-700 text-xs font-semibold">
                ✅ เปลี่ยนรหัสผ่านสำเร็จแล้ว!
              </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
            >
              เข้าสู่ระบบด้วยรหัสผ่านใหม่
            </button>
          </div>
        )}

        {/* Reset form */}
        {isValidLink && !success && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-600 mb-1">รหัสผ่านใหม่ *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} />
                </button>
              </div>
              <p className="text-slate-400 mt-1 ml-1">ความยาวอย่างน้อย 6 ตัวอักษร</p>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">ยืนยันรหัสผ่านใหม่ *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังดำเนินการ...' : '🔑 ยืนยันรีเซ็ตรหัสผ่าน'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors"
            >
              ← กลับไปเข้าสู่ระบบ
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
