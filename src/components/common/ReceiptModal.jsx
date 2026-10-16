import React from 'react'
import { ORDER_STAGES } from '../../context/ShopContext'

const paidStatuses = ['payment_success', 'preparing', 'processing_custom', 'pickup', 'shipping', 'delivered']
const shippingStatuses = ['shipping', 'delivered']

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null

  const isPaid = paidStatuses.includes(order.status)
  const orderDate = new Date(order.createdAt || Date.now())

  return (
    <div className="receipt-print-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
      <div className="receipt-print-area bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-6">
        <header className="flex items-start justify-between gap-4 border-b-2 border-purple-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-700">Key Craft</p>
            <p className="mt-1 text-sm text-slate-500">เอกสารยืนยันรายการและสถานะการชำระเงิน</p>
          </div>
          <div className="ml-auto text-right">
            <h2 className="text-3xl font-black text-purple-800">ใบเสร็จ</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">INV-{order.orderId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="receipt-screen-action w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
            aria-label="ปิดใบเสร็จ"
          >
            ×
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 rounded-2xl bg-purple-50/70 p-4 text-sm">
          <div>
            <span className="block font-semibold text-slate-700">เลขที่คำสั่งซื้อ</span>
            <span className="font-normal text-slate-800 font-mono">{order.orderId}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-700">วันที่สั่งซื้อ</span>
            <span className="font-normal text-slate-800">
              {orderDate.toLocaleString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <div>
            <span className="block font-semibold text-slate-700">ลูกค้า</span>
            <span className="font-normal text-slate-800">{order.customer?.name || '-'}</span>
            {order.customer?.email && <span className="block text-xs text-slate-600">{order.customer.email}</span>}
            {order.customer?.phone && <span className="block text-xs text-slate-600">{order.customer.phone}</span>}
            <span className="mt-2 block text-xs font-semibold text-slate-700">ที่อยู่จัดส่ง</span>
            <span className="block break-words text-xs font-normal text-slate-700">
              {[order.customer?.address, order.customer?.city, order.customer?.state, order.customer?.zip].filter(Boolean).join(' ') || '-'}
            </span>
          </div>
          <div>
            <span className="block font-semibold text-slate-700">สถานะคำสั่งซื้อ</span>
            <span className="font-normal text-slate-800">
              {ORDER_STAGES.find(stage => stage.id === order.status)?.label || order.status}
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">รายละเอียดสินค้า</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs font-bold text-slate-600">
                <th className="px-3 py-2.5">รายการ</th>
                <th className="px-3 py-2.5 text-center">จำนวน</th>
                <th className="px-3 py-2.5 text-right">ราคาต่อหน่วย</th>
                <th className="px-3 py-2.5 text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={`${item.name}-${index}`} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    {item.specs && <div className="mt-0.5 text-xs text-slate-500">{item.specs}</div>}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-700">{item.quantity || 1}</td>
                  <td className="px-3 py-3 text-right text-slate-700">฿{Number(item.price).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">
                    ฿{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>ยอดสินค้า</span><span>฿{Number(order.subtotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>ส่วนลด</span><span>- ฿{Number(order.discount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>ค่าจัดส่ง</span><span>฿{Number(order.shipping || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-purple-200 pt-3 text-lg font-black text-purple-800">
            <span>ยอดสุทธิ</span><span>฿{Number(order.total).toLocaleString()} บาท</span>
          </div>
          <div className={`text-right font-bold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isPaid ? 'ชำระเงินแล้ว' : `ยอดค้างชำระ ฿${Number(order.total).toLocaleString()}`}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 text-xs text-slate-600">
          {shippingStatuses.includes(order.status) && (
            <p className="mt-2">
              <span className="font-semibold text-slate-700">เลขพัสดุ:</span>{' '}
              <span className="font-mono font-bold text-purple-800">{order.trackingNumber || 'ยังไม่มีเลขพัสดุ'}</span>
            </p>
          )}
          <p className="mt-4 border-t border-slate-100 pt-3 text-center text-slate-500">
            ขอบคุณที่เลือกใช้บริการ Key Craft
          </p>
        </div>

        <div className="receipt-screen-action flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-500/20"
          >
            สั่งพิมพ์ใบเสร็จ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  )
}
