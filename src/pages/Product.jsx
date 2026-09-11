import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useShop, playSwitchSound } from '../context/ShopContext'
import key1 from '../assets/key1.jpg'
import key2 from '../assets/key2.jpg'
import key3 from '../assets/key3.jpg'

const productCatalog = {
  1: {
    id: 1,
    name: 'Void 75 Artisan Edition',
    type: 'Gasket Mount / 75%',
    price: 189,
    image: key1,
    switchType: 'Blue Clicky',
    switchSound: 'click',
    desc: 'Machined from a single block of aerospace-grade 6063 aluminium. Featuring multi-layer poron dampening and hot-swap PCB.'
  },
  2: {
    id: 2,
    name: 'Nebula 65 Compact',
    type: 'CNC Aluminium / 65%',
    price: 159,
    image: key2,
    switchType: 'Red Linear',
    switchSound: 'linear',
    desc: 'Ultra-compact desk real estate with seamless brass weight integration and custom tuned linear switches.'
  },
  3: {
    id: 3,
    name: 'Eclipse TKL Wireless',
    type: 'Tri-Mode Wireless / TKL',
    price: 219,
    image: key3,
    switchType: 'Brown Tactile',
    switchSound: 'soft',
    desc: 'Low-latency 2.4GHz wireless and Bluetooth 5.2 connectivity paired with custom lubed tactile switches.'
  }
}

export default function Product() {
  const { id } = useParams()
  const nav = useNavigate()
  const { addToCart } = useShop()

  const product = productCatalog[id] || productCatalog[1]

  const handleAddToCart = () => {
    addToCart({
      id: `prod-${product.id}`,
      name: product.name,
      type: product.type,
      layout: product.type.split('/')[1]?.trim() || '75%',
      switchType: product.switchType,
      switchSound: product.switchSound,
      price: product.price,
      quantity: 1,
      image: product.image
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    nav('/checkout')
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <Link to="/" className="text-xs font-mono text-[#a09ca9] hover:text-white transition-colors">
          ← Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="cyber-panel p-8 flex items-center justify-center bg-[#130b1e] relative group overflow-hidden">
            <div className="absolute inset-0 bg-radial from-purple-600/10 to-transparent pointer-events-none"></div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[480px] object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot"></span> In Stock / Artisan Batch</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-2">
              {product.name}
            </h1>
            <p className="text-xs font-mono text-purple-400 uppercase tracking-widest">
              {product.type}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">${product.price}</span>
            <span className="text-xs text-[#8c8296] font-mono">USD • Free Priority Air Shipping</span>
          </div>

          <p className="text-sm text-[#a09ca9] leading-relaxed">
            {product.desc}
          </p>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#a09ca9]">Default Switch:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{product.switchType}</span>
                <button
                  type="button"
                  onClick={() => playSwitchSound(product.switchSound)}
                  className="sound-badge-btn"
                  title="Test Switch Sound"
                >
                  ▶ Hear Sound
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#a09ca9]">Chassis:</span>
              <span className="text-white">Anodized CNC Aluminum</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#a09ca9]">Mounting:</span>
              <span className="text-white">Gasket Isolation with Poron</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Buy Now (${product.price})
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 rounded-full border border-purple-500/40 text-white hover:bg-white/10 font-mono text-xs uppercase tracking-wider transition-all"
            >
              + Add to Cart
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => nav('/designer')}
              className="text-xs font-mono text-purple-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>⚙️</span> Customize this keyboard in 3D Designer <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
