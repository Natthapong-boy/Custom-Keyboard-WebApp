import Icon from '../../components/common/Icon'
import React, { useState, useEffect } from 'react'
import { useShop } from '../../context/ShopContext'
import { isOwnerRole } from '../../utils/roles'

export default function AdminStaff() {
  const { allUsers, refreshUsers, changeUserRole, currentUser } = useShop()
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const handleRoleChange = async (userId, newRole, userName) => {
    setUpdatingId(userId)
    try {
      await changeUserRole(userId, newRole)
      setToast(`เปลี่ยนสิทธิ์ของ "${userName}" เป็น ${newRole === 'owner' ? 'เจ้าของ' : newRole === 'staff' ? 'พนักงาน' : 'ลูกค้า'} สำเร็จแล้ว`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      alert(`ไม่สามารถเปลี่ยนสิทธิ์ได้: ${e.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span><Icon name="crown" /> สิทธิ์เจ้าของร้าน (Owner Access Control per Diagram 2)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          กำหนดสิทธิ์การเข้าถึงระบบ (Role & Permissions)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          เจ้าของร้านสามารถกำหนดและปรับเปลี่ยนสิทธิ์ของผู้ใช้งานในระบบ (ลูกค้า, พนักงาน, เจ้าของ) ข้อมูลบันทึกลง MongoDB Atlas ทันที
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="ค้นหาตามชื่อ หรืออีเมล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* User & Role Table */}
      <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ผู้ใช้งาน</th>
                <th className="py-3.5 px-4">อีเมล</th>
                <th className="py-3.5 px-4">เบอร์โทร</th>
                <th className="py-3.5 px-4">สิทธิ์ปัจจุบัน</th>
                <th className="py-3.5 px-4 text-right">กำหนดสิทธิ์เข้าถึง (เจ้าของกำหนด)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ไม่พบรายชื่อผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-purple-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          {user._id === currentUser?._id && (
                            <span className="text-[10px] text-purple-600 font-semibold">(คุณ)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">
                      {user.email}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {user.phone || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        isOwnerRole(user.role)
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'staff'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Icon name={isOwnerRole(user.role) ? 'crown' : user.role === 'staff' ? 'wrench' : 'user'} />{' '}
                        {user.role === 'ceo' ? 'CEO' : user.role === 'owner' ? 'เจ้าของ (Owner)' : user.role === 'staff' ? 'พนักงาน (Staff)' : 'ลูกค้า (Customer)'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoleChange(user._id, 'customer', user.name)}
                        disabled={updatingId === user._id || user.role === 'customer'}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          user.role === 'customer'
                            ? 'bg-slate-100 text-slate-400 border-transparent cursor-default'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ตั้งเป็น ลูกค้า
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleChange(user._id, 'staff', user.name)}
                        disabled={updatingId === user._id || user.role === 'staff'}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          user.role === 'staff'
                            ? 'bg-purple-600 text-white border-purple-600 cursor-default'
                            : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        ตั้งเป็น พนักงาน
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleChange(user._id, 'owner', user.name)}
                        disabled={updatingId === user._id || isOwnerRole(user.role)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isOwnerRole(user.role)
                            ? 'bg-amber-500 text-white border-amber-500 cursor-default'
                            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        ตั้งเป็น เจ้าของ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
