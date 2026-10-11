import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useShop, ORDER_STAGES } from '../context/ShopContext'

export default function Orders() {
  const { orders, loadingOrders, uploadPaymentProof, currentUser } = useShop()
  const [searchParams] = useSearchParams()

  const activeParamId = searchParams.get('active')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [slipUrlInput, setSlipUrlInput] = useState('')
  const [submittingProof, setSubmittingProof] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (orders.length > 0) {
      if (activeParamId && orders.some(o => o.orderId === activeParamId)) {
        setSelectedOrderId(activeParamId)
      } else if (!selectedOrderId || !orders.some(o => o.orderId === selectedOrderId)) {
        setSelectedOrderId(orders[0].orderId)
      }
    }
  }, [activeParamId, orders, selectedOrderId])

  const currentOrder = orders.find(o => o.orderId === selectedOrderId) || orders[0]

  const handleUploadProof = async () => {
    if (!currentOrder) return
    setSubmittingProof(true)
    const proof = slipUrlInput.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
    try {
      await uploadPaymentProof(currentOrder.orderId, proof)
      setToast('แนบหลักฐานการโอนเงินเรียบร้อยแล้ว สถานะเปลี่ยนเป็น "รอตรวจสอบการชำระเงิน"')
      setSlipUrlInput('')
      setTimeout(() => setToast(null), 4000)
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmittingProof(false)
    }
  }

  // Get active step index for stepper
  const getStepProgress = (status, orderType) => {
    if (status === 'payment_failed') return { index: 1, failed: true }
    if (status === 'pending_payment') return { index: 0 }
    if (status === 'checking_payment') return { index: 1 }
    if (status === 'payment_success') return { index: 2 }
    if (status === 'preparing') return { index: 3 }
    if (status === 'processing_custom') return { index: 4 }
    if (status === 'pickup') return { index: 5 }
    if (status === 'shipping') return { index: 6 }
    if (status === 'delivered') return { index: 7 }
    return { index: 0 }
  }

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span>📦 ระบบติดตามคำสั่งซื้อ (Order Tracking)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          สถานะคำสั่งซื้อและใบเสร็จ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          ติดตามขั้นตอนการผลิตและจัดส่งคีย์บอร์ดแบบเรียลไทม์ พร้อมพิมพ์ใบเสร็จรับเงินออนไลน์
        </p>
      </div>

      {loadingOrders ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลคำสั่งซื้อจากฐานข้อมูล...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center max-w-md mx-auto shadow-sm">
          <span className="text-4xl block mb-3">📭</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีประวัติคำสั่งซื้อ</h2>
          <p className="text-sm text-slate-500 mb-6">คุณสามารถสั่งซื้อคีย์บอร์ดสำเร็จรูปหรือปรับแต่งเองได้ในระบบ</p>
          <Link to="/" className="btn-primary">
            เริ่มช้อปปิ้งเลย
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Orders List Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-purple-100 p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              รายการคำสั่งซื้อทั้งหมด ({orders.length})
            </h2>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {orders.map((o) => {
                const isSelected = o.orderId === currentOrder?.orderId
                const stageInfo = ORDER_STAGES.find(s => s.id === o.status)
                return (
                  <button
                    key={o.orderId}
                    type="button"
                    onClick={() => setSelectedOrderId(o.orderId)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm'
                        : 'border-purple-50 bg-white hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 font-mono">
                        #{o.orderId}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${stageInfo?.color || '#8b5cf6'}18`,
                          color: stageInfo?.color || '#8b5cf6'
                        }}
                      >
                        {stageInfo?.label || o.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{o.orderType === 'custom' ? '🛠️ ประกอบเอง' : '⌨️ สำเร็จรูป'}</span>
                      <span className="font-bold text-slate-900">฿{Number(o.total).toLocaleString()}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Selected Order Tracking & Details */}
          {currentOrder && (
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Order Header & Actions */}
              <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-extrabold text-slate-900 font-mono">
                        #{currentOrder.orderId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                        {currentOrder.orderType === 'custom' ? 'สั่งซื้อแบบประกอบเอง' : 'สั่งซื้อแบบสำเร็จรูป'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      สร้างเมื่อ: {new Date(currentOrder.createdAt || Date.now()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Print / View Receipt Button per Diagram 2 & 3 */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptOrder(currentOrder)}
                      className="px-5 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>🧾</span>
                      <span>พิมพ์ใบเสร็จออนไลน์</span>
                    </button>
                  </div>
                </div>

                {/* VISUAL STEPPER strictly according to Diagram 1 */}
                <div className="pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                    ขั้นตอนสถานะคำสั่งซื้อ (Lifecycle Stepper)
                  </h3>

                  {/* Flow description */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {ORDER_STAGES.filter(s => {
                      // Filter out custom step if prebuilt
                      if (currentOrder.orderType === 'prebuilt' && s.id === 'processing_custom') return false
                      if (s.id === 'payment_failed' && currentOrder.status !== 'payment_failed') return false
                      return true
                    }).map((st, idx) => {
                      const isCurrent = currentOrder.status === st.id
                      return (
                        <div
                          key={st.id}
                          className={`p-3 rounded-2xl border text-xs transition-all ${
                            isCurrent
                              ? 'border-purple-600 bg-purple-50 shadow-sm ring-1 ring-purple-500'
                              : 'border-purple-50 bg-white opacity-60'
                          }`}
                        >
                          <div className="text-lg mb-1">{st.icon}</div>
                          <div className={`font-bold ${isCurrent ? 'text-purple-900' : 'text-slate-700'}`}>
                            {st.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {st.desc}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Notice for Payment Verification */}
                  {currentOrder.status === 'pending_payment' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <strong>รอชำระเงิน:</strong> กรุณาโอนเงินยอด ฿{Number(currentOrder.total).toLocaleString()} แล้วแนบสลิปด้านล่าง
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="ลิงก์รูปสลิป / หรือกดแนบ"
                          value={slipUrlInput}
                          onChange={(e) => setSlipUrlInput(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs bg-white flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleUploadProof}
                          disabled={submittingProof}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                        >
                          แนบสลิป
                        </button>
                      </div>
                    </div>
                  )}

                  {currentOrder.status === 'checking_payment' && (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-3">
                      <span className="text-xl">⏳</span>
                      <div>
                        <strong>แนบสลิปแล้ว:</strong> เจ้าหน้าที่กำลังตรวจสอบความถูกต้องของสลิปการโอนเงิน (หากเป็นพนักงานสามารถเข้า Staff Portal เพื่ออนุมัติได้ทันที)
                      </div>
                    </div>
                  )}

                  {currentOrder.paymentProof && (
                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">หลักฐานการโอนที่แนบไว้:</span>
                      <a
                        href={currentOrder.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-bold hover:underline"
                      >
                        ดูรูปสลิป ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Items & Customer Details */}
              <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  รายการสินค้าในคำสั่งซื้อ
                </h3>

                <div className="divide-y divide-purple-50">
                  {currentOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-purple-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          {item.specs && <div className="text-slate-500">{item.specs}</div>}
                          <div className="text-slate-400">จำนวน: {item.quantity || 1} ชิ้น</div>
                        </div>
                      </div>
                      <div className="font-bold text-purple-700 text-sm">
                        ฿{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-purple-50 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">ข้อมูลจัดส่ง:</span>
                    <div className="font-bold text-slate-800">{currentOrder.customer?.name}</div>
                    <div className="text-slate-600">{currentOrder.customer?.phone}</div>
                    <div className="text-slate-600 mt-0.5">
                      {currentOrder.customer?.address}, {currentOrder.customer?.city} {currentOrder.customer?.zip}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">เลขพัสดุและจัดส่ง:</span>
                    <div className="font-bold text-purple-700 font-mono">
                      {currentOrder.trackingNumber || 'รอจัดส่ง'}
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      กำหนดส่งโดยประมาณ: {currentOrder.estimatedDelivery || '1-3 วันทำการ'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONLINE RECEIPT MODAL per Diagram 2 & 3 */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Receipt Header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⌨️</span>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Key Craft Studio</h3>
                  <p className="text-xs text-slate-400">ใบเสร็จรับเงินออนไลน์ (Electronic Receipt)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">เลขที่ใบเสร็จ:</span>
                <span className="font-bold text-slate-800 font-mono">INV-{receiptOrder.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">วันที่ออกเอกสาร:</span>
                <span className="font-bold text-slate-800">{new Date().toLocaleDateString('th-TH')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ชื่อลูกค้า:</span>
                <span className="font-bold text-slate-800">{receiptOrder.customer?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">สถานะการชำระเงิน:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {receiptOrder.status === 'pending_payment' ? 'รอชำระ' : 'ชำระเงินเรียบร้อย'}
                </span>
              </div>
            </div>

            {/* Line items table */}
            <div className="divide-y divide-purple-50 text-xs">
              <div className="py-2 flex justify-between font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                <span>รายการ</span>
                <span>จำนวนเงิน</span>
              </div>
              {receiptOrder.items?.map((it, i) => (
                <div key={i} className="py-2.5 flex justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{it.name}</div>
                    <div className="text-slate-400 text-[11px]">{it.specs} x {it.quantity || 1}</div>
                  </div>
                  <div className="font-bold text-slate-800">
                    ฿{(Number(it.price) * (it.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-purple-100 space-y-1.5 text-xs text-right">
              <div>ค่าจัดส่ง: ฿{receiptOrder.shipping || 0}</div>
              <div className="text-lg font-black text-purple-700">
                ยอดสุทธิ: ฿{Number(receiptOrder.total).toLocaleString()} บาท
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
              >
                🖨️ สั่งพิมพ์ใบเสร็จ (Print Receipt)
              </button>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
