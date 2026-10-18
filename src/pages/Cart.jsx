import Icon from '../components/common/Icon'
import PartImage from '../components/common/PartImage'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { isStaffAccount } from '../utils/roles'

export default function Cart() {
  const { cart, removeFromCart, updateCartQty, clearCart, currentUser } = useShop()
  const isStaff = isStaffAccount(currentUser)
  const navigate = useNavigate()

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0)
  const shipping = 0
  const finalTotal = subtotal + shipping

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <span><Icon name="cart" /> ตะกร้าสินค้าของคุณ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            รายการสินค้าที่เลือก ({cart.reduce((s, i) => s + (i.quantity || 1), 0)} ชิ้น)
          </h1>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
          >
            ล้างตะกร้าทั้งหมด
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100 p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            <Icon name="cart" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ตะกร้าของคุณยังว่างอยู่</h2>
          <p className="text-sm text-slate-500 mb-6">
            ยังไม่มีสินค้าในตะกร้า คุณสามารถเลือกดูคีย์บอร์ดสำเร็จรูป หรือจำลองประกอบเองได้เลย
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="btn-primary">
              เลือกซื้อสินค้าหน้าแรก
            </Link>
            <Link
              to="/designer"
              onClick={(e) => {
                if (isStaff) {
                  e.preventDefault()
                  alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
                }
              }}
              className="btn-secondary"
            >
              <Icon name="wrench" /> ประกอบเอง
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all hover:border-purple-200"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-50/60 overflow-hidden flex-shrink-0 border border-purple-100 flex items-center justify-center p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        {item.orderType === 'custom' || item.type === 'Custom Build' ? 'ประกอบเอง (Custom)' : 'สำเร็จรูป (Prebuilt)'}
                      </span>
                      {item.layout && (
                        <span className="text-xs font-semibold text-slate-400">
                          Layout {item.layout}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    {item.specs && (
                      <p className="text-xs text-slate-500 mt-0.5 max-w-md line-clamp-1">
                        {item.specs}
                      </p>
                    )}
                    {item.selectedParts?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.selectedParts.map((part, index) => (
                          <div key={`${part.type}-${index}`} className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-white px-1.5 py-1 text-[10px] text-slate-600">
                            <span className="w-5 h-5 rounded bg-purple-50 border border-purple-100 overflow-hidden shrink-0">
                              <PartImage
                                src={part.image}
                                type={part.type}
                                color={part.color}
                                secondaryColor={part.secondaryColor}
                                alt={part.name}
                                className="h-full w-full object-contain"
                              />
                            </span>
                            <span>{part.type}: {part.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-base font-extrabold text-purple-700 mt-2">
                      ฿{Number(item.price).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Controls (Qty & Remove) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-purple-50">
                  <div className="flex items-center border border-purple-200 rounded-full bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, (item.quantity || 1) - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-purple-50 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, (item.quantity || 1) + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-purple-50 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors"
                  >
                    ลบสินค้า
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-purple-100 p-4 sm:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า:</span>
                <span className="font-bold text-slate-800">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง:</span>
                <span className="font-bold text-slate-800">
                  {shipping === 0 ? <span className="text-emerald-600">ไม่มีค่าจัดส่ง</span> : `฿${shipping}`}
                </span>
              </div>
              <div className="pt-3 border-t border-purple-50 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">ยอดชำระสุทธิ:</span>
                <span className="font-black text-2xl text-purple-700">
                  ฿{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isStaff) {
                  alert('โปรดเข้าสู่ระบบด้วยบัญชีลูกค้า')
                  return
                }
                navigate('/checkout')
              }}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all text-center block"
            >
              ดำเนินการสั่งซื้อและชำระเงิน →
            </button>

            <Link
              to="/"
              className="w-full text-center block text-xs font-semibold text-purple-600 hover:underline"
            >
              ← เลือกดูสินค้าอื่นเพิ่มเติม
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
