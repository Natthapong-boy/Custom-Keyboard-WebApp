import Icon from '../../components/common/Icon'
import React, { useState } from 'react'
import { useShop, ORDER_STAGES } from '../../context/ShopContext'

export default function AdminOrders() {
  const { orders, loadingOrders, updateOrderStatus } = useShop()
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState(null)

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'All') return true
    return o.status === filterStatus
  })

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      await updateOrderStatus(orderId, newStatus)
      const stage = ORDER_STAGES.find(s => s.id === newStatus)?.label || newStatus
      setToast(`อัปเดตคำสั่งซื้อ #${orderId} เป็น "${stage}" เรียบร้อยแล้ว`)
      setTimeout(() => setToast(null), 4000)
    } catch (e) {
      setToast(`ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่`)
      setTimeout(() => setToast(null), 4000)
    } finally {
      setUpdating(false)
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <span><Icon name="wrench" /> สิทธิ์พนักงานร้าน</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ตรวจสอบการชำระเงิน & จัดการสถานะคำสั่งซื้อ
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ตรวจสลิปโอนเงิน อนุมัติการชำระเงิน และออกใบเสร็จให้ลูกค้า
          </p>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterStatus('All')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'All'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
          }`}
        >
          ทั้งหมด ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('checking_payment')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'checking_payment'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-amber-50'
          }`}
        >
          <Icon name="sparkles" /> รอตรวจสลิป ({orders.filter(o => o.status === 'checking_payment').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('payment_success')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'payment_success'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-emerald-50'
          }`}
        >
          <Icon name="circleCheck" /> ชำระเงินสำเร็จ ({orders.filter(o => o.status === 'payment_success').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('preparing')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'preparing'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-indigo-50'
          }`}
        >
          <Icon name="package" /> กำลังเตรียมสินค้า ({orders.filter(o => o.status === 'preparing').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('processing_custom')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'processing_custom'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
          }`}
        >
          <Icon name="wrench" /> กำลังดำเนินการ (ประกอบเอง) ({orders.filter(o => o.status === 'processing_custom').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('shipping')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            filterStatus === 'shipping'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-purple-100 hover:bg-blue-50'
          }`}
        >
          <Icon name="truck" /> กำลังจัดส่ง ({orders.filter(o => o.status === 'shipping').length})
        </button>
      </div>

      {/* Orders Table */}
      {loadingOrders ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">ไม่พบคำสั่งซื้อในสถานะนี้</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">รหัสคำสั่งซื้อ</th>
                  <th className="py-3.5 px-4">ลูกค้า</th>
                  <th className="py-3.5 px-4">ประเภท</th>
                  <th className="py-3.5 px-4">ยอดเงิน</th>
                  <th className="py-3.5 px-4">หลักฐานสลิป</th>
                  <th className="py-3.5 px-4">สถานะปัจจุบัน</th>
                  <th className="py-3.5 px-4 text-right">การจัดการตามขั้นตอน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {filteredOrders.map((order) => {
                  const stage = ORDER_STAGES.find(s => s.id === order.status)
                  return (
                    <tr key={order.orderId} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-4 px-4 font-extrabold font-mono text-purple-700 text-sm">
                        #{order.orderId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{order.customer?.name}</div>
                        <div className="text-[11px] text-slate-400">{order.customer?.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                          <span className="inline-flex items-center gap-1">
                            <Icon name={order.orderType === 'custom' ? 'wrench' : 'keyboard'} />
                            {order.orderType === 'custom' ? 'ประกอบเอง' : 'สำเร็จรูป'}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                        ฿{Number(order.total).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {order.paymentProof ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 border border-purple-200"
                          >
                            <Icon name="image" /> ดูสลิป
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">ยังไม่แนบ</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1"
                          style={{
                            backgroundColor: `${stage?.color || '#8b5cf6'}18`,
                            color: stage?.color || '#8b5cf6'
                          }}
                        >
                          <Icon name={stage?.icon} />
                          <span>{stage?.label || order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5">
                        {/* Status Transition Buttons per Diagram 1 & 3 */}
                        {order.status === 'checking_payment' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.orderId, 'payment_success')}
                              disabled={updating}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                            >
                              ✓ อนุมัติการชำระเงิน
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.orderId, 'payment_failed')}
                              disabled={updating}
                              className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs"
                              title="ปฏิเสธการชำระเงิน"
                            >
                              ✕ ปฏิเสธ
                            </button>
                          </>
                        )}

                        {order.status === 'payment_success' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.orderId, order.orderType === 'custom' ? 'processing_custom' : 'preparing')}
                            disabled={updating}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                          >
                            {order.orderType === 'custom' ? '→ เริ่มดำเนินการประกอบ' : '→ เริ่มเตรียมสินค้า'}
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.orderId, 'pickup')}
                            disabled={updating}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                          >
                            → ขนส่งเข้ามารับ
                          </button>
                        )}

                        {order.status === 'processing_custom' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.orderId, 'pickup')}
                            disabled={updating}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                          >
                            → ประกอบเสร็จ & ขนส่งเข้ารับ
                          </button>
                        )}

                        {order.status === 'pickup' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.orderId, 'shipping')}
                            disabled={updating}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                          >
                            → กำลังจัดส่ง
                          </button>
                        )}

                        {order.status === 'shipping' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.orderId, 'delivered')}
                            disabled={updating}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            ✓ ส่งคีย์บอร์ดสำเร็จ
                          </button>
                        )}

                        {/* Print Receipt button per Diagram 2 & 3 */}
                        <button
                          type="button"
                          onClick={() => setReceiptOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs"
                          title="พิมพ์ใบเสร็จออนไลน์"
                        >
                          <Icon name="receipt" /> พิมพ์ใบเสร็จ
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: View Payment Slip Proof */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                หลักฐานสลิป #{selectedOrder.orderId}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-purple-100 aspect-[3/4] max-h-96 flex items-center justify-center">
              <img
                src={selectedOrder.paymentProof}
                alt="Payment Slip"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>ยอดที่ต้องชำระ: <strong className="text-purple-700">฿{Number(selectedOrder.total).toLocaleString()}</strong></div>
              <div>ลูกค้า: <strong>{selectedOrder.customer?.name}</strong></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedOrder.orderId, 'payment_success')
                  setSelectedOrder(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                ✓ อนุมัติการชำระเงิน
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedOrder.orderId, 'payment_failed')
                  setSelectedOrder(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs"
              >
                ✕ ปฏิเสธสลิป
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Printable Receipt */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-purple-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Key Craft Studio</h3>
                <p className="text-xs text-slate-400">ใบเสร็จรับเงินออนไลน์</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>เลขที่ใบเสร็จ: <strong>INV-{receiptOrder.orderId}</strong></div>
              <div>วันที่: <strong>{new Date().toLocaleDateString('th-TH')}</strong></div>
              <div>ลูกค้า: <strong>{receiptOrder.customer?.name}</strong></div>
              <div>สถานะ: <strong className="text-emerald-600">{receiptOrder.status}</strong></div>
            </div>

            <div className="divide-y divide-purple-50 text-xs">
              {receiptOrder.items?.map((it, idx) => (
                <div key={idx} className="py-2 flex justify-between">
                  <span>{it.name} (x{it.quantity || 1})</span>
                  <span className="font-bold">฿{(Number(it.price) * (it.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-100 text-right text-xs space-y-1">
              <div>ค่าจัดส่ง: ฿{receiptOrder.shipping || 0}</div>
              <div className="text-xl font-black text-purple-700">
                รวมทั้งสิ้น: ฿{Number(receiptOrder.total).toLocaleString()} บาท
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                <Icon name="printer" /> สั่งพิมพ์ใบเสร็จ
              </button>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-xs"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
