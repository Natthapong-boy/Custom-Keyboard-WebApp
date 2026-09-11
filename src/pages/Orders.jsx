import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useShop, ORDER_STAGES, playSwitchSound } from '../context/ShopContext'
import key1 from '../assets/key1.jpg'

export default function Orders() {
  const { orders, updateOrderStatus, updateOrderDetails, cancelOrder, showToast } = useShop()
  const [searchParams] = useSearchParams()

  const activeParamId = searchParams.get('active')
  const [selectedOrderId, setSelectedOrderId] = useState(activeParamId || (orders[0]?.id || ''))

  // Modal states
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isViewingInvoice, setIsViewingInvoice] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
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
        zip: editForm.zip
      },
      notes: editForm.notes
    })
    setIsEditingAddress(false)
  }

  // Get current stage index
  const currentStageIndex = selectedOrder
    ? ORDER_STAGES.findIndex(s => s.id === selectedOrder.status)
    : 0

  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
  const currentStage = ORDER_STAGES[safeStageIndex] || ORDER_STAGES[0]

  // Progress percentage calculation
  const progressPercent = currentStage ? currentStage.progress : 15

  // Fast Advance State
  const handleAdvanceState = (delta) => {
    if (!selectedOrder) return
    const nextIndex = Math.min(Math.max(0, safeStageIndex + delta), ORDER_STAGES.length - 1)
    const nextStatus = ORDER_STAGES[nextIndex].id
    updateOrderStatus(selectedOrder.id, nextStatus)
    playSwitchSound('linear')
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-block flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> Tracking & Lifecycle / 03</p>
          <h1 className="page-title">Order <em>Journal.</em></h1>
          <p className="page-subtitle">
            Track real-time artisanal machining, custom switch lubing, acoustic QC verification, and express courier logistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/designer" className="text-xs font-mono bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-[#d8b4fe] px-4 py-2 rounded-xl transition-all">
            + New Build
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="cyber-panel p-16 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/40 flex items-center justify-center mx-auto mb-6 text-2xl">
            📦
          </div>
          <h2 className="text-2xl font-bold mb-3">No Active Orders</h2>
          <p className="text-sm text-[#a09ca9] mb-8">
            You haven't placed any orders yet. Design a keyboard in the configurator or checkout your cart.
          </p>
          <Link to="/designer" className="button button-primary inline-flex items-center">
            Design Your First Keyboard <span>↗</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Active Order Tracking Panel */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOrder && (
              <div className="cyber-panel cyber-panel-glow p-6 sm:p-8">
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight">
                        {selectedOrder.id}
                      </h2>
                      <span
                        className="pill-badge"
                        style={{
                          backgroundColor: `${currentStage.badgeColor}20`,
                          borderColor: currentStage.badgeColor,
                          color: currentStage.badgeColor,
                          borderWidth: '1px'
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentStage.badgeColor }}></span>
                        {currentStage.label}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#958c9f] mt-1">
                      Ordered on {selectedOrder.date} • Est. Delivery: <span className="text-white font-semibold">{selectedOrder.estimatedDelivery}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsViewingInvoice(true)}
                      className="text-xs font-mono px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-1.5"
                    >
                      <span>📄</span> Digital Receipt
                    </button>
                    <button
                      onClick={handleOpenEdit}
                      className="text-xs font-mono px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-1.5"
                    >
                      <span>✏️</span> Edit Details
                    </button>
                  </div>
                </div>

                {/* DYNAMIC INTERACTIVE STATE SIMULATOR / CONTROLLER */}
                <div className="mt-6 mb-6">
                  <div className="order-simulator-strip">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-400 font-bold">
                        ⚡ LIVE ORDER STATE SIMULATOR:
                      </span>
                      <span className="text-[11px] text-[#a09ca9] font-mono hidden sm:inline">
                        (Click any stage or use arrows to test UI transitions)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceState(-1)}
                        disabled={safeStageIndex === 0}
                        className="px-3 py-1 text-xs font-mono bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white transition"
                      >
                        ◀ Prev State
                      </button>
                      <button
                        onClick={() => handleAdvanceState(1)}
                        disabled={safeStageIndex === ORDER_STAGES.length - 1}
                        className="px-3 py-1 text-xs font-mono bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        Next State ▶
                      </button>
                    </div>
                  </div>

                  {/* Quick Select Stage Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {ORDER_STAGES.map((st, idx) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, st.id)
                          playSwitchSound('click')
                        }}
                        className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                          selectedOrder.status === st.id
                            ? 'bg-purple-900/60 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold'
                            : 'bg-white/5 border-white/5 text-[#8f859b] hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{st.icon}</span>
                        <span>{idx + 1}. {st.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stepper Timeline Visualizer */}
                  <div className="order-stepper">
                    <div className="order-stepper-progress-bg"></div>
                    <div
                      className="order-stepper-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>

                    {ORDER_STAGES.map((stage, index) => {
                      const isCompleted = index < safeStageIndex
                      const isActive = index === safeStageIndex

                      return (
                        <div
                          key={stage.id}
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, stage.id)
                            playSwitchSound(isActive ? 'click' : 'linear')
                          }}
                          className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                          title={`Click to switch order to: ${stage.label}`}
                        >
                          <div className="step-circle">
                            {isCompleted ? '✓' : stage.icon}
                          </div>
                          <div className="step-label">
                            {stage.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Current Stage Highlight Box */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/30 via-[#190c29]/50 to-transparent border border-purple-500/20 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-xl flex items-center justify-center flex-shrink-0">
                      {currentStage.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {currentStage.label}
                      </h4>
                      <p className="text-xs text-[#b3a8bf] mt-0.5">
                        {currentStage.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono flex-shrink-0">
                    <div className="text-[10px] uppercase text-[#8c8296]">Tracking Node</div>
                    <div className="text-xs font-bold text-cyan-400">
                      {selectedOrder.trackingNumber || 'DHL-EXP-440219'}
                    </div>
                  </div>
                </div>

                {/* Ordered Items Spec List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#a09ca9]">
                    Configured Hardware Items
                  </h3>

                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || key1}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover bg-black border border-white/10"
                          />
                          <div>
                            <h4 className="text-base font-bold text-white">{item.name}</h4>
                            <p className="text-xs font-mono text-purple-300/90 mt-0.5">
                              {item.specs || 'Custom 75% • Blue Clicky • Lilac Keycaps'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[11px] font-mono text-[#a09ca9]">
                                Qty: {item.quantity}
                              </span>
                              {item.switchSound && (
                                <button
                                  type="button"
                                  onClick={() => playSwitchSound(item.switchSound)}
                                  className="sound-badge-btn"
                                  title="Listen to switch acoustics"
                                >
                                  <span>🔊</span> Listen Acoustic Sound
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-lg font-bold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Delivery Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                    <span className="text-[#8c8296] uppercase text-[10px] block">Shipping Address</span>
                    <strong className="text-white block text-sm font-sans">{selectedOrder.customer?.name}</strong>
                    <p className="text-[#c0b8cb]">{selectedOrder.customer?.address}</p>
                    <p className="text-[#c0b8cb]">
                      {selectedOrder.customer?.city}, {selectedOrder.customer?.zip} • {selectedOrder.customer?.country || 'USA'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <span className="text-[#8c8296] uppercase text-[10px] block">Custom Artisan Note</span>
                    <p className="text-purple-300 italic font-sans text-xs">
                      "{selectedOrder.notes || 'Laser engraving: Standard artisan build'}"
                    </p>
                    <div className="pt-2 border-t border-white/5 flex justify-between text-[#8c8296] text-[10px]">
                      <span>Payment: {selectedOrder.paymentMethod?.brand || 'Credit Card'} (•••• {selectedOrder.paymentMethod?.last4 || '4242'})</span>
                      <span className="text-emerald-400 font-bold">PAID</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: All Orders Switcher */}
          <div className="lg:col-span-4 space-y-4">
            <div className="cyber-panel p-6">
              <h3 className="font-bold text-base text-white mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
                <span>Order History</span>
                <span className="text-xs font-mono text-purple-400">{orders.length} Active</span>
              </h3>

              <div className="space-y-3">
                {orders.map((ord) => {
                  const stageObj = ORDER_STAGES.find(s => s.id === ord.status) || ORDER_STAGES[0]
                  const isSelected = ord.id === selectedOrderId

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white">{ord.id}</span>
                        <span className="text-xs font-mono font-bold text-[#d8b4fe]">
                          ${ord.total?.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className="text-[#8c8296] font-mono">{ord.date?.slice(0, 10)}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold"
                          style={{
                            backgroundColor: `${stageObj.badgeColor}25`,
                            color: stageObj.badgeColor
                          }}
                        >
                          {stageObj.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedOrder && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to cancel order ${selectedOrder.id}?`)) {
                        cancelOrder(selectedOrder.id)
                      }
                    }}
                    className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors"
                  >
                    Cancel This Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isEditingAddress && (
        <div className="processing-overlay">
          <div className="cyber-panel p-6 sm:p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Edit Order Details</h3>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="text-gray-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="cyber-label">Recipient Name</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="cyber-label">Street Address</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="cyber-label">City</label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="cyber-label">Postal / Zip</label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={editForm.zip}
                    onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="cyber-label">Laser Engraving / Notes</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-xs font-mono text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt / Invoice Modal */}
      {isViewingInvoice && selectedOrder && (
        <div className="processing-overlay">
          <div className="cyber-panel p-8 max-w-md w-full text-left space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-purple-400">✦</span> KEY CRAFT LABS
                </div>
                <p className="text-[10px] font-mono text-[#8c8296] mt-0.5">TOKYO • GINZA ARTISAN WORKSHOP</p>
              </div>
              <button
                onClick={() => setIsViewingInvoice(false)}
                className="text-gray-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 font-mono text-xs text-[#b8b0c4]">
              <div className="flex justify-between">
                <span>INVOICE TOKEN:</span>
                <strong className="text-white">{selectedOrder.id}</strong>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT STATUS:</span>
                <span className="text-emerald-400 font-bold">VERIFIED ON LEDGER</span>
              </div>
              <div className="flex justify-between">
                <span>TRACKING:</span>
                <span className="text-cyan-400">{selectedOrder.trackingNumber}</span>
              </div>
            </div>

            <div className="border-t border-b border-white/10 py-3 space-y-2">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between font-mono text-xs">
                  <span className="text-white">{item.name} x{item.quantity}</span>
                  <span className="text-[#d8b4fe]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-mono text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>Shipping:</span>
                <span>${selectedOrder.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between font-mono text-xs text-emerald-400">
                  <span>Discount:</span>
                  <span>-${selectedOrder.discount?.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline font-mono">
              <span className="text-xs uppercase text-gray-400">Total Paid</span>
              <span className="text-2xl font-bold text-white">${selectedOrder.total?.toFixed(2)}</span>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  showToast('Receipt downloaded as PDF (Simulated)')
                  setIsViewingInvoice(false)
                }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                📥 Download Official Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
