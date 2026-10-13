import Icon from '../components/common/Icon'
import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useShop, ORDER_STAGES } from '../context/ShopContext'
import { generatePromptPayQrApi, verifySlipApi } from '../services/api'
import { prepareImageForUpload } from '../utils/prepareImage'

export default function Orders() {
  const { orders, loadingOrders, refreshOrders: reloadOrders, refreshProducts } = useShop()
  const [searchParams] = useSearchParams()

  const activeParamId = searchParams.get('active')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [slipPreview, setSlipPreview] = useState('')
  const [submittingProof, setSubmittingProof] = useState(false)
  const [slipError, setSlipError] = useState('')
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState(null)
  const [orderQrData, setOrderQrData] = useState(null)
  const [orderQrError, setOrderQrError] = useState('')

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

  useEffect(() => {
    setSlipPreview('')
    setSlipError('')
    if (!currentOrder || !['pending_payment', 'payment_failed'].includes(currentOrder.status)) {
      setOrderQrData(null)
      setOrderQrError('')
      return undefined
    }

    let isActive = true
    setOrderQrData(null)
    setOrderQrError('')
    generatePromptPayQrApi(currentOrder.orderId)
      .then(data => {
        if (isActive && data.success && data.qrImage) setOrderQrData(data)
        else if (isActive) setOrderQrError('ไม่สามารถสร้าง QR รับเงินได้ กรุณาติดต่อผู้ดูแลระบบ')
      })
      .catch(error => {
        if (isActive) setOrderQrError(error.message || 'ไม่สามารถสร้าง QR รับเงินได้')
      })

    return () => {
      isActive = false
    }
  }, [currentOrder?.orderId, currentOrder?.status, currentOrder?.total])

  const handleSlipFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setSlipError('')
    setSlipPreview('')
    try {
      const base64 = await prepareImageForUpload(file)
      setSlipPreview(base64)
    } catch (error) {
      setSlipError(error.message)
    }
  }

  const handleUploadProof = async () => {
    if (!currentOrder) return
    if (!slipPreview) {
      setSlipError('กรุณาเลือกไฟล์รูปสลิปก่อนตรวจสอบ')
      return
    }

    setSubmittingProof(true)
    setSlipError('')
    try {
      const result = await verifySlipApi({
        orderId: currentOrder.orderId,
        slipImageBase64: slipPreview
      })
      await Promise.all([reloadOrders(), refreshProducts()])
      setPaymentSuccessOrder({
        orderId: currentOrder.orderId,
        total: result.verifiedAmount,
        transRef: result.transRef
      })
      setSlipPreview('')
    } catch (error) {
      setSlipError(error.message)
    } finally {
      setSubmittingProof(false)
    }
  }

  const trackingStages = ORDER_STAGES.filter(stage =>
    stage.id !== 'payment_failed' &&
    (currentOrder?.orderType !== 'prebuilt' || stage.id !== 'processing_custom')
  )
  const activeStageIndex = trackingStages.findIndex(stage => stage.id === currentOrder?.status)

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span><Icon name="package" /> ระบบติดตามคำสั่งซื้อ (Order Tracking)</span>
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
          <span className="text-4xl block mb-3"><Icon name="receipt" /></span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีประวัติคำสั่งซื้อ</h2>
          <p className="text-sm text-slate-500 mb-6">คุณสามารถสั่งซื้อคีย์บอร์ดสำเร็จรูปหรือปรับแต่งเองได้ในระบบ</p>
          <Link to="/" className="btn-primary">
            เริ่มช้อปปิ้งเลย
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* LEFT: Orders List Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-purple-100 p-4 sm:p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-500 mb-2">
              รายการคำสั่งซื้อทั้งหมด ({orders.length})
            </h2>

            <div className="space-y-2 max-h-[40vh] lg:max-h-[560px] overflow-y-auto pr-1">
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
                        className="text-xs font-bold px-2 py-1 rounded-full text-right"
                        style={{
                          backgroundColor: `${stageInfo?.color || '#8b5cf6'}18`,
                          color: stageInfo?.color || '#8b5cf6'
                        }}
                      >
                        {stageInfo?.label || o.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Icon name={o.orderType === 'custom' ? 'wrench' : 'keyboard'} />
                        {o.orderType === 'custom' ? 'ประกอบเอง' : 'สำเร็จรูป'}
                      </span>
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
              <div className="bg-white rounded-3xl border border-purple-100 p-4 sm:p-8 shadow-sm">
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
                      <span><Icon name="receipt" /></span>
                      <span>พิมพ์ใบเสร็จออนไลน์</span>
                    </button>
                  </div>
                </div>

                {/* Order progress */}
                <div className="pt-6">
                  <h3 className="text-sm font-bold text-slate-500 mb-5">
                    ติดตามสถานะคำสั่งซื้อ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
                    {trackingStages.map((stage, index) => {
                      const isFailedStep = currentOrder.status === 'payment_failed' && stage.id === 'checking_payment'
                      const isCurrent = currentOrder.status === stage.id || isFailedStep
                      const isComplete = activeStageIndex > index || (currentOrder.status === 'payment_failed' && index === 0)
                      const label = isFailedStep ? 'ตรวจสอบไม่ผ่าน' : stage.label
                      const description = isFailedStep
                        ? 'กรุณาแนบสลิปที่ถูกต้องอีกครั้ง'
                        : ({
                            pending_payment: 'รอชำระเงิน',
                            checking_payment: 'กำลังตรวจสอบสลิป',
                            payment_success: 'รับชำระเงินแล้ว',
                            preparing: 'กำลังเตรียมสินค้า',
                            processing_custom: 'กำลังประกอบสินค้า',
                            pickup: 'รอขนส่งเข้ารับ',
                            shipping: 'กำลังนำส่ง',
                            delivered: 'ได้รับสินค้าแล้ว'
                          })[stage.id]
                      return (
                        <div
                          key={stage.id}
                          className={`min-w-0 rounded-2xl border p-4 transition-all ${
                            isCurrent ? (isFailedStep
                              ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-200'
                              : 'border-purple-400 bg-purple-50 ring-1 ring-purple-200')
                              : isComplete ? 'border-emerald-100 bg-emerald-50/50'
                                : 'border-slate-100 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 sm:block">
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-2xl sm:mb-3 ${
                              isFailedStep ? 'bg-rose-100' : isComplete ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}>
                              {isFailedStep
                                ? <Icon name="circleX" />
                                : isComplete
                                  ? <Icon name="check" />
                                  : <Icon name={stage.icon} />}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-bold text-sm leading-snug ${
                                isFailedStep ? 'text-rose-800' : isCurrent ? 'text-purple-900' : 'text-slate-800'
                              }`}>
                                {label}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">{description}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Notice for Payment Verification */}
                  {['pending_payment', 'payment_failed'].includes(currentOrder.status) && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-3">
                      <div>
                        <strong>{currentOrder.status === 'payment_failed' ? 'ตรวจสอบสลิปไม่ผ่าน:' : 'รอชำระเงิน:'}</strong>
                        {' '}สแกน QR ด้านล่างเพื่อโอนยอด ฿{Number(currentOrder.total).toLocaleString()} แล้วเลือกรูปสลิปจริงเพื่อตรวจสอบ
                      </div>

                      <div className="w-full max-w-xs self-center rounded-2xl border border-amber-200 bg-white p-4 text-center">
                        {orderQrData?.qrImage ? (
                          <img src={orderQrData.qrImage} alt="QR ชำระเงินของคำสั่งซื้อนี้" className="w-48 h-48 max-w-full mx-auto" />
                        ) : (
                          <div className="h-48 flex items-center justify-center text-sm text-rose-700" role="status">
                            {orderQrError || 'กำลังสร้าง QR ชำระเงิน...'}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-slate-600">
                          PromptPay {orderQrData?.account || ''}<br />
                          <strong className="text-base text-slate-900">฿{Number(currentOrder.total).toLocaleString()}</strong>
                        </div>
                      </div>

                      {slipPreview ? (
                        <div className="rounded-2xl border border-amber-200 bg-white p-2">
                          <img src={slipPreview} alt="Slip preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                        </div>
                      ) : null}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                        <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-amber-800 font-bold text-sm text-center w-full sm:w-auto">
                          อัปโหลดรูป
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSlipFileChange} className="hidden" />
                        </label>

                        <button
                          type="button"
                          onClick={handleUploadProof}
                          disabled={submittingProof || !slipPreview}
                          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm w-full sm:w-auto disabled:opacity-50"
                        >
                          {submittingProof ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสลิป'}
                        </button>
                      </div>
                      {slipError && <div className="text-sm font-semibold text-rose-700" role="alert">{slipError}</div>}
                    </div>
                  )}

                  {currentOrder.status === 'checking_payment' && (
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-sm flex items-center gap-3">
                      <span className="text-3xl" aria-hidden="true"><Icon name="sparkles" /></span>
                      <div>
                        <strong>ได้รับสลิปแล้ว</strong>
                        <div className="text-slate-600">กำลังตรวจสอบรายการชำระเงิน</div>
                      </div>
                    </div>
                  )}

                  {currentOrder.paymentProof && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentOrder.paymentProof}
                          alt="Payment slip"
                          className="w-16 h-20 rounded-xl object-cover border border-slate-200 bg-white"
                        />
                        <div>
                          <div className="font-bold text-slate-800">หลักฐานการโอน</div>
                          <div className="text-xs text-slate-500">
                            {currentOrder.paymentMethod?.transactionId
                              ? `เลขอ้างอิง ${currentOrder.paymentMethod.transactionId}`
                              : 'บันทึกสลิปไว้กับคำสั่งซื้อนี้'}
                          </div>
                        </div>
                      </div>
                      <a
                        href={currentOrder.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex justify-center rounded-full bg-white border border-purple-200 px-4 py-2 text-purple-700 font-bold hover:bg-purple-50"
                      >
                        เปิดดูสลิป <Icon name="sparkles" />
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
                        <div className="w-12 h-12 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80'}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
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

      {paymentSuccessOrder && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-payment-success-title"
        >
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 sm:p-10 text-center shadow-2xl border border-emerald-100">
            <div className="success-check mx-auto mb-6" aria-hidden="true">
              <svg viewBox="0 0 96 96" className="w-24 h-24">
                <circle className="success-check-circle" cx="48" cy="48" r="44" />
                <path className="success-checkmark" d="M27 49l14 14 29-31" />
              </svg>
            </div>
            <p className="text-sm font-bold tracking-wide text-emerald-700">PAYMENT CONFIRMED</p>
            <h2 id="order-payment-success-title" className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              ชำระเงินสำเร็จ!
            </h2>
            <p className="mt-3 text-slate-600">
              ยืนยันยอด ฿{Number(paymentSuccessOrder.total).toLocaleString()} สำหรับคำสั่งซื้อ
            </p>
            <p className="mt-1 font-mono font-bold text-purple-700">#{paymentSuccessOrder.orderId}</p>
            {paymentSuccessOrder.transRef && (
              <p className="mt-2 text-xs text-slate-400 break-all">
                เลขอ้างอิง: {paymentSuccessOrder.transRef}
              </p>
            )}
            <button
              type="button"
              onClick={() => setPaymentSuccessOrder(null)}
              className="mt-7 w-full rounded-full bg-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-700"
            >
              ดูสถานะและสลิปคำสั่งซื้อ
            </button>
          </div>
        </div>
      )}

      {/* ONLINE RECEIPT MODAL per Diagram 2 & 3 */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Receipt Header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl"><Icon name="keyboard" /></span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
              >
                <Icon name="printer" /> สั่งพิมพ์ใบเสร็จ (Print Receipt)
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
