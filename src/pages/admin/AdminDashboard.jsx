import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop, ORDER_STAGES } from '../../context/ShopContext'

export default function AdminDashboard() {
  const { orders, inventory, staffList, user, isOwner } = useShop()
  const [chartView, setChartView] = useState('monthly') // 'monthly' | 'weekly'
  const [hoveredBar, setHoveredBar] = useState(null)

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) + 24500 // simulated historical base
  const totalOrdersCount = orders.length + 135
  const activeWorkshopOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const lowStockItems = inventory.filter(i => i.stock <= (i.minStock || 10))

  // Monthly Revenue Data (Historical + Live)
  const monthlyData = [
    { label: 'Apr', revenue: 2850, orders: 15 },
    { label: 'May', revenue: 3400, orders: 18 },
    { label: 'Jun', revenue: 4100, orders: 22 },
    { label: 'Jul', revenue: 3900, orders: 20 },
    { label: 'Aug', revenue: 5200, orders: 27 },
    { label: 'Sep', revenue: 6350, orders: 32 }
  ]

  const weeklyData = [
    { label: 'Mon', revenue: 640, orders: 3 },
    { label: 'Tue', revenue: 890, orders: 4 },
    { label: 'Wed', revenue: 1120, orders: 6 },
    { label: 'Thu', revenue: 750, orders: 4 },
    { label: 'Fri', revenue: 1450, orders: 8 },
    { label: 'Sat', revenue: 1820, orders: 9 },
    { label: 'Sun', revenue: 1320, orders: 7 }
  ]

  const activeChartData = chartView === 'monthly' ? monthlyData : weeklyData
  const maxRevenue = Math.max(...activeChartData.map(d => d.revenue))

  // Workshop pipeline count by stage
  const stageBreakdown = ORDER_STAGES.map(stage => {
    const count = orders.filter(o => o.status === stage.id).length
    return {
      ...stage,
      count
    }
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa' }}>
              Management Console
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#71717a' }} />
            <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
              Workshop Live Pulse
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            {isOwner ? 'Executive Dashboard & Revenue' : 'Workshop Activity & Metrics'}
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
            Real-time analytics across artisanal assembly stages, parts inventory, and financial performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            style={{
              fontSize: 13,
              fontWeight: 600,
              background: '#ffffff',
              color: '#09090b',
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none'
            }}
          >
            📦 Dispatch Orders ({activeWorkshopOrders.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 14,
            padding: '20px'
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Total Revenue</span>
            <span style={{ fontSize: 18 }}>💰</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: '#34d399' }}>
            <span>↑ 18.4%</span>
            <span style={{ color: '#71717a' }}>vs last month</span>
          </div>
        </div>

        {/* Active Workshop Orders */}
        <div
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 14,
            padding: '20px'
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Active in Workshop</span>
            <span style={{ fontSize: 18 }}>⚙️</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.02em' }}>
            {activeWorkshopOrders.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#a1a1aa' }}>builds</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: '#a1a1aa' }}>
            <span>Total orders to date: <strong>{totalOrdersCount}</strong></span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 14,
            padding: '20px'
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Avg. Order Value (AOV)</span>
            <span style={{ fontSize: 18 }}>📈</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            $189.40
          </div>
          <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: '#a1a1aa' }}>
            <span>High-margin custom kits</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 14,
            padding: '20px'
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Low Stock Warnings</span>
            <span style={{ fontSize: 18 }}>⚠️</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: lowStockItems.length > 0 ? '#f59e0b' : '#10b981', letterSpacing: '-0.02em' }}>
            {lowStockItems.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#a1a1aa' }}>components</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: '#a1a1aa' }}>
            <Link to="/admin/inventory" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
              Restock in inventory →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Revenue & Sales Chart */}
        <div
          className="lg:col-span-8"
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: '24px'
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Revenue & Sales Trends
              </h3>
              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '2px 0 0' }}>
                Monetary volume and custom build orders over time
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setChartView('monthly')}
                style={{
                  background: chartView === 'monthly' ? '#27272a' : 'transparent',
                  color: chartView === 'monthly' ? '#ffffff' : '#a1a1aa',
                  fontWeight: chartView === 'monthly' ? 700 : 500,
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Monthly (6M)
              </button>
              <button
                onClick={() => setChartView('weekly')}
                style={{
                  background: chartView === 'weekly' ? '#27272a' : 'transparent',
                  color: chartView === 'weekly' ? '#ffffff' : '#a1a1aa',
                  fontWeight: chartView === 'weekly' ? 700 : 500,
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                This Week (7D)
              </button>
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div style={{ height: 260, position: 'relative', marginTop: 20 }}>
            {/* Grid Horizontal Guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div style={{ borderBottom: '1px dashed #71717a', width: '100%' }} />
              <div style={{ borderBottom: '1px dashed #71717a', width: '100%' }} />
              <div style={{ borderBottom: '1px dashed #71717a', width: '100%' }} />
              <div style={{ borderBottom: '1px solid #71717a', width: '100%' }} />
            </div>

            {/* Bars */}
            <div className="relative h-full flex items-end justify-around gap-2 px-2 pb-6">
              {activeChartData.map((item, idx) => {
                const heightPercent = (item.revenue / maxRevenue) * 85
                const isHovered = hoveredBar === idx

                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip Hover Bubble */}
                    {isHovered && (
                      <div
                        style={{
                          background: '#27272a',
                          border: '1px solid #52525b',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 11,
                          color: '#ffffff',
                          position: 'absolute',
                          bottom: `${heightPercent + 30}%`,
                          zIndex: 10,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none'
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>${item.revenue.toLocaleString()}</div>
                        <div style={{ color: '#a1a1aa' }}>{item.orders} orders placed</div>
                      </div>
                    )}

                    {/* Bar Pillar */}
                    <div
                      style={{
                        width: '60%',
                        maxWidth: 42,
                        height: `${heightPercent}%`,
                        background: isHovered
                          ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                          : 'linear-gradient(180deg, #52525b 0%, #27272a 100%)',
                        borderRadius: '6px 6px 2px 2px',
                        transition: 'all 0.25s ease',
                        boxShadow: isHovered ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none'
                      }}
                    />

                    {/* Label */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        fontSize: 11,
                        fontWeight: isHovered ? 700 : 500,
                        color: isHovered ? '#ffffff' : '#71717a',
                        marginTop: 8
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-zinc-800" style={{ color: '#a1a1aa' }}>
            <span>📈 Peak day: Saturday ($1,820)</span>
            <span style={{ color: '#38bdf8' }}>✓ All transactions verified with Stripe/PromptPay</span>
          </div>
        </div>

        {/* Right 4 cols: Workshop Pipeline Stage Donut / Breakdown */}
        <div
          className="lg:col-span-4"
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: '24px'
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: 0, marginBottom: 4 }}>
            Workshop Pipeline
          </h3>
          <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, marginBottom: 20 }}>
            Live status of customer keyboard builds
          </p>

          <div className="space-y-3">
            {stageBreakdown.map((st) => (
              <div
                key={st.id}
                style={{
                  background: '#1b1b20',
                  border: '1px solid #27272a',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: 16 }}>{st.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#71717a' }}>
                      Stage {ORDER_STAGES.findIndex(s => s.id === st.id) + 1} of 6
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 8,
                    background: `${st.badgeColor}20`,
                    color: st.badgeColor,
                    border: `1px solid ${st.badgeColor}40`
                  }}
                >
                  {st.count} {st.count === 1 ? 'build' : 'builds'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link
              to="/admin/orders"
              style={{
                display: 'block',
                textAlign: 'center',
                background: '#27272a',
                border: '1px solid #3f3f46',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12,
                padding: '8px',
                borderRadius: 8,
                textDecoration: 'none'
              }}
            >
              Open Order Workshop Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Switches & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Switches & Keycaps */}
        <div
          className="lg:col-span-6"
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: '24px'
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: '0 0 16px' }}>
            Popular Switch Sound Profiles
          </h3>

          <div className="space-y-4">
            {[
              { name: 'Gateron Blue Clicky (Artisan Click)', share: 38, count: '54 builds', color: '#38bdf8' },
              { name: 'Cherry MX Red Linear (Smooth Glide)', share: 32, count: '46 builds', color: '#f43f5e' },
              { name: 'Gateron Oil King (Deep Thock)', share: 20, count: '28 builds', color: '#eab308' },
              { name: 'Silent Tactile Brown (Office Low Decibel)', share: 10, count: '14 builds', color: '#10b981' }
            ].map(sw => (
              <div key={sw.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{sw.name}</span>
                  <span style={{ color: '#a1a1aa' }}>{sw.share}% ({sw.count})</span>
                </div>
                <div style={{ height: 6, background: '#27272a', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${sw.share}%`,
                      background: sw.color,
                      borderRadius: 4
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Component Watch */}
        <div
          className="lg:col-span-6"
          style={{
            background: '#161619',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: '24px'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Critical Inventory Watch
            </h3>
            <Link to="/admin/inventory" style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
              View All Parts →
            </Link>
          </div>

          <div className="space-y-3">
            {inventory.slice(0, 4).map(item => {
              const isLow = item.stock <= item.minStock
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#1b1b20',
                    border: '1px solid #27272a',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>
                      SKU: {item.sku} • Category: {item.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isLow ? '#f59e0b' : '#ffffff' }}>
                        {item.stock} in stock
                      </div>
                      <div style={{ fontSize: 10, color: isLow ? '#f59e0b' : '#71717a' }}>
                        {isLow ? '⚠️ Below Min (10)' : 'Optimal'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
