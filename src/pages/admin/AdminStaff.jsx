import Icon from '../../components/common/Icon'
import React, { useState, useEffect } from 'react'
import { useShop } from '../../context/ShopContext'
import { isOwnerRole } from '../../utils/roles'

export default function AdminStaff() {
  const { allUsers, refreshUsers, changeUserRole, addStaff, deleteUser, updateUser, currentUser } = useShop()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Delete User Confirmation State
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Add / Edit Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submittingStaff, setSubmittingStaff] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const showToastMsg = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleRoleChange = async (userId, newRole, userName) => {
    setUpdatingId(userId)
    try {
      await changeUserRole(userId, newRole)
      showToastMsg(`เปลี่ยนสิทธิ์ของ "${userName}" เป็น ${newRole === 'owner' ? 'เจ้าของ' : newRole === 'staff' ? 'พนักงาน' : 'ลูกค้า'} สำเร็จแล้ว`)
    } catch (e) {
      alert(`ไม่สามารถเปลี่ยนสิทธิ์ได้: ${e.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (!user?._id) return
    setDeletingId(user._id)
    try {
      await deleteUser(user._id)
      setConfirmDeleteUser(null)
      showToastMsg(`ลบผู้ใช้งาน "${user.name}" ออกจากระบบสำเร็จแล้ว`)
    } catch (e) {
      alert(`ไม่สามารถลบผู้ใช้งานได้: ${e.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Open Edit User Modal (Pre-fills existing user info)
  const handleOpenEditModal = (user) => {
    setEditingUser(user)
    setStaffFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '' // empty by default: only filled if owner wants to reset password
    })
    setShowPassword(false)
    setFormError(null)
    setIsAddModalOpen(true)
  }

  // Handle Modal Form Submit (Both Add Staff and Edit User)
  const handleSaveUserModal = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!staffFormData.name.trim() || !staffFormData.email.trim()) {
      setFormError('กรุณากรอกชื่อ และอีเมลให้ครบถ้วน')
      return
    }

    if (editingUser) {
      // EDIT MODE
      const isStaffUser = editingUser.role === 'staff' || editingUser.role === 'artisan'
      if (isStaffUser && staffFormData.password && staffFormData.password.length < 6) {
        setFormError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        return
      }

      setSubmittingStaff(true)
      try {
        const payload = {
          name: staffFormData.name.trim(),
          email: staffFormData.email.trim(),
          phone: staffFormData.phone.trim()
        }
        if (isStaffUser && staffFormData.password && staffFormData.password.trim()) {
          payload.password = staffFormData.password.trim()
        }

        await updateUser(editingUser._id, payload)
        const updatedName = staffFormData.name.trim()
        setIsAddModalOpen(false)
        setEditingUser(null)
        setStaffFormData({ name: '', email: '', phone: '', password: '' })
        setShowPassword(false)
        showToastMsg(`แก้ไขข้อมูลผู้ใช้งาน "${updatedName}" สำเร็จเรียบร้อยแล้ว`)
      } catch (err) {
        setFormError(err.message || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setSubmittingStaff(false)
      }
    } else {
      // CREATE MODE (New Staff)
      if (!staffFormData.password) {
        setFormError('กรุณากรอกรหัสผ่านสำหรับเข้าสู่ระบบ')
        return
      }

      if (staffFormData.password.length < 6) {
        setFormError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        return
      }

      setSubmittingStaff(true)
      try {
        await addStaff({
          name: staffFormData.name.trim(),
          email: staffFormData.email.trim(),
          phone: staffFormData.phone.trim(),
          password: staffFormData.password
        })

        const createdName = staffFormData.name.trim()
        setIsAddModalOpen(false)
        setStaffFormData({ name: '', email: '', phone: '', password: '' })
        setShowPassword(false)
        showToastMsg(`เพิ่มพนักงาน "${createdName}" สำเร็จแล้ว สามารถใช้ล็อกอินได้ทันที`)
      } catch (err) {
        setFormError(err.message || 'ไม่สามารถสร้างบัญชีพนักงานได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setSubmittingStaff(false)
      }
    }
  }

  // Role counters (Supports owner, ceo, admin, staff, artisan, customer)
  const totalCount = allUsers.length
  const customerCount = allUsers.filter(u => {
    const r = String(u.role || '').toLowerCase().trim()
    return r === 'customer' || (!isOwnerRole(r) && r !== 'staff' && r !== 'artisan')
  }).length
  const staffCount = allUsers.filter(u => {
    const r = String(u.role || '').toLowerCase().trim()
    return r === 'staff' || r === 'artisan'
  }).length
  const ownerCount = allUsers.filter(u => isOwnerRole(u.role)).length

  // Synchronized Filter & Multi-field Smart Search (ID, Name, Email, Phone)
  const filteredUsers = allUsers.filter(u => {
    const r = String(u.role || '').toLowerCase().trim()

    // 1. Role Filter (coordinated with active tab / dropdown)
    if (roleFilter === 'customer' && (isOwnerRole(r) || r === 'staff' || r === 'artisan')) return false
    if (roleFilter === 'staff' && r !== 'staff' && r !== 'artisan') return false
    if (roleFilter === 'owner' && !isOwnerRole(r)) return false

    // 2. Multi-field Search Query Handling
    const query = searchTerm.trim()
    if (!query) return true

    const raw = query.toLowerCase()
    // Strip '#' symbol(s) for flexible ID matching (e.g. '#6ab' or '6ab')
    const noHash = raw.replace(/#/g, '').trim()
    // Strip '*' symbol(s) for direct substring comparison
    const strippedRaw = raw.replace(/\*/g, '').trim()
    const strippedNoHash = noHash.replace(/\*/g, '').trim()

    // Prepare Wildcard Regex if '*' is present (e.g. *564*, *c9, 6a*8)
    let wildcardRegex = null
    let wildcardRegexNoHash = null
    if (raw.includes('*')) {
      try {
        const escapeRegex = (s) => s.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
        if (strippedRaw) {
          wildcardRegex = new RegExp(escapeRegex(raw).replace(/\\\*/g, '.*'), 'i')
        }
        if (strippedNoHash) {
          wildcardRegexNoHash = new RegExp(escapeRegex(noHash).replace(/\\\*/g, '.*'), 'i')
        }
      } catch {
        wildcardRegex = null
        wildcardRegexNoHash = null
      }
    }

    // Target values to test against (Full ID, Short ID, Formatted IDs, Name, Email, Phone)
    const rawId = String(u._id || u.userId || u.id || '').toLowerCase()
    const shortId = rawId.slice(0, 8)
    const formattedId = `#${shortId}`
    const fullFormattedId = `#${rawId}`
    const name = String(u.name || '').toLowerCase()
    const email = String(u.email || '').toLowerCase()
    const phone = String(u.phone || '').toLowerCase()
    const cleanPhone = phone.replace(/[- ]/g, '')

    const targetFields = [
      rawId,
      shortId,
      formattedId,
      fullFormattedId,
      name,
      email,
      phone,
      cleanPhone
    ]

    return targetFields.some(field => {
      if (!field) return false
      // Exact / Substring match (partial match at beginning, middle, or end)
      if (field.includes(raw)) return true
      if (noHash && field.includes(noHash)) return true
      if (strippedRaw && field.includes(strippedRaw)) return true
      if (strippedNoHash && field.includes(strippedNoHash)) return true

      // Wildcard regex match
      if (wildcardRegex && wildcardRegex.test(field)) return true
      if (wildcardRegexNoHash && wildcardRegexNoHash.test(field)) return true

      return false
    })
  })

  // Dynamic Header Title for the ID column based on active filter
  const idHeaderTitle =
    roleFilter === 'customer' ? 'รหัสลูกค้า' :
    roleFilter === 'staff' ? 'รหัสพนักงาน' :
    roleFilter === 'owner' ? 'รหัสเจ้าของร้าน' :
    'รหัสผู้ใช้งาน'

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header with Title and '+ เพิ่มพนักงาน' Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <button
          type="button"
          onClick={() => {
            setEditingUser(null)
            setStaffFormData({ name: '', email: '', phone: '', password: '' })
            setShowPassword(false)
            setFormError(null)
            setIsAddModalOpen(true)
          }}
          className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="text-base font-extrabold leading-none">+</span>
          <span>เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-purple-100 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Multi-field Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" />
              </span>
              <input
                type="text"
                placeholder="ค้นหารหัส, ชื่อ, อีเมล หรือเบอร์โทรศัพท์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter Dropdown */}
            <div className="relative min-w-[210px]">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/20 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-purple-400 focus:outline-none shadow-sm cursor-pointer appearance-none pr-8"
              >
                <option value="all">ทั้งหมด (All) ({totalCount})</option>
                <option value="customer">ลูกค้า (Customer) ({customerCount})</option>
                <option value="staff">พนักงาน (Staff) ({staffCount})</option>
                <option value="owner">เจ้าของ (Owner) ({ownerCount})</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                <Icon name="chevronDown" />
              </span>
            </div>
          </div>

          {/* Quick Role Buttons (1-click filter with badges) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'ทั้งหมด (All)', count: totalCount },
              { id: 'customer', label: 'ลูกค้า (Customer)', count: customerCount },
              { id: 'staff', label: 'พนักงาน (Staff)', count: staffCount },
              { id: 'owner', label: 'เจ้าของ (Owner)', count: ownerCount }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  roleFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-slate-50 hover:bg-purple-50 text-slate-600 border border-slate-200/80 hover:border-purple-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  roleFilter === tab.id ? 'bg-purple-700 text-purple-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-purple-50">
          <div>
            แสดงผล <span className="font-bold text-purple-700">{filteredUsers.length}</span> จากทั้งหมด <span className="font-bold text-slate-700">{allUsers.length}</span> รายชื่อ
            {roleFilter !== 'all' && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                กรอง: {roleFilter === 'owner' ? 'เจ้าของ (Owner)' : roleFilter === 'staff' ? 'พนักงาน (Staff)' : 'ลูกค้า (Customer)'}
              </span>
            )}
            {searchTerm.trim() && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                คำค้น: "{searchTerm.trim()}"
              </span>
            )}
          </div>
          {(roleFilter !== 'all' || searchTerm.trim()) && (
            <button
              type="button"
              onClick={() => {
                setRoleFilter('all')
                setSearchTerm('')
              }}
              className="text-purple-600 hover:underline font-semibold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* User & Role Table */}
      <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">{idHeaderTitle}</th>
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
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <div className="text-2xl"><Icon name="users" /></div>
                    <div className="font-medium text-slate-500">ไม่พบรายชื่อผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง</div>
                    {(roleFilter !== 'all' || searchTerm.trim()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter('all')
                          setSearchTerm('')
                        }}
                        className="px-4 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
                      >
                        รีเซ็ตการค้นหาและตัวกรอง
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = Boolean(
                    currentUser && (
                      (user._id && currentUser._id && String(user._id) === String(currentUser._id)) ||
                      (user.email && currentUser.email && String(user.email).toLowerCase().trim() === String(currentUser.email).toLowerCase().trim())
                    )
                  )
                  const isOwner = isOwnerRole(user.role)
                  const userRole = String(user.role || '').toLowerCase().trim()
                  const isStaff = userRole === 'staff' || userRole === 'artisan'

                  return (
                    <tr key={user._id} className="hover:bg-purple-50/20 transition-colors">
                      {/* 1. User ID Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50/90 hover:bg-purple-100 border border-purple-200/80 px-2.5 py-1 rounded-xl transition-colors cursor-default select-all"
                          title={`Full ID: ${user._id}`}
                        >
                          #{String(user._id).slice(0, 8)}
                        </span>
                      </td>

                      {/* 2. User Info Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-purple-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                              {isSelf && (
                                <span className="text-[10px] text-purple-700 font-extrabold px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1">
                                  <Icon name="crown" /> (คุณ)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Email Column */}
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {user.email}
                      </td>

                      {/* 4. Phone Column */}
                      <td className="py-4 px-4 text-slate-500 font-mono">
                        {user.phone || '-'}
                      </td>

                      {/* 5. Role Badge Column */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          isOwner
                            ? 'bg-amber-100 text-amber-800'
                            : user.role === 'staff'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Icon name={isOwner ? 'crown' : user.role === 'staff' ? 'wrench' : 'user'} />{' '}
                          {user.role === 'ceo' ? 'CEO' : user.role === 'owner' ? 'เจ้าของ (Owner)' : user.role === 'staff' ? 'พนักงาน (Staff)' : 'ลูกค้า (Customer)'}
                        </span>
                      </td>

                      {/* 6. Role & Delete Action Column */}
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isSelf ? (
                          <div className="inline-flex items-center gap-1.5" title="ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตนเองได้ เพื่อความปลอดภัยของระบบ">
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl inline-flex items-center gap-1 mr-1">
                              <Icon name="shield" /> บัญชีของคุณ (ล็อคสิทธิ์)
                            </span>
                            <button
                              type="button"
                              disabled={true}
                              title="ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                            >
                              ตั้งเป็น ลูกค้า
                            </button>

                            <button
                              type="button"
                              disabled={true}
                              title="ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                            >
                              ตั้งเป็น พนักงาน
                            </button>

                            <button
                              type="button"
                              disabled={true}
                              title="ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed opacity-80"
                            >
                              ตั้งเป็น เจ้าของ
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(user._id, 'customer', user.name)}
                              disabled={updatingId === user._id || user.role === 'customer'}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                user.role === 'customer'
                                  ? 'bg-slate-100 text-slate-400 border-transparent cursor-default'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
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
                                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer'
                              }`}
                            >
                              ตั้งเป็น พนักงาน
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRoleChange(user._id, 'owner', user.name)}
                              disabled={updatingId === user._id || isOwner}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                isOwner
                                  ? 'bg-amber-500 text-white border-amber-500 cursor-default'
                                  : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer'
                              }`}
                            >
                              ตั้งเป็น เจ้าของ
                            </button>

                            {/* Edit User Button - Only rendered for Staff members */}
                            {isStaff && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                disabled={updatingId === user._id || deletingId === user._id}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title={`แก้ไขข้อมูล ${user.name}`}
                              >
                                <Icon name="pencil" /> แก้ไข
                              </button>
                            )}

                            {/* Delete User Button - Never displayed or allowed for Owner */}
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUser(user)}
                                disabled={deletingId === user._id || updatingId === user._id}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title={`ลบผู้ใช้งาน ${user.name}`}
                              >
                                <Icon name="trash" /> ลบ
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ยืนยันการลบผู้ใช้งาน (Confirm Delete User Dialog) */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              <Icon name="trash" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">
                ยืนยันการลบผู้ใช้งาน
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งาน <strong className="text-slate-800">"{confirmDeleteUser.name}"</strong> ({confirmDeleteUser.email}) ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={deletingId === confirmDeleteUser._id}
                onClick={() => handleDeleteUser(confirmDeleteUser)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deletingId === confirmDeleteUser._id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ลบผู้ใช้งาน</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={deletingId === confirmDeleteUser._id}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่มพนักงานใหม่ / แก้ไขข้อมูลผู้ใช้งาน (Add / Edit User Modal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                  <Icon name={editingUser ? 'pencil' : 'wrench'} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มพนักงานใหม่เข้าสู่ระบบ'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser
                      ? `แก้ไขข้อมูลของ ${editingUser.name} (${editingUser.role === 'staff' ? 'พนักงาน' : isOwnerRole(editingUser.role) ? 'เจ้าของร้าน' : 'ลูกค้า'})`
                      : 'สร้างบัญชีพนักงานสำหรับเข้าใช้งานระบบหลังบ้าน'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingUser(null)
                  setFormError(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message Alert */}
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="font-bold text-sm">⚠</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Role Notice / Badge */}
            {editingUser ? (
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">บทบาทในระบบ:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    isOwnerRole(editingUser.role)
                      ? 'bg-amber-100 text-amber-800'
                      : editingUser.role === 'staff'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {editingUser.role === 'staff' ? 'พนักงาน (Staff)' : isOwnerRole(editingUser.role) ? 'เจ้าของ (Owner)' : 'ลูกค้า (Customer)'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-lg">
                  #{String(editingUser._id).slice(0, 8)}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-700">
                  <Icon name="sparkles" /> กำหนดสิทธิ์อัตโนมัติ: พนักงาน (Staff)
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  บัญชีที่สร้างจะได้รับสิทธิ์พนักงานทันที สามารถนำอีเมลและรหัสผ่านไปล็อกอินที่หน้า <strong>/auth</strong> เพื่อจัดการสินค้าและคำสั่งซื้อได้ทันที
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveUserModal} className="space-y-3.5 text-xs">
              {/* 1. Name */}
              <div>
                <label htmlFor="staff-name" className="block font-bold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  id="staff-name"
                  name="name"
                  type="text"
                  required
                  placeholder="เช่น สมชาย สายช่าง"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/20 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              {/* 2. Phone */}
              <div>
                <label htmlFor="staff-phone" className="block font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="staff-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="เช่น 081-234-5678"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/20 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none font-mono"
                />
              </div>

              {/* 3. Email */}
              <div>
                <label htmlFor="staff-email" className="block font-bold text-slate-700 mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบ) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="เช่น staff01@keycraft.com"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/20 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none font-mono"
                />
              </div>

              {/* 4. Password Section */}
              {/* Case A: Creating New Staff */}
              {!editingUser && (
                <div>
                  <label htmlFor="staff-password" className="block font-bold text-slate-700 mb-1">
                    รหัสผ่านเข้าสู่ระบบ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="staff-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-purple-200 bg-purple-50/20 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-600 text-xs cursor-pointer"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size="1.2em" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    รหัสผ่านจะถูกเข้ารหัสความปลอดภัยด้วย bcrypt โดยอัตโนมัติ
                  </p>
                </div>
              )}

              {/* Case B: Editing Staff User (Owner Password Management) */}
              {editingUser && (editingUser.role === 'staff' || editingUser.role === 'artisan') && isOwnerRole(currentUser?.role) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="edit-staff-password" className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Icon name="shield" className="text-purple-600" /> ตั้งรหัสผ่านใหม่ (Reset Password)
                    </label>
                    <span className="text-[10px] text-purple-600 font-bold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      เฉพาะเจ้าของร้าน
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="edit-staff-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน (หรือพิมพ์รหัสใหม่ 6+ ตัวอักษร)"
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-600 text-xs cursor-pointer"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size="1.2em" />
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                    <strong className="text-slate-700">🔒 หมายเหตุความปลอดภัย:</strong> รหัสผ่านเดิมถูกเข้ารหัสความปลอดภัย (Bcrypt Hash) จึงไม่สามารถดึงกลับมาเป็นตัวหนังสือได้ หากพนักงานลืมรหัสผ่าน คุณสามารถพิมพ์รหัสผ่านใหม่และกดบันทึกเพื่อรีเซ็ตได้ทันที (หากปล่อยว่างไว้ รหัสผ่านเดิมจะไม่เปลี่ยนแปลง)
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingStaff ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{editingUser ? 'กำลังบันทึกข้อมูล...' : 'กำลังสร้างบัญชี...'}</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'บันทึกข้อมูลที่แก้ไข' : 'บันทึกและสร้างบัญชีพนักงาน'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingUser(null)
                    setFormError(null)
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
