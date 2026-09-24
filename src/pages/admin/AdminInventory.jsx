import React, { useState } from 'react'
import { useShop } from '../../context/ShopContext'

export default function AdminInventory() {
  const { inventory, updateInventoryStock, addInventoryItem } = useShop()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingPart, setIsAddingPart] = useState(false)

  // New Part Form
  const [newPart, setNewPart] = useState({
    name: '',
    category: 'Switches',
    sku: '',
    stock: 20,
    minStock: 10,
    unitPrice: 45
  })

  const categories = ['all', 'Chassis', 'Switches', 'Keycaps', 'Materials']

  const filteredInventory = inventory.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleCreatePart = (e) => {
    e.preventDefault()
    if (!newPart.name || !newPart.sku) return
    addInventoryItem({
      ...newPart,
      stock: Number(newPart.stock),
      minStock: Number(newPart.minStock),
      unitPrice: Number(newPart.unitPrice)
    })
    setNewPart({
      name: '',
      category: 'Switches',
      sku: '',
      stock: 20,
      minStock: 10,
      unitPrice: 45
    })
    setIsAddingPart(false)
  }

  // Summary stats
  const totalItemsCount = inventory.reduce((sum, i) => sum + i.stock, 0)
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.stock * (i.unitPrice || 0)), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Inventory & Raw Materials
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
            Supervise machining stock, Krytox lubricants, screw-in stabilizers, and artisan keycaps.
          </p>
        </div>

        <button
          onClick={() => setIsAddingPart(true)}
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
          <span>+ Add New Component</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div style={{ background: '#161619', border: '1px solid #27272a', borderRadius: 14, padding: '18px' }}>
          <div style={{ fontSize: 12, color: '#a1a1aa' }}>Total Parts in Stock</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            {totalItemsCount} <span style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>units</span>
          </div>
        </div>

        <div style={{ background: '#161619', border: '1px solid #27272a', borderRadius: 14, padding: '18px' }}>
          <div style={{ fontSize: 12, color: '#a1a1aa' }}>Low Stock Alerts</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: lowStockCount > 0 ? '#f59e0b' : '#10b981', marginTop: 4 }}>
            {lowStockCount} <span style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>critical parts</span>
          </div>
        </div>

        <div style={{ background: '#161619', border: '1px solid #27272a', borderRadius: 14, padding: '18px' }}>
          <div style={{ fontSize: 12, color: '#a1a1aa' }}>Total Stock Valuation</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search component by name or SKU (e.g. CASE-75, SW-OIL)..."
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: categoryFilter === cat ? 700 : 500,
                background: categoryFilter === cat ? '#ffffff' : '#1b1b20',
                color: categoryFilter === cat ? '#09090b' : '#a1a1aa',
                border: '1px solid #3f3f46',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat === 'all' ? 'All Components' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <div
        style={{
          background: '#161619',
          border: '1px solid #27272a',
          borderRadius: 14,
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#121215', borderBottom: '1px solid #27272a', color: '#71717a' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Component Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKU Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Unit Cost</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stock Level</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Quick Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const isLow = item.stock <= item.minStock
                const isOut = item.stock === 0

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #27272a',
                      transition: 'background 0.15s ease'
                    }}
                    className="hover:bg-zinc-900/40"
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {item.name}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#a1a1aa' }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: '#27272a',
                          padding: '2px 8px',
                          borderRadius: 4,
                          color: '#d4d4d8'
                        }}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#38bdf8' }}>
                      {item.sku}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 600 }}>
                      ${Number(item.unitPrice || 0).toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#ffffff' }}>
                        {item.stock}
                      </span>
                      <span style={{ fontSize: 11, color: '#71717a', marginLeft: 4 }}>
                        (Min: {item.minStock})
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: isOut ? 'rgba(239, 68, 68, 0.15)' : isLow ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                          border: `1px solid ${isOut ? 'rgba(239, 68, 68, 0.3)' : isLow ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateInventoryStock(item.id, -1)}
                          disabled={item.stock <= 0}
                          title="Reduce stock by 1"
                          style={{
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            color: '#ffffff',
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: item.stock <= 0 ? 0.3 : 1
                          }}
                        >
                          -
                        </button>

                        <button
                          onClick={() => updateInventoryStock(item.id, 5)}
                          title="Add +5 batch stock"
                          style={{
                            background: '#27272a',
                            border: '1px solid #3f3f46',
                            color: '#ffffff',
                            borderRadius: 6,
                            padding: '0 8px',
                            height: 28,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          +5
                        </button>

                        <button
                          onClick={() => updateInventoryStock(item.id, 1)}
                          title="Add +1 unit"
                          style={{
                            background: '#38bdf8',
                            border: 'none',
                            color: '#09090b',
                            borderRadius: 6,
                            width: 28,
                            height: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Part */}
      {isAddingPart && (
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
              Add Raw Material / Component
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>
              Register new keyboard parts or switches into the workshop inventory ledger.
            </p>

            <form onSubmit={handleCreatePart} className="space-y-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                  Part / Component Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. FR4 Acoustic Plate 75%"
                  value={newPart.name}
                  onChange={e => setNewPart({ ...newPart, name: e.target.value })}
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
                    Category
                  </label>
                  <select
                    value={newPart.category}
                    onChange={e => setNewPart({ ...newPart, category: e.target.value })}
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
                    <option value="Chassis">Chassis</option>
                    <option value="Switches">Switches</option>
                    <option value="Keycaps">Keycaps</option>
                    <option value="Materials">Materials & Lubes</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PLT-FR4-75"
                    value={newPart.sku}
                    onChange={e => setNewPart({ ...newPart, sku: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: '#121215',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.stock}
                    onChange={e => setNewPart({ ...newPart, stock: e.target.value })}
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

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Min. Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPart.minStock}
                    onChange={e => setNewPart({ ...newPart, minStock: e.target.value })}
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

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8', display: 'block', marginBottom: 4 }}>
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPart.unitPrice}
                    onChange={e => setNewPart({ ...newPart, unitPrice: e.target.value })}
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

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingPart(false)}
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
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
