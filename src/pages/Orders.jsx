import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useShop, ORDER_STAGES } from '../context/ShopContext'
import key1 from '../assets/key1.jpg'

export default function Orders() {
  const { orders, updateOrderDetails, isStaff, isOwner, user } = useShop()
  const [searchParams] = useSearchParams()

  const activeParamId = searchParams.get('active')
  const [selectedOrderId, setSelectedOrderId] = useState(activeParamId || (orders[0]?.id || ''))

  // Modal states
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isViewingInvoice, setIsViewingInvoice] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    notes: ''
  })

  // Set selected order if param changes or orders list changes
  useEffect(() => {
    if (activeParamId && orders.some(o => o.id === activeParamId)) {
      setSelectedOrderId(activeParamId)
    } else if (orders.length > 0 && !orders.some(o => o.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id)
    }
  }, [activeParamId, orders])

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0]

  // Setup edit form when opening modal
  const handleOpenEdit = () => {
    if (!selectedOrder) return
    setEditForm({
      name: selectedOrder.customer?.name || '',
      address: selectedOrder.customer?.address || '',
      city: selectedOrder.customer?.city || '',
      zip: selectedOrder.customer?.zip || '',
      phone: selectedOrder.customer?.phone || '',
      notes: selectedOrder.notes || ''
    })
    setIsEditingAddress(true)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    updateOrderDetails(selectedOrder.id, {
      customer: {
        ...selectedOrder.customer,
        name: editForm.name,
        address: editForm.address,
        city: editForm.city,
        zip: editForm.zip,
        phone: editForm.phone
      },
      notes: editForm.notes
    })
    setIsEditingAddress(false)
  }

  const handleCopyTracking = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedTracking(true)
    setTimeout(() => setCopiedTracking(false), 2000)
  }

  // Current stage calculation
  const currentStageIndex = selectedOrder
    ? ORDER_STAGES.findIndex(s => s.id === selectedOrder.status)
    : 0

  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
  const currentStage = ORDER_STAGES[safeStageIndex] || ORDER_STAGES[0]

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa' }}>
              Tracking & Fulfillment
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#71717a' }} />
            <span style={{ fontSize: 12, color: '#71717a' }}>
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.02em', margin: 0 }}>
            Order Journal
          </h1>
          <p style={{ fontSize: 14, color: '#a1a1aa', marginTop: 4, margin: 0 }}>
            Track the hand-crafting journey of your custom mechanical keyboard in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(isStaff || isOwner) && (
            <Link
              to="/admin/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none'
              }}
            >
              <span>🛠️ Staff Portal (Manage Orders)</span>
            </Link>
          )}
          <Link
            to="/designer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              background: '#27272a',
              border: '1px solid #3f3f46',
              padding: '8px 16px',
              borderRadius: 10,
              textDecoration: 'none'
            }}
          >
            <span>+ New Build</span>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: '64px 24px',
            textAlign: 'center',
            maxWidth: 540,
            margin: '40px auto'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', marginBottom: 8 }}>No Active Orders</h2>
          <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.6 }}>
            You have not placed any custom keyboard builds yet. Start tailoring your dream board in the 3D configurator!
          </p>
          <Link
            to="/designer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              background: '#ffffff',
              color: '#09090b',
              padding: '10px 22px',
              borderRadius: 10,
              textDecoration: 'none'
            }}
          >
            Launch Designer <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Selector List (if multiple) */}
          <div className="lg:col-span-4 space-y-3">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Select Order
            </div>

            {orders.map((ord) => {
              const isSelected = ord.id === selectedOrderId
              const stageInfo = ORDER_STAGES.find(s => s.id === ord.status) || ORDER_STAGES[0]
              const itemCount = ord.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  style={{
                    background: isSelected ? '#1f1f23' : '#141417',
                    border: isSelected ? '1px solid #52525b' : '1px solid #27272a',
                    borderRadius: 12,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: isSelected ? '#ffffff' : '#e4e4e7' }}>
                      {ord.id}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: `${stageInfo.badgeColor}15`,
                        color: stageInfo.badgeColor,
                        border: `1px solid ${stageInfo.badgeColor}30`
                      }}
                    >
                      {stageInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs" style={{ color: '#a1a1aa' }}>
                    <span>{ord.date}</span>
                    <span style={{ color: '#f4f4f5', fontWeight: 600 }}>
                      ${ord.total ? Number(ord.total).toFixed(2) : '0.00'} • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Selected Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-8 space-y-6">
              {/* Main Status Hero Card */}
              <div
                style={{
                  background: '#161619',
                  border: '1px solid #27272a',
                  borderRadius: 16,
                  padding: '28px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
                }}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-6" style={{ borderBottom: '1px solid #27272a' }}>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: '#ffffff', margin: 0 }}>
                        {selectedOrder.id}
                      </h2>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: `${currentStage.badgeColor}20`,
                          color: currentStage.badgeColor,
                          border: `1px solid ${currentStage.badgeColor}40`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentStage.badgeColor }} />
                        {currentStage.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 6 }}>
                      Placed on <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{selectedOrder.date}</span> • Est. Delivery:{' '}
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedOrder.estimatedDelivery || 'In 4-6 Days'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsViewingInvoice(true)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '7px 12px',
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        color: '#f4f4f5',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      📄 Receipt
                    </button>
                    {safeStageIndex < 3 && (
                      <button
                        onClick={handleOpenEdit}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '7px 12px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          color: '#f4f4f5',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit Address
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Banner */}
                <div
                  style={{
                    background: '#1b1b20',
                    border: '1px solid #2d2d35',
                    borderRadius: 12,
                    padding: '18px 20px',
                    margin: '24px 0'
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: 20 }}>{currentStage.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                      {currentStage.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    {currentStage.desc}
                  </p>
                </div>

                {/* Clean Stepper Timeline */}
                <div style={{ margin: '32px 0 16px' }}>
                  <div className="relative flex justify-between items-center">
                    {/* Connecting Bar Background */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: '5%',
                        right: '5%',
                        height: 2,
                        background: '#27272a',
                        zIndex: 1
                      }}
                    />
                    {/* Connecting Bar Active Fill */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: '5%',
                        width: `${(safeStageIndex / (ORDER_STAGES.length - 1)) * 90}%`,
                        height: 2,
                        background: '#10b981',
                        zIndex: 2,
                        transition: 'width 0.4s ease'
                      }}
                    />

                    {ORDER_STAGES.map((stage, idx) => {
                      const isCompleted = idx < safeStageIndex
                      const isActive = idx === safeStageIndex
                      const isFuture = idx > safeStageIndex

                      let circleBg = '#18181b'
                      let circleBorder = '#3f3f46'
                      let circleColor = '#71717a'

                      if (isCompleted) {
                        circleBg = '#10b981'
                        circleBorder = '#10b981'
                        circleColor = '#000000'
                      } else if (isActive) {
                        circleBg = '#ffffff'
                        circleBorder = '#10b981'
                        circleColor = '#09090b'
                      }

                      return (
                        <div
                          key={stage.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 3,
                            width: 60
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: circleBg,
                              border: `2px solid ${circleBorder}`,
                              color: circleColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              boxShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#ffffff' : isCompleted ? '#e4e4e7' : '#71717a',
                              marginTop: 8,
                              textAlign: 'center',
                              lineHeight: 1.2
                            }}
                          >
                            {stage.label.split(' ')[0]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Items in this order */}
              <div
                style={{
                  background: '#161619',
                  border: '1px solid #27272a',
                  borderRadius: 16,
                  padding: '24px'
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', marginBottom: 16 }}>
                  Order Items ({selectedOrder.items?.length || 0})
                </h3>

                <div className="space-y-4">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={item.id || i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: '#1b1b20',
                        border: '1px solid #27272a',
                        borderRadius: 10
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || key1}
                          alt={item.name}
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid #3f3f46'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                            {item.specs || 'Custom Specifications'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                          ${item.price ? Number(item.price * (item.quantity || 1)).toFixed(2) : '0.00'}
                        </div>
                        <div style={{ fontSize: 11, color: '#71717a' }}>
                          Qty: {item.quantity || 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Calculation Summary */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #27272a' }}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#a1a1aa' }}>
                    <span>Subtotal</span>
                    <span>${Number(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#34d399' }}>
                      <span>Discount</span>
                      <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs mb-2" style={{ color: '#a1a1aa' }}>
                    <span>Shipping</span>
                    <span>{selectedOrder.shipping === 0 ? 'FREE' : `$${Number(selectedOrder.shipping).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid #27272a', color: '#ffffff' }}>
                    <span>Total Paid</span>
                    <span>${Number(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Tracking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping info */}
                <div
                  style={{
                    background: '#161619',
                    border: '1px solid #27272a',
                    borderRadius: 14,
                    padding: '20px'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: 16 }}>📍</span>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                      Delivery Address
                    </h4>
                  </div>
                  <div style={{ fontSize: 13, color: '#e4e4e7', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{selectedOrder.customer?.name}</div>
                    <div>{selectedOrder.customer?.address}</div>
                    <div>{selectedOrder.customer?.city} {selectedOrder.customer?.zip}</div>
                    <div>{selectedOrder.customer?.country || 'Thailand'}</div>
                    {selectedOrder.customer?.phone && (
                      <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>
                        📞 {selectedOrder.customer?.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking & Carrier */}
                <div
                  style={{
                    background: '#161619',
                    border: '1px solid #27272a',
                    borderRadius: 14,
                    padding: '20px'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: 16 }}>📦</span>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5', margin: 0 }}>
                      Tracking Code
                    </h4>
                  </div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 12 }}>
                    Carrier: <span style={{ color: '#ffffff', fontWeight: 600 }}>DHL Express Priority</span>
                  </div>
                  <div
                    style={{
                      background: '#1f1f23',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                      {selectedOrder.trackingNumber || 'PENDING-ALLOCATION'}
                    </span>
                    <button
                      onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                      style={{
                        fontSize: 11,
                        background: '#27272a',
                        border: '1px solid #52525b',
                        color: '#f4f4f5',
                        borderRadius: 6,
                        padding: '4px 8px',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedTracking ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  {selectedOrder.notes && (
                    <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 12, fontStyle: 'italic' }}>
                      Note: "{selectedOrder.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Edit Shipping Address */}
      {isEditingAddress && (
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
              Edit Delivery Information
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>
              Update recipient delivery address for order <span style={{ fontFamily: 'monospace', color: '#fff' }}>{selectedOrder?.id}</span>.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Full Recipient Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
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
                  Street Address / Room / Building
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
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
                    City / Province
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
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
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={editForm.zip}
                    onChange={e => setEditForm({ ...editForm, zip: e.target.value })}
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
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
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
                  onClick={() => setIsEditingAddress(false)}
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

      {/* MODAL: Digital Receipt / Invoice */}
      {isViewingInvoice && selectedOrder && (
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
              padding: '32px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="flex justify-between items-start pb-4" style={{ borderBottom: '1px solid #27272a' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>✦ KEY CRAFT</div>
                <div style={{ fontSize: 12, color: '#a1a1aa' }}>Official Purchase Receipt</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>{selectedOrder.id}</div>
                <div style={{ fontSize: 11, color: '#71717a' }}>{selectedOrder.date}</div>
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs" style={{ color: '#d4d4d8', borderBottom: '1px solid #27272a' }}>
              <div><strong>Billed to:</strong> {selectedOrder.customer?.name} ({selectedOrder.customer?.email})</div>
              <div><strong>Shipping to:</strong> {selectedOrder.customer?.address}, {selectedOrder.customer?.city}</div>
              <div><strong>Payment:</strong> {selectedOrder.paymentMethod?.brand || 'Card'} ending in {selectedOrder.paymentMethod?.last4 || '4242'}</div>
            </div>

            <div className="py-4 space-y-2">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span style={{ color: '#ffffff' }}>{item.quantity}x {item.name}</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #27272a', color: '#a1a1aa' }}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2" style={{ color: '#ffffff', borderTop: '1px solid #27272a' }}>
                <span>Total</span>
                <span>${Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <button
                onClick={() => setIsViewingInvoice(false)}
                style={{
                  background: '#ffffff',
                  color: '#09090b',
                  fontWeight: 700,
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
