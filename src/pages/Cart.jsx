import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop, playSwitchSound } from '../context/ShopContext'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useShop()
  const navigate = useNavigate()

  const shipping = cartTotal > 200 || cartTotal === 0 ? 0 : 15
  const estimatedTax = Math.round(cartTotal * 0.07 * 100) / 100
  const finalTotal = Math.round((cartTotal + shipping + (cartTotal > 0 ? estimatedTax : 0)) * 100) / 100

  return (
    <div className="page-container">
      <div className="page-header-block flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> Your Cart / 01</p>
          <h1 className="page-title">Curated <em>Bag.</em></h1>
          <p className="page-subtitle">
            Review your customized keyboards, artisan switches, and accessories before proceeding to secure checkout.
          </p>
        </div>
        <Link to="/designer" className="text-xs font-mono uppercase tracking-widest text-[#d8b4fe] hover:text-white transition-colors">
          + Add more builds <span>↗</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="cyber-panel p-16 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/40 flex items-center justify-center mx-auto mb-6 text-2xl">
            ✦
          </div>
          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-sm text-[#a09ca9] mb-8">
            You haven't added any custom keyboards yet. Build your signature mechanical keyboard in our 3D configurator.
          </p>
          <Link to="/designer" className="button button-primary inline-flex items-center">
            Open 3D Designer <span>↗</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="cyber-panel p-5 md:p-6 transition-all hover:border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                {/* Item Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#140b20] border border-white/10 overflow-hidden flex-shrink-0 relative group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.caseColorHex && (
                    <div
                      className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full border border-white/50 shadow-md"
                      style={{ backgroundColor: item.caseColorHex }}
                      title={`Case: ${item.caseColor}`}
                    />
                  )}
                </div>

                {/* Specs & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                    <span className="text-base font-bold font-mono text-[#d8b4fe]">
                      ${item.price * item.quantity}
                    </span>
                  </div>

                  <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">
                    {item.type || 'Custom Mechanical Build'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-[#c0b8cd] mb-3">
                    {item.layout && (
                      <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                        Layout: <strong className="text-white">{item.layout}</strong>
                      </span>
                    )}
                    {item.switchType && (
                      <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                        Switch: <strong className="text-white">{item.switchType}</strong>
                        {item.switchSound && (
                          <button
                            type="button"
                            onClick={() => playSwitchSound(item.switchSound)}
                            className="text-[#a855f7] hover:text-white text-[10px] ml-1"
                            title="Test Sound"
                          >
                            ▶
                          </button>
                        )}
                      </span>
                    )}
                    {item.keycaps && (
                      <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                        Caps: <strong className="text-white">{item.keycaps}</strong>
                      </span>
                    )}
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 bg-[#0d0714] border border-white/10 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-sm font-mono text-[#a09ca9] hover:text-white hover:bg-white/10 rounded transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-sm font-mono text-[#a09ca9] hover:text-white hover:bg-white/10 rounded transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-mono text-red-400/80 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <span>✕</span> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="cyber-panel cyber-panel-glow p-6 sticky top-28 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-bold text-lg text-white">Order Summary</h3>
                <span className="text-xs font-mono text-purple-400">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs text-[#b8b0c4]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white font-medium">
                    {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (7%)</span>
                  <span className="text-white font-medium">${estimatedTax.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-purple-300/80 pt-1">
                    ✦ Free Express shipping on orders over $200
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase">Estimated Total</span>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    ${finalTotal.toFixed(2)}
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  USD
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-bold text-sm shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout <span>➔</span>
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-[9px] font-mono text-[#8a8194]">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white text-xs mb-0.5">🔒</div>
                  256-Bit SSL
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white text-xs mb-0.5">⚡</div>
                  Instant Sync
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-white text-xs mb-0.5">✨</div>
                  Handcrafted
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
