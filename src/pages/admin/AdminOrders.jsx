import React, { useState } from 'react'
import { useShop, ORDER_STAGES } from '../../context/ShopContext'

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateOrderDetails, cancelOrder } = useShop()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [notesInput, setNotesInput] = useState('')

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenEditModal = (order) => {
    setSelectedOrderForEdit(order)
    setTrackingInput(order.trackingNumber || '')
    setNotesInput(order.notes || '')
  }

  const handleSaveOrderModal = (e) => {
    e.preventDefault()
    if (!selectedOrderForEdit) return
    updateOrderDetails(selectedOrderForEdit.id, {
      trackingNumber: trackingInput,
      notes: notesInput
    })
    setSelectedOrderForEdit(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Workshop Order Fulfillment
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
            Manage hand-machined builds, advance stages, allocate DHL tracking, and supervise dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: '#a1a1aa' }}>
            Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by Order ID (KC-...), customer name, or email..."
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

        {/* Status Pills Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: statusFilter === 'all' ? 700 : 500,
              background: statusFilter === 'all' ? '#ffffff' : '#1b1b20',
              color: statusFilter === 'all' ? '#09090b' : '#a1a1aa',
              border: '1px solid #3f3f46',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Orders ({orders.length})
          </button>

          {ORDER_STAGES.map(st => {
            const count = orders.filter(o => o.status === st.id).length
            const isSelected = statusFilter === st.id

            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? `${st.badgeColor}20` : '#1b1b20',
                  color: isSelected ? st.badgeColor : '#a1a1aa',
                  border: isSelected ? `1px solid ${st.badgeColor}` : '1px solid #27272a',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: '#27272a',
                    color: '#ffffff'
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#121215', borderBottom: '1px solid #27272a', color: '#71717a' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Build Item(s)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Current Stage</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tracking Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#71717a' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(ord => {
                  const stage = ORDER_STAGES.find(s => s.id === ord.status) || ORDER_STAGES[0]

                  return (
                    <tr
                      key={ord.id}
                      style={{
                        borderBottom: '1px solid #27272a',
                        transition: 'background 0.15s ease'
                      }}
                      className="hover:bg-zinc-900/40"
                    >
                      {/* Order ID & Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                          {ord.id}
                        </div>
                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                          {ord.date}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{ord.customer?.name}</div>
                        <div style={{ fontSize: 11, color: '#a1a1aa' }}>{ord.customer?.email}</div>
                        <div style={{ fontSize: 10, color: '#71717a' }}>{ord.customer?.city}, {ord.customer?.country || 'TH'}</div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 16px' }}>
                        {ord.items?.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: 4 }}>
                            <div style={{ fontWeight: 600, color: '#e4e4e7' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: '#71717a' }}>{item.specs}</div>
                          </div>
                        ))}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                          ${Number(ord.total || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: '#34d399' }}>
                          {ord.paymentMethod?.brand || 'Paid'}
                        </div>
                      </td>

                      {/* Status Selector Dropdown */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={ord.status}
                          onChange={e => updateOrderStatus(ord.id, e.target.value)}
                          style={{
                            background: '#1b1b20',
                            border: `1px solid ${stage.badgeColor}60`,
                            color: stage.badgeColor,
                            fontWeight: 600,
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          {ORDER_STAGES.map(s => (
                            <option key={s.id} value={s.id} style={{ background: '#18181b', color: '#ffffff' }}>
                              {s.icon} {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Tracking Code */}
                      <td style={{ padding: '14px 16px' }}>
                        {ord.trackingNumber ? (
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#38bdf8' }}>
                            {ord.trackingNumber}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>Unallocated</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(ord)}
                            title="Edit tracking number & notes"
                            style={{
                              background: '#27272a',
                              border: '1px solid #3f3f46',
                              color: '#ffffff',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Details
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to cancel and remove order ${ord.id}?`)) {
                                cancelOrder(ord.id)
                              }
                            }}
                            title="Cancel order"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Edit Tracking Code & Workshop Notes */}
      {selectedOrderForEdit && (
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
              Fulfillment Settings: {selectedOrderForEdit.id}
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>
              Update logistics tracking number and artisan notes for workshop staff.
            </p>

            <form onSubmit={handleSaveOrderModal} className="space-y-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  DHL / Courier Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. DHL-EXP-889104820"
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: 13
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Artisan Notes / Custom Laser Engravings
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="Special instructions, e.g. Krytox lubing, brass weight laser engraving..."
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
                  onClick={() => setSelectedOrderForEdit(null)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
