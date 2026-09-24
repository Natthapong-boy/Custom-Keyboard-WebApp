import React, { useState } from 'react'
import { useShop } from '../../context/ShopContext'

export default function AdminStaff() {
  const { staffList, addStaffMember, toggleStaffStatus, deleteStaffMember, isOwner, switchDemoRole } = useShop()
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    title: 'Artisan Assembly Specialist',
    department: 'Workshop',
    shift: 'Morning (08:30 - 17:30)'
  })

  // Security guard for Owner role
  if (!isOwner) {
    return (
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 16,
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: 540,
          margin: '40px auto'
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.6 }}>
          Staff roster management is restricted to authorized Store Owners only.
        </p>
      </div>
    )
  }

  const filteredStaff = staffList.filter(st =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateStaff = (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    addStaffMember({
      name: form.name,
      email: form.email,
      role: form.role,
      title: form.title,
      department: form.department,
      shift: form.shift
    })

    setForm({
      name: '',
      email: '',
      role: 'staff',
      title: 'Artisan Assembly Specialist',
      department: 'Workshop',
      shift: 'Morning (08:30 - 17:30)'
    })
    setIsAddingStaff(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#eab308' }}>
              👑 Owner Exclusive Area
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Artisan Staff & Team Roster
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
            Manage craftsmen, acoustic QC engineers, packaging shifts, and employee permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddingStaff(true)}
          style={{
            background: '#ffffff',
            color: '#09090b',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>+ Add New Employee</span>
        </button>
      </div>

      {/* Search Filter */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          padding: '16px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search staff by name, email, or department (e.g. Workshop, QC)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#1b1b20',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              padding: '8px 12px 8px 34px',
              color: '#ffffff',
              fontSize: 13
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: 9, color: '#71717a', fontSize: 14 }}>
            🔍
          </span>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStaff.map(st => (
          <div
            key={st.id}
            style={{
              background: '#161619',
              border: '1px solid #27272a',
              borderRadius: 14,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #3f3f46'
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                        {st.name}
                      </span>
                      {st.role === 'owner' && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: 'rgba(234, 179, 8, 0.2)',
                            color: '#fde047',
                            border: '1px solid rgba(234, 179, 8, 0.4)'
                          }}
                        >
                          👑 OWNER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 500 }}>
                      {st.title}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: st.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: st.active ? '#10b981' : '#ef4444',
                    border: `1px solid ${st.active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  {st.active ? 'Active Duty' : 'On Leave'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs mb-4" style={{ color: '#a1a1aa' }}>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span>Email:</span>
                  <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{st.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span>Department:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{st.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span>Shift:</span>
                  <span style={{ color: '#ffffff' }}>{st.shift}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Builds Completed:</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{st.ordersCompleted || 0} builds</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={() => toggleStaffStatus(st.id)}
                style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                {st.active ? 'Set On Leave' : 'Set Active'}
              </button>

              {st.role !== 'owner' && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${st.name} from staff roster?`)) {
                      deleteStaffMember(st.id)
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add New Staff */}
      {isAddingStaff && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 16,
              padding: '28px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              Register Workshop Staff
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>
              Add a new artisan builder, lubing specialist, or logistics coordinator.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nattaporn Somdee"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Company Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. nattaporn@customkb.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  >
                    <option value="Workshop">Workshop (Assembly)</option>
                    <option value="Quality Control">Quality Control & Audio</option>
                    <option value="Fulfillment">Fulfillment & Shipping</option>
                    <option value="Support">Customer Service</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Working Shift
                  </label>
                  <select
                    value={form.shift}
                    onChange={e => setForm({ ...form, shift: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  >
                    <option value="Morning (08:30 - 17:30)">Morning (08:30 - 17:30)</option>
                    <option value="Day Shift (10:00 - 19:00)">Day Shift (10:00 - 19:00)</option>
                    <option value="Afternoon (11:00 - 20:00)">Afternoon (11:00 - 20:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Job Title / Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Soldering & Stabilizer Modder"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingStaff(false)}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#d4d4d8',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#ffffff',
                    border: 'none',
                    color: '#09090b',
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
