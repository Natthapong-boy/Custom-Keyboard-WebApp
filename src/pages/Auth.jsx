import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { registerUserApi, loginUserApi, getMeApi } from '../services/api'

export default function Auth() {
  const { user, token, login, logout, showToast } = useShop()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!formData.name.trim()) throw new Error('กรุณากรอกชื่อ-นามสกุล')
        if (!formData.email.trim()) throw new Error('กรุณากรอกอีเมล')
        if (formData.password.length < 6) throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        const res = await registerUserApi({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone })
        login(res, res.token)
        showToast(`ยินดีต้อนรับสู่ Key Craft, ${res.name}!`)
      } else {
        if (!formData.email.trim() || !formData.password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
        const res = await loginUserApi({ email: formData.email, password: formData.password })
        login(res, res.token)
        showToast(`ยินดีต้อนรับกลับ, ${res.name}!`)
      }
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeIn">

        {user ? (
          /* ====== LOGGED IN STATE ====== */
          <div className="space-y-5">
            {/* Profile Header */}
            <div className="profile-card pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={user.name}
                className="profile-avatar"
              />
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <span className="profile-role">{user.role || 'Customer'}</span>
            </div>

            {/* Account Info */}
            <div>
              <div className="profile-info-row">
                <span className="label">โทรศัพท์</span>
                <span className="value">{user.phone || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="label">สถานะ</span>
                <span className="value flex items-center gap-1.5">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  เชื่อมต่อแล้ว
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/designer')}
                className="auth-submit"
              >
                ออกแบบแป้นพิมพ์ของคุณ
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="btn-secondary"
              >
                ดูคำสั่งซื้อ
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn-danger"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        ) : (
          /* ====== LOGIN / REGISTER FORM ====== */
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="brand" style={{ justifyContent: 'center', marginBottom: 8 }}>
                <span className="brand-mark">✦</span>
                <span>Key Craft</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
                {mode === 'login' ? 'ลงชื่อเข้าสู่บัญชีของคุณ' : 'สร้างบัญชีใหม่'}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="auth-tab-bar">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setErrorMsg('') }}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setErrorMsg('') }}
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="auth-error animate-slideDown">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="auth-label">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="เช่น นัฐพงษ์ ศรีสมพร"
                    className="auth-input"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="auth-label">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="auth-input"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="auth-label" style={{ margin: 0 }}>รหัสผ่าน</label>
                  <button
                    type="button"
                    className="show-pass-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={mode === 'register' ? 'อย่างน้อย 6 ตัวอักษร' : '••••••••'}
                  className="auth-input"
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="auth-label">เบอร์โทรศัพท์ <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08X-XXX-XXXX"
                    className="auth-input"
                    autoComplete="tel"
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTopColor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        animation: 'spinOrb 0.7s linear infinite',
                        display: 'inline-block',
                        flexShrink: 0
                      }}
                    />
                    กำลังดำเนินการ...
                  </>
                ) : mode === 'register' ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {/* Footer switch */}
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', margin: '16px 0 0' }}>
              {mode === 'login' ? (
                <>ยังไม่มีบัญชี?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMsg('') }}
                    style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }}
                  >
                    สร้างบัญชีใหม่
                  </button>
                </>
              ) : (
                <>มีบัญชีอยู่แล้ว?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg('') }}
                    style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }}
                  >
                    เข้าสู่ระบบ
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
