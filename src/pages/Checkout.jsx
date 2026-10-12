import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { generatePromptPayQrApi, verifySlipApi } from '../services/api'
import { prepareImageForUpload } from '../utils/prepareImage'

export default function Checkout() {
  const { cart, placeOrder, currentUser, refreshOrders, refreshProducts } = useShop()
  const navigate = useNavigate()

  // Shipping Form State
  const [shippingInfo, setShippingInfo] = useState({
    name: currentUser?.name || 'ณัฐพงษ์ ใจมั่นคง',
    email: currentUser?.email || 'customer@customkb.com',
    phone: '089-123-4567',
    address: '123/45 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร',
    city: 'กรุงเทพมหานคร',
    zip: '10900',
    notes: ''
  })

  // Order state after confirmed
  const [createdOrder, setCreatedOrder] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // PromptPay QR State
  const [qrCodeData, setQrCodeData] = useState(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [qrError, setQrError] = useState('')

  // Slip Upload & Verification State
  const [slipFileBase64, setSlipFileBase64] = useState('')
  const [slipPreview, setSlipPreview] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [verifyError, setVerifyError] = useState('')

  // Calculations in THB
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0)
  const shipping = 0
  const total = subtotal + shipping

  // Check if order contains custom builds
  const hasCustomBuild = cart.some(
    (item) => item.orderType === 'custom' || item.type === 'Custom Build' || item.type === 'Three.js Modular Keyboard'
  )

  // Auto-generate real PromptPay QR when order is created
  useEffect(() => {
    if (createdOrder) {
      setLoadingQr(true)
      setQrError('')
      generatePromptPayQrApi(createdOrder.orderId)
        .then((res) => {
          if (res.success && res.qrImage) {
            setQrCodeData(res)
          } else {
            setQrError('ไม่สามารถสร้าง QR รับเงินได้ กรุณาติดต่อผู้ดูแลระบบ')
          }
        })
        .catch((err) => {
          setQrError(err.message || 'ไม่สามารถสร้าง QR รับเงินได้')
        })
        .finally(() => {
          setLoadingQr(false)
        })
    }
  }, [createdOrder, total])

  useEffect(() => {
    if (!verificationResult || !createdOrder) return undefined
    const timeoutId = window.setTimeout(() => {
      navigate(`/orders?active=${encodeURIComponent(createdOrder.orderId)}`)
    }, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [verificationResult, createdOrder, navigate])

  const handleConfirmOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      setErrorMsg('ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อน')
      return
    }

    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.zip) {
      setErrorMsg('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const orderPayload = {
        orderType: hasCustomBuild ? 'custom' : 'prebuilt',
        customer: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          zip: shippingInfo.zip,
          country: 'Thailand'
        },
        items: cart.map(item => ({
          name: item.name,
          specs: item.specs || `${item.layout || ''} ${item.switchType || ''}`.trim(),
          price: Number(item.price),
          quantity: item.quantity || 1,
          image: item.image
        })),
        paymentMethod: {
          type: 'promptpay',
          brand: 'PromptPay QR (สแกนพร้อมเพย์)'
        },
        subtotal,
        shipping,
        discount: 0,
        total,
        notes: shippingInfo.notes || (hasCustomBuild ? 'ลูกค้าสั่งประกอบเอง' : 'สินค้าสำเร็จรูป')
      }

      const newOrder = await placeOrder(orderPayload)
      setCreatedOrder(newOrder)
    } catch (err) {
      setErrorMsg(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle slip image file input
  const handleSlipFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setVerifyError('')
    setSlipPreview('')
    setSlipFileBase64('')
    try {
      const base64 = await prepareImageForUpload(file)
      setSlipPreview(base64)
      setSlipFileBase64(base64)
    } catch (error) {
      setVerifyError(error.message)
    }
  }

  // Verify Slip via SlipOK API
  const handleVerifySlip = async () => {
    if (!createdOrder) return
    if (!slipFileBase64) {
      setVerifyError('กรุณาเลือกรูปภาพสลิปก่อนทำการตรวจสอบ')
      return
    }

    setIsVerifying(true)
    setVerifyError('')
    setVerificationResult(null)

    try {
      const res = await verifySlipApi({
        orderId: createdOrder.orderId,
        slipImageBase64: slipFileBase64
      })

      if (res.success) {
        await Promise.all([refreshOrders(), refreshProducts()])
        setVerificationResult(res)
      } else {
        setVerifyError(res.message || 'การตรวจสอบสลิปไม่สำเร็จ')
      }
    } catch (err) {
      setVerifyError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป')
    } finally {
      setIsVerifying(false)
    }
  }


  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <span className="text-4xl block mb-3">🛒</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">ไม่มีสินค้าในตะกร้าสำหรับชำระเงิน</h2>
        <p className="text-sm text-slate-500 mb-6">กรุณาเลือกซื้อคีย์บอร์ดหรือประกอบเองก่อนดำเนินการชำระเงิน</p>
        <Link to="/" className="btn-primary">
          กลับไปเลือกซื้อสินค้า
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Step Header per Diagram 1 & 3 */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span>💳 ขั้นตอนการยืนยันและชำระเงิน</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          {createdOrder ? 'ชำระเงินและแนบหลักฐานการโอน' : 'กรอกข้อมูลจัดส่งและยืนยันคำสั่งซื้อ'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {createdOrder
            ? `รหัสคำสั่งซื้อ #${createdOrder.orderId} กรุณาสแกน QR Code หรือโอนเงินเข้าบัญชีร้านเพื่อดำเนินการ`
            : 'ตรวจสอบรายการและกรอกข้อมูลจัดส่งพัสดุตามกระบวนการสั่งซื้อ'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: Confirm Order & Shipping Form */}
      {!createdOrder ? (
        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Shipping Form (Left) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-4 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📍 ข้อมูลการจัดส่งสินค้า</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อ-นามสกุล ผู้รับ *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">อีเมลสำหรับรับใบเสร็จ *</label>
              <input
                type="email"
                required
                value={shippingInfo.email}
                onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">ที่อยู่จัดส่งพัสดุ *</label>
              <textarea
                required
                rows={2}
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">จังหวัด *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">รหัสไปรษณีย์ *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.zip}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">ข้อความเพิ่มเติม / ความต้องการพิเศษ</label>
              <input
                type="text"
                placeholder="เช่น ต้องการสวิตช์ Lube เพิ่มเติม หรือ ฝากส่งช่วงบ่าย"
                value={shippingInfo.notes}
                onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/30 text-sm focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Order Items & Summary (Right) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>

              {/* Items List */}
              <div className="divide-y divide-purple-50 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                        <div className="text-slate-400 font-medium">จำนวน: {item.quantity || 1} ชิ้น</div>
                      </div>
                    </div>
                    <div className="font-bold text-purple-700">
                      ฿{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-purple-50 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า:</span>
                  <span className="font-bold text-slate-800">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง:</span>
                  <span className="font-bold text-slate-800">
                    {shipping === 0 ? <span className="text-emerald-600">ฟรี</span> : `฿${shipping}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-purple-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">ยอดชำระทั้งสิ้น:</span>
                  <span className="font-black text-2xl text-purple-700">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confirm Order Button per Diagram 3 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all text-center block disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ →'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* STAGE 2: Payment Display & Slip Verification (PromptPay & SlipOK) */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-purple-100 p-4 sm:p-8 shadow-sm space-y-6 sm:space-y-8 animate-fadeIn">
          <div className="text-center">
            <span className="inline-block p-3 rounded-2xl bg-purple-100 text-purple-700 text-3xl mb-3">
              📱
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              สแกน QR Code เพื่อชำระเงิน
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              คำสั่งซื้อ <strong className="text-purple-700 font-mono">#{createdOrder.orderId}</strong> บันทึกลงระบบแล้ว
            </p>
          </div>

          {/* PromptPay Dynamic QR Code Card */}
          <div className="p-6 rounded-3xl bg-purple-50/60 border border-purple-200/80 text-center max-w-sm mx-auto space-y-4">
            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-purple-100">
              {loadingQr ? (
                <div className="w-52 h-52 flex items-center justify-center text-purple-500 text-xs font-medium">
                  กำลังสร้าง QR พร้อมเพย์...
                </div>
              ) : qrCodeData?.qrImage ? (
                <img
                  src={qrCodeData.qrImage}
                  alt="PromptPay Real QR Code"
                  className="w-52 h-52 max-w-full mx-auto rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 max-w-full flex items-center justify-center text-center text-sm text-rose-700">
                  {qrError || 'ยังไม่มี QR สำหรับชำระเงิน'}
                </div>
              )}
            </div>

            <div>
              {qrCodeData?.qrImage && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  QR Code ล็อคยอดเงินแล้ว สแกนแล้วไม่ต้องกรอกยอด
                </div>
              )}
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ยอดเงินที่ต้องชำระ</div>
              <div className="text-3xl font-black text-purple-700">
                ฿{(createdOrder.total || total).toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">
                พร้อมเพย์: <strong>{qrCodeData?.account || 'ยังไม่ได้ตั้งค่าบัญชีร้าน'}</strong> (Key Craft Studio)
              </div>
            </div>
          </div>

          {/* Slip Upload & Real-time Verification Section */}
          <div className="space-y-4 pt-4 border-t border-purple-100">
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                แนบสลิปโอนเงินเพื่อตรวจสอบยอดอัตโนมัติ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ระบบเชื่อมต่อ <strong>SlipOK API</strong> ตรวจสอบยอดเงินจริงและวันเวลาโอนแบบเรียลไทม์
              </p>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/20 rounded-2xl p-6 text-center transition-all">
              {slipPreview ? (
                <div className="space-y-3">
                  <img
                    src={slipPreview}
                    alt="Slip Preview"
                    className="max-h-56 mx-auto rounded-xl shadow-sm border border-purple-200 object-contain"
                  />
                  <div className="flex justify-center gap-2">
                    <label className="cursor-pointer text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-all">
                      เปลี่ยนรูปสลิป
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleSlipFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <span className="text-3xl block">🧾</span>
                  <div className="text-xs font-bold text-purple-700">คลิกเพื่อเลือกไฟล์รูปภาพสลิป</div>
                  <div className="text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG (รูปสลิปจาก Mobile Banking)</div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSlipFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Error Feedback */}
            {verifyError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 animate-fadeIn">
                <div>
                  <div className="font-bold">❌ การตรวจสอบไม่สำเร็จ</div>
                  <div>{verifyError}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleVerifySlip}
                disabled={isVerifying || !slipFileBase64 || !qrCodeData?.qrImage || !!verificationResult}
                className="flex-1 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all text-center block disabled:opacity-50"
              >
                {isVerifying ? '🔍 กำลังเชื่อมต่อ SlipOK ตรวจสอบยอดเงิน...' : '🔍 ตรวจสอบสลิปและยืนยันการชำระเงิน'}
              </button>

            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
              >
                ข้ามไปหน้าติดตามคำสั่งซื้อ →
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationResult && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
        >
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 sm:p-10 text-center shadow-2xl border border-emerald-100">
            <div className="success-check mx-auto mb-6" aria-hidden="true">
              <svg viewBox="0 0 96 96" className="w-24 h-24">
                <circle className="success-check-circle" cx="48" cy="48" r="44" />
                <path className="success-checkmark" d="M27 49l14 14 29-31" />
              </svg>
            </div>
            <p className="text-sm font-bold tracking-wide text-emerald-700">PAYMENT CONFIRMED</p>
            <h2 id="payment-success-title" className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              ชำระเงินสำเร็จ!
            </h2>
            <p className="mt-3 text-slate-600">
              ยืนยันยอด ฿{Number(verificationResult.verifiedAmount).toLocaleString()} สำหรับคำสั่งซื้อ
            </p>
            <p className="mt-1 font-mono font-bold text-purple-700">#{createdOrder.orderId}</p>
            {verificationResult.transRef && (
              <p className="mt-2 text-xs text-slate-400 break-all">
                เลขอ้างอิง: {verificationResult.transRef}
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate(`/orders?active=${encodeURIComponent(createdOrder.orderId)}`)}
              className="mt-7 w-full rounded-full bg-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700"
            >
              ดูสถานะและสลิปตอนนี้
            </button>
            <p className="mt-3 text-xs text-slate-400">กำลังเปิดรายละเอียดคำสั่งซื้อให้อัตโนมัติ...</p>
          </div>
        </div>
      )}
    </div>
  )
}
