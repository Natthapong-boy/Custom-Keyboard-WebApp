import Icon from '../../components/common/Icon'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchOwnerReports } from '../../services/api'
import { useShop } from '../../context/ShopContext'
import { isOwnerRole } from '../../utils/roles'

export default function AdminDashboard() {
  const { currentUser } = useShop()
  const navigate = useNavigate()
  const isOwner = isOwnerRole(currentUser?.role)

  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // หากเป็นพนักงาน (Staff) ที่พยายามเข้า URL หน้ารายงานโดยตรง ให้ redirect กลับหน้ารายการสั่งซื้อทันที
    if (currentUser && !isOwner) {
      navigate('/admin/orders', {
        replace: true,
        state: { unauthorizedMessage: 'คุณไม่มีสิทธิ์เข้าถึงหน้ารายงานและภาพรวมร้านค้า (Unauthorized) เฉพาะระดับ Owner / CEO เท่านั้น' }
      })
      return
    }

    let isCurrentRequest = true
    setLoading(true)
    setError('')

    fetchOwnerReports({ month: selectedMonth, year: selectedYear }, currentUser?.token)
      .then((data) => {
        if (isCurrentRequest) setReports(data)
      })
      .catch((fetchError) => {
        if (isCurrentRequest) setError(fetchError.message)
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [retryCount, selectedMonth, selectedYear, currentUser, isOwner, navigate])

  // UI สำหรับกรณีไม่มีสิทธิ์เข้าถึง (Unauthorized)
  if (currentUser && !isOwner) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
          <Icon name="circleX" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึง (Unauthorized)</h2>
        <p className="text-sm text-rose-600 mt-2 font-medium">
          หน้ารายงานยอดขายและภาพรวมร้านค้าสงวนสิทธิ์เฉพาะผู้ใช้ระดับ Owner หรือ CEO เท่านั้น
        </p>
        <p className="text-xs text-slate-400 mt-2">ระบบกำลังนำท่านกลับไปยังหน้ารายการสั่งซื้อ...</p>
        <div className="mt-5">
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all inline-block"
          >
            ไปยังหน้ารายการสั่งซื้อ
          </Link>
        </div>
      </div>
    )
  }

  if (loading && !reports) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">กำลังโหลดรายงาน...</p>
      </div>
    )
  }

  if (error && !reports) {
    return (
      <div role="alert" className="max-w-xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <h1 className="font-bold text-slate-900">ไม่สามารถโหลดรายงานได้</h1>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="mt-4 rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white hover:bg-purple-800"
        >
          ลองอีกครั้ง
        </button>
      </div>
    )
  }

  const revenue = reports?.revenue || { totalRevenue: 0, totalOrders: 0, completedOrders: 0, processingOrders: 0, pendingPaymentOrders: 0 }
  const bestSellers = reports?.bestSellers || []
  const lowStock = reports?.lowStockProducts || []
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 6 }, (_, index) => currentYear - index)
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <Icon name="crown" /> รายงานร้านค้า
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">ภาพรวมผลการดำเนินงาน</h1>
        <p className="text-sm text-slate-600 mt-1">ตรวจสอบรายได้ ยอดขาย และสินค้าใกล้หมดสต็อก</p>
      </div>

      <section className="bg-white rounded-2xl border border-purple-100 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">ช่วงเวลาของรายงาน</h2>
            <p className="text-xs text-slate-500 mt-1">เลือกเดือนและปีเพื่อดูรายได้กับสินค้าขายดี</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <label className="text-xs font-semibold text-slate-600">
              เดือน
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">ทุกเดือน</option>
                {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              ปี
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">ทุกปี</option>
                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            โหลดรายงานไม่สำเร็จ: {error}
          </p>
        )}
        {loading && reports && <p className="mt-3 text-xs text-purple-700">กำลังอัปเดตรายงาน...</p>}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Icon name="handCoins" /> รายได้และคำสั่งซื้อ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              รายได้ในช่วงที่เลือก
            </span>
            <div className="text-3xl font-black text-purple-700">
              ฿{Number(revenue.totalRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-2">
              ไม่รวมคำสั่งซื้อที่ชำระไม่สำเร็จ
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
        <section className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon name="flame" /> สินค้าขายดี
            </h2>
            <span className="text-xs text-purple-600 font-semibold">ตามช่วงเวลาที่เลือก</span>
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">ไม่มีรายการขายในช่วงเวลานี้</p>
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

        <section className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon name="alertTriangle" /> สินค้าใกล้หมดสต็อก
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              สต็อกปัจจุบัน · ≤ 10 ชิ้น
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
