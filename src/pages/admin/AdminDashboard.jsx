import Icon from '../../components/common/Icon'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchOwnerReports } from '../../services/api'
import { useShop } from '../../context/ShopContext'

export default function AdminDashboard() {
  const { currentUser } = useShop()
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOwnerReports()
      .then((data) => {
        if (data) setReports(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">กำลังรวบรวมรายงานจากฐานข้อมูล MongoDB Atlas...</p>
      </div>
    )
  }

  const revenue = reports?.revenue || { totalRevenue: 0, totalOrders: 0, completedOrders: 0, processingOrders: 0, pendingPaymentOrders: 0 }
  const bestSellers = reports?.bestSellers || []
  const lowStock = reports?.lowStockProducts || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span><Icon name="crown" /> สิทธิ์เจ้าของร้าน (Owner Analytics per Diagram 2)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          รายงานวิเคราะห์และสรุปผลการดำเนินงาน
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          รายงานข้อมูล 3 ด้านหลักตาม Use Case Diagram: รายงานรายได้, สินค้าขายดี, และสินค้าใกล้หมดสต็อก
        </p>
      </div>

      {/* REPORT 1: รายงานรายได้ (Revenue Report) */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span><Icon name="handCoins" /> 1. รายงานรายได้ (Revenue Overview)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ยอดรายได้รวมทั้งหมด
            </span>
            <div className="text-3xl font-black text-purple-700">
              ฿{Number(revenue.totalRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <span>↑ ยอดขายรวมตามคำสั่งซื้อจริงใน Database</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              คำสั่งซื้อทั้งหมด
            </span>
            <div className="text-3xl font-black text-slate-900">
              {revenue.totalOrders} <span className="text-sm font-semibold text-slate-400">รายการ</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              สำเร็จแล้ว: <strong>{revenue.completedOrders}</strong> รายการ
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              กำลังประกอบ/จัดส่ง
            </span>
            <div className="text-3xl font-black text-indigo-600">
              {revenue.processingOrders} <span className="text-sm font-semibold text-slate-400">รายการ</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              ขั้นตอนกำลังดำเนินการในคลัง
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              รอตรวจสลิป / รอชำระ
            </span>
            <div className="text-3xl font-black text-amber-500">
              {revenue.pendingPaymentOrders} <span className="text-sm font-semibold text-slate-400">รายการ</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              ต้องดำเนินการตรวจหลักฐาน
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* REPORT 2: รายงานสินค้าขายดี (Best Selling Report) */}
        <section className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span><Icon name="flame" /> 2. รายงานสินค้าขายดี (Best Sellers)</span>
            </h2>
            <span className="text-xs text-purple-600 font-semibold">จัดอันดับตามยอดขาย</span>
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีสถิติยอดขายเพียงพอ</p>
          ) : (
            <div className="divide-y divide-purple-50">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-slate-500 font-medium">ขายแล้ว {item.unitsSold} ชิ้น</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-purple-700 text-sm">฿{item.totalSales.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">ยอดขายรวม</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* REPORT 3: รายงานสินค้าใกล้หมดสต็อก (Low Stock Report) */}
        <section className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span><Icon name="alertTriangle" /> 3. สินค้าใกล้หมดสต็อก (Low Stock Alert)</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              สต็อก ≤ 10 ชิ้น
            </span>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-emerald-600 font-semibold py-6 text-center">
              ✓ สต็อกสินค้าทุกรายการอยู่ในระดับปลอดภัย
            </p>
          ) : (
            <div className="divide-y divide-purple-50">
              {lowStock.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={prod.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-purple-100" />
                    <div>
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-slate-400">{prod.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                      เหลือ {prod.stock} ชิ้น
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/admin/products"
              className="w-full block py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs text-center transition-colors"
            >
              ไปยังหน้าจัดการสินค้าเพื่อเติมสต็อก →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
