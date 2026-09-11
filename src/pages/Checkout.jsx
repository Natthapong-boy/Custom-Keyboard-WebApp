import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import InteractiveCard from '../components/payment/InteractiveCard'
import QRScanner from '../components/payment/QRScanner'
import key1 from '../assets/key1.jpg'

export default function Checkout() {
  const { cart, cartTotal, createOrder, showToast } = useShop()
  const navigate = useNavigate()

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: 'Elena Rostova',
    email: 'elena.rostova@keebs.studio',
    phone: '+1 (555) 392-8819',
    address: '884 Neon Boulevard, Suite 400',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'United States',
    notes: 'Laser engrave brass weight: "AESTHETICS FIRST"'
  })

  // Payment Method: 'card' | 'qr' | 'wallet'
  const [paymentMethod, setPaymentMethod] = useState('card')

  // Card Form State
  const [cardData, setCardData] = useState({
    number: '4532 8920 1142 9081',
    name: 'ELENA ROSTOVA',
    expiry: '08/29',
    cvv: '892'
  })
  const [isCardFlipped, setIsCardFlipped] = useState(false)

  // QR Code State
  const [qrVerified, setQrVerified] = useState(false)

  // Promo Code State
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')

  // Processing Animation State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')

  // Calculations
  const effectiveCart = cart.length > 0 ? cart : [
    {
      id: 'quick-demo-1',
      name: 'Custom Void 75 Cyber Edition',
      type: 'Artisan Keyboard',
      layout: '75%',
      switchType: 'Blue Clicky',
      switchSound: 'click',
      price: 189,
      quantity: 1,
      image: key1
    }
  ]

  const rawSubtotal = cart.length > 0 ? cartTotal : 189
  const shippingFee = rawSubtotal > 200 ? 0 : 15
  const discountAmount = appliedDiscount > 0 ? (rawSubtotal * appliedDiscount) : 0
  const taxAmount = Math.round((rawSubtotal - discountAmount) * 0.07 * 100) / 100
  const totalAmount = Math.round((rawSubtotal - discountAmount + shippingFee + taxAmount) * 100) / 100

  // Format Card Number
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim()
    setCardData({ ...cardData, number: formatted || '•••• •••• •••• ••••' })
  }

  // Format Expiry
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setCardData({ ...cardData, expiry: val })
  }

  // Apply Promo
  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    if (promoCode.toUpperCase() === 'KEYCRAFT10' || promoCode.toUpperCase() === 'CYBER10') {
      setAppliedDiscount(0.1)
      showToast('Promo code applied! 10% Discount active.')
    } else if (promoCode.toUpperCase() === 'VIP20') {
      setAppliedDiscount(0.2)
      showToast('VIP code applied! 20% Discount active.')
    } else {
      setPromoError('Invalid coupon code. Try "KEYCRAFT10" or "VIP20"')
    }
  }

  // Submit Payment
  const handleSubmitPayment = (e) => {
    if (e) e.preventDefault()
    setIsProcessing(true)
    setProcessingStage('Encrypting transaction payload with 256-Bit SSL...')

    setTimeout(() => {
      setProcessingStage('Authorizing with payment gateway node...')
    }, 1000)

    setTimeout(() => {
      setProcessingStage('Allocating artisanal inventory & generating order token...')
    }, 2000)

    setTimeout(() => {
      const orderPayload = {
        customer: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
          zip: shippingInfo.zip
        },
        paymentMethod: {
          type: paymentMethod,
          last4: paymentMethod === 'card' ? cardData.number.slice(-4) : 'QR99',
          brand: paymentMethod === 'card' ? 'Visa' : paymentMethod === 'qr' ? 'PromptPay QR' : 'Digital Wallet'
        },
        items: effectiveCart.map(item => ({
          id: item.id,
          name: item.name,
          specs: `${item.layout || '75%'} • ${item.caseColor || 'Custom'} • ${item.switchType || 'Artisan Switch'}`,
          switchSound: item.switchSound || 'click',
          price: item.price,
          quantity: item.quantity,
          image: item.image || key1
        })),
        subtotal: rawSubtotal,
        discount: discountAmount,
        shipping: shippingFee,
        total: totalAmount,
        notes: shippingInfo.notes
      }

      const newOrder = createOrder(orderPayload)
      setIsProcessing(false)
      navigate(`/orders?active=${newOrder.id}`)
    }, 3100)
  }

  return (
    <div className="page-container">
      {/* Processing Animation Modal */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-box animate-bounce-short">
            <div className="spin-orb"></div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Processing Payment</h3>
            <p className="text-xs font-mono text-[#a855f7] mb-6">{processingStage}</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-full animate-pulse"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 font-mono">DO NOT REFRESH THIS WINDOW</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header-block flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> Checkout / 02</p>
          <h1 className="page-title">Secure <em>Payment.</em></h1>
          <p className="page-subtitle">
            Provide your delivery details and choose your preferred encrypted payment method.
          </p>
        </div>
        <Link to="/cart" className="text-xs font-mono uppercase tracking-widest text-[#a855f7] hover:text-white transition-colors">
          ← Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Shipping Information */}
          <div className="cyber-panel p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">
                01
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Shipping Destination</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="cyber-label">Full Name *</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="cyber-label">Email Address *</label>
                <input
                  type="email"
                  className="cyber-input"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  placeholder="jane@domain.com"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="cyber-label">Street Address *</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  placeholder="123 Artisan Lane, Apt 4B"
                  required
                />
              </div>

              <div>
                <label className="cyber-label">City *</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="cyber-label">State / Prov</label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="cyber-label">Postal / ZIP *</label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={shippingInfo.zip}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                    placeholder="90210"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="cyber-label">Custom Laser Engraving / Artisan Notes</label>
                <input
                  type="text"
                  className="cyber-input"
                  value={shippingInfo.notes}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                  placeholder="e.g. Laser engraving on backplate: 'STAY CURIOUS'"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Interactive Payment Selection */}
          <div className="cyber-panel p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">Payment Method</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Encrypted 256-bit
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border font-mono text-xs text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 bg-white/5 text-[#a09ca9] hover:text-white'
                }`}
              >
                <span className="text-lg">💳</span>
                <span className="font-semibold">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`p-3.5 rounded-xl border font-mono text-xs text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'qr'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 bg-white/5 text-[#a09ca9] hover:text-white'
                }`}
              >
                <span className="text-lg">📱</span>
                <span className="font-semibold">Dynamic QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 rounded-xl border font-mono text-xs text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'wallet'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 bg-white/5 text-[#a09ca9] hover:text-white'
                }`}
              >
                <span className="text-lg">⚡</span>
                <span className="font-semibold">1-Click Pay</span>
              </button>
            </div>

            {/* Method 1: Interactive 3D Credit Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-6">
                <InteractiveCard
                  cardData={cardData}
                  isFlipped={isCardFlipped}
                  onToggleFlip={() => setIsCardFlipped(!isCardFlipped)}
                />

                {/* Card Inputs */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="cyber-label">Card Number</label>
                    <input
                      type="text"
                      className="cyber-input font-mono tracking-widest"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      placeholder="4532 8920 1142 9081"
                    />
                  </div>

                  <div>
                    <label className="cyber-label">Cardholder Full Name</label>
                    <input
                      type="text"
                      className="cyber-input font-mono uppercase"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      placeholder="NAME AS PRINTED ON CARD"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="cyber-label">Expiration Date</label>
                      <input
                        type="text"
                        className="cyber-input font-mono"
                        value={cardData.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="cyber-label">Security Code (CVV)</label>
                      <input
                        type="password"
                        className="cyber-input font-mono"
                        value={cardData.cvv}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.slice(0, 4) })}
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: Dynamic QR Scan */}
            {paymentMethod === 'qr' && (
              <QRScanner
                isVerified={qrVerified}
                onSimulateSuccess={() => {
                  setQrVerified(true)
                  showToast('Simulated QR scan confirmed by mobile client!')
                }}
              />
            )}


            {/* Method 3: 1-Click Wallets */}
            {paymentMethod === 'wallet' && (
              <div className="space-y-4 py-2">
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="w-full py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                  <span className="text-lg"></span> Pay with Apple Pay
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="w-full py-4 rounded-xl bg-[#1f1f23] hover:bg-[#2b2b31] border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                  <span className="text-cyan-400 font-bold">G</span> Google Pay
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-900 border border-purple-400/40 text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                  <span>👻</span> Connect Phantom / Solana Pay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Breakdown Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-panel cyber-panel-glow p-6 sm:p-7 sticky top-28 space-y-6">
            <h3 className="font-bold text-lg text-white border-b border-white/10 pb-4">
              Order Review
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {effectiveCart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <img src={item.image || key1} alt="" className="w-12 h-12 rounded-lg object-cover bg-black" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[10px] font-mono text-[#a09ca9]">
                      Qty: {item.quantity} • {item.switchType || 'Linear'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#d8b4fe]">
                    ${item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <label className="cyber-label flex justify-between">
                <span>Promo Code</span>
                <span className="text-purple-400">Try "KEYCRAFT10" or "VIP20"</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="cyber-input font-mono uppercase text-xs"
                  placeholder="PROMO CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs rounded-lg transition-colors font-bold flex-shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[11px] text-red-400 mt-1.5 font-mono">{promoError}</p>}
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-mono flex items-center gap-1">
                  <span>✓</span> {appliedDiscount * 100}% Discount Applied!
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 font-mono text-xs text-[#b8b0c4] pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">${rawSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedDiscount * 100}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span className="text-white">
                  {shippingFee === 0 ? <span className="text-emerald-400">FREE</span> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (7%)</span>
                <span className="text-white">${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Final Total & Authorize Button */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs font-mono uppercase text-gray-400">Total Payable</span>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitPayment}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#6366f1] text-white font-extrabold text-sm shadow-[0_0_35px_rgba(168,85,247,0.45)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize & Place Order (${totalAmount.toFixed(2)})</span>
                <span>➔</span>
              </button>

              <p className="text-[10px] text-center text-[#8a8194] font-mono mt-3">
                By clicking Authorize, you agree to the Key Craft Artisan Terms & Warranty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
