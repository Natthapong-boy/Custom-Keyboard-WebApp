import React, { useState } from 'react'
import { useShop, playSwitchSound } from '../../context/ShopContext'
import key1 from '../../assets/key1.jpg'
import key2 from '../../assets/key2.jpg'
import key3 from '../../assets/key3.jpg'

const INITIAL_PRODUCTS = [
  {
    id: 'prod-01',
    name: 'Custom Void Artisan 75',
    category: 'Custom Base Kit',
    layout: '75%',
    price: 189,
    soundType: 'click',
    stock: 15,
    specs: '75% Compact • Anodized Aluminum • Brass Weight • Hot-swap PCB',
    image: key1
  },
  {
    id: 'prod-02',
    name: 'Nebula Space 65 Edition',
    category: 'Custom Base Kit',
    layout: '65%',
    price: 159,
    soundType: 'linear',
    stock: 22,
    specs: '65% Arrow cluster • Matte Space Grey • FR4 Plate • Factory Lubed',
    image: key2
  },
  {
    id: 'prod-03',
    name: 'Zenith TKL Pro (Thai Legend)',
    category: 'Artisan Keyboard',
    layout: 'TKL 80%',
    price: 219,
    soundType: 'thock',
    stock: 8,
    specs: 'Tenkeyless 80% • Silver Frost • PBT Thai Legends • Gateron Oil Kings',
    image: key3
  }
]

export default function AdminProducts() {
  const { showToast } = useShop()
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: 'Custom Base Kit',
    layout: '75%',
    price: 179,
    soundType: 'linear',
    stock: 20,
    specs: 'Anodized CNC Aluminum • Hotswap RGB • Gasket Mount',
    image: key1
  })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.layout.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProduct = (e) => {
    e.preventDefault()
    if (!form.name) return

    const newProd = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    }

    setProducts(prev => [newProd, ...prev])
    showToast(`Added product "${form.name}" to catalog`)
    setForm({
      name: '',
      category: 'Custom Base Kit',
      layout: '75%',
      price: 179,
      soundType: 'linear',
      stock: 20,
      specs: 'Anodized CNC Aluminum • Hotswap RGB • Gasket Mount',
      image: key1
    })
    setIsAdding(false)
  }

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('Product removed from catalog', 'info')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Product & Customizer Catalog
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
            Manage keyboard chassis bases, pricing, acoustic profiles, and 3D preview specs.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          style={{
            background: '#ffffff',
            color: '#09090b',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>+ Add New Keyboard Model</span>
        </button>
      </div>

      {/* Search Filter */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          padding: '16px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search keyboards by name or layout (65%, 75%, TKL)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#1b1b20',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              padding: '8px 12px 8px 34px',
              color: '#ffffff',
              fontSize: 13
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: 9, color: '#71717a', fontSize: 14 }}>
            🔍
          </span>
        </div>
      </div>

      {/* Products Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(prod => (
          <div
            key={prod.id}
            style={{
              background: '#161619',
              border: '1px solid #27272a',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
              <img
                src={prod.image}
                alt={prod.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {prod.layout}
              </span>
            </div>

            <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {prod.name}
                </h3>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  ${prod.price}
                </span>
              </div>

              <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8 }}>
                {prod.category} • Stock: <strong>{prod.stock} units</strong>
              </div>

              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                {prod.specs}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  onClick={() => playSwitchSound(prod.soundType)}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>🔊</span> Test Sound ({prod.soundType})
                </button>

                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add New Product */}
      {isAdding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 16,
              padding: '28px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              Add Keyboard Model
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>
              Create a new customizer preset or prebuilt mechanical board.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Keyboard Model Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eclipse 65 Titanium"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Layout
                  </label>
                  <select
                    value={form.layout}
                    onChange={e => setForm({ ...form, layout: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  >
                    <option value="60%">60% Compact</option>
                    <option value="65%">65% Arrow Cluster</option>
                    <option value="75%">75% Artisan</option>
                    <option value="TKL 80%">TKL 80% Tenkeyless</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Acoustic Profile
                  </label>
                  <select
                    value={form.soundType}
                    onChange={e => setForm({ ...form, soundType: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  >
                    <option value="click">Artisan Click (Blue)</option>
                    <option value="linear">Smooth Glide (Red)</option>
                    <option value="thock">Deep Thock (Oil King)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Technical Specifications
                </label>
                <textarea
                  rows={2}
                  value={form.specs}
                  onChange={e => setForm({ ...form, specs: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: 13
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#d4d4d8',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#ffffff',
                    border: 'none',
                    color: '#09090b',
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
