import Icon from '../components/common/Icon'
import ProductImage from '../components/common/ProductImage'
import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { fetchProducts } from '../services/api'

export default function Home() {
  const { products, loadingProducts, addToCart } = useShop()
  const navigate = useNavigate()

  // useMemo ป้องกันการสร้าง array ใหม่ทุกครั้งที่ render (กัน useEffect วนลูปไม่รู้จบ)
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products])

  // Filtered products from the database-backed storefront.
  const [storeProducts, setStoreProducts] = useState(safeProducts)
  const [isFiltering, setIsFiltering] = useState(false)

  // Filters state (Fully connected to MongoDB query)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLayout, setSelectedLayout] = useState('All')
  const [selectedSwitch, setSelectedSwitch] = useState('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [addedToast, setAddedToast] = useState(null)

  // Layout filter options
  const layoutOptions = [
    { label: 'ทุก Layout', value: 'All' },
    { label: '60% Compact', value: '60%' },
    { label: '65% Arrow Keys', value: '65%' },
    { label: '75% Popular', value: '75%' },
    { label: 'TKL (80%)', value: 'TKL (80%)' },
    { label: 'Full Size (100%)', value: 'Full Size (100%)' },
    { label: 'Alice / Ergo', value: 'Alice / Ergo' }
  ]

  // Switch type filter options (Linear, Tactile, Clicky - 1-to-1 breakdown)
  const switchOptions = [
    { label: 'ทุกประเภทสวิตช์', value: 'All' },
    { label: 'Linear (Red)', value: 'Linear (Red)' },
    { label: 'Linear (Black)', value: 'Linear (Black)' },
    { label: 'Linear (Yellow)', value: 'Linear (Yellow)' },
    { label: 'Tactile (Brown)', value: 'Tactile (Brown)' },
    { label: 'Clicky (Blue)', value: 'Clicky (Blue)' },
    { label: 'Clicky (Green)', value: 'Clicky (Green)' }
  ]

  // Price range options (In THB บาท)
  const priceOptions = [
    { label: 'ทุกช่วงราคา', value: 'All', min: '', max: '' },
    { label: 'ไม่เกิน 2,000 ฿', value: 'under-2000', min: '0', max: '2000' },
    { label: '2,000 - 3,000 ฿', value: '2000-3000', min: '2000', max: '3000' },
    { label: '3,000 - 4,500 ฿', value: '3000-4500', min: '3000', max: '4500' },
    { label: 'มากกว่า 4,500 ฿', value: 'over-4500', min: '4500', max: '' }
  ]

  // Categories
  const categoryOptions = [
    { label: 'ทั้งหมด', value: 'All', icon: 'sparkles' },
    { label: 'คีย์บอร์ดประกอบเอง (Custom Keyboard)', value: 'Custom Keyboard', icon: 'keyboard' },
    { label: 'คีย์บอร์ดสำเร็จรูป (Pre-built Keyboard)', value: 'Pre-built Keyboard', icon: 'package' },
    { label: 'สวิตช์ (Switches)', value: 'Switches', icon: 'activity' },
    { label: 'คีย์แคป (Keycaps)', value: 'Keycaps', icon: 'palette' },
    { label: 'อุปกรณ์เสริม (Accessories)', value: 'Accessories', icon: 'cable' }
  ]

  // Trigger MongoDB query whenever filters change (strictly isolated to storefront)
  useEffect(() => {
    let isMounted = true
    const selectedPrice = priceOptions.find(p => p.value === selectedPriceRange)
    const hasActiveFilters = Boolean(
      (selectedCategory && selectedCategory !== 'All') ||
      (selectedCategory === 'Switches' ? (selectedSwitch && selectedSwitch !== 'All') : (selectedLayout && selectedLayout !== 'All')) ||
      (selectedPrice?.min || selectedPrice?.max) ||
      (searchTerm && searchTerm.trim() !== '') ||
      (sortBy && sortBy !== 'latest')
    )

    if (!hasActiveFilters) {
      setStoreProducts(safeProducts)
      setIsFiltering(false)
      return
    }

    const filters = {
      category: selectedCategory,
      layout: selectedCategory === 'Switches' ? 'All' : selectedLayout,
      switchType: selectedCategory === 'Switches' ? selectedSwitch : 'All',
      minPrice: selectedPrice?.min || '',
      maxPrice: selectedPrice?.max || '',
      search: searchTerm,
      sort: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : 'latest'
    }

    setIsFiltering(true)
    fetchProducts(filters)
      .then(data => {
        if (isMounted && data && Array.isArray(data)) {
          let list = data
          if (selectedCategory === 'Switches' && selectedSwitch !== 'All') {
            list = list.filter(p => {
              const str = `${p.switchType || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase()
              const match = selectedSwitch.match(/\(([^)]+)\)/)
              const colorKeyword = match ? match[1].toLowerCase() : ''
              const mainType = selectedSwitch.split(' ')[0].toLowerCase()
              return str.includes(selectedSwitch.toLowerCase()) ||
                     (colorKeyword && str.includes(colorKeyword)) ||
                     str.includes(mainType)
            })
          }
          setStoreProducts(list)
        } else if (isMounted) {
          // Fallback to local filter on safeProducts
          let list = [...safeProducts]
          if (selectedCategory && selectedCategory !== 'All') {
            list = list.filter(p => p.category === selectedCategory)
          }
          if (selectedCategory === 'Switches' && selectedSwitch !== 'All') {
            list = list.filter(p => {
              const str = `${p.switchType || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase()
              const match = selectedSwitch.match(/\(([^)]+)\)/)
              const colorKeyword = match ? match[1].toLowerCase() : ''
              const mainType = selectedSwitch.split(' ')[0].toLowerCase()
              return str.includes(selectedSwitch.toLowerCase()) ||
                     (colorKeyword && str.includes(colorKeyword)) ||
                     str.includes(mainType)
            })
          } else if (selectedLayout && selectedLayout !== 'All') {
            list = list.filter(p => p.layout === selectedLayout)
          }
          if (selectedPrice?.min) list = list.filter(p => Number(p.price) >= Number(selectedPrice.min))
          if (selectedPrice?.max) list = list.filter(p => Number(p.price) <= Number(selectedPrice.max))
          if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            list = list.filter(p => (p.name || '').toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term))
          }
          if (sortBy === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price))
          else if (sortBy === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price))
          setStoreProducts(list)
        }
      })
      .finally(() => {
        if (isMounted) setIsFiltering(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedCategory, selectedLayout, selectedSwitch, selectedPriceRange, searchTerm, sortBy, safeProducts])

  const visibleProducts = Array.isArray(storeProducts) ? storeProducts : []

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product._id,
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      layout: product.layout,
      switchType: product.switchType,
      quantity: 1
    })
    setAddedToast(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`)
    setTimeout(() => setAddedToast(null), 3000)
  }

  return (
    <div className="pt-20 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400">✓</span>
          <span>{addedToast}</span>
          <Link to="/cart" className="ml-2 text-purple-300 underline font-semibold">ดูตะกร้า</Link>
        </div>
      )}

      {/* Hero Section — Soft Purple & White Modern Fintech (Paynext Inspired) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-100/70 via-purple-50/40 to-white border border-purple-200/60 p-8 sm:p-12 lg:p-16 mb-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-indigo-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-purple-200 text-purple-800 text-xs font-bold tracking-wide uppercase shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            เชื่อมต่อ MongoDB Atlas Database เรียลไทม์
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            สัมผัสการพิมพ์ที่สมบูรณ์แบบ <br />
            ในสไตล์ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800">ที่เป็นตัวคุณ</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
            แพลตฟอร์มคัสตอมคีย์บอร์ดออนไลน์ เลือกซื้อคีย์บอร์ดสำเร็จรูปพร้อมใช้งาน หรือจำลองการประกอบเองทีละชิ้นส่วน 
            (Case, Switches, Keycaps) ตอบโจทย์ทั้งทำงานและเล่นเกม
          </p>

          {/* 2 Main Flow Buttons according to Diagram 3 */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/designer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02]"
            >
              <span><Icon name="wrench" /> ออกแบบประกอบเอง (Custom)</span>
              <span>→</span>
            </Link>

            <a
              href="#products-section"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-purple-50 text-purple-800 font-semibold text-sm border border-purple-200 shadow-sm transition-all"
            >
              <span><Icon name="keyboard" /> ดูคีย์บอร์ดสำเร็จรูป (Prebuilt)</span>
              <span>↓</span>
            </a>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 mt-10 border-t border-purple-200/50">
            <div>
              <div className="text-2xl font-black text-purple-700">60% - 100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">รองรับทุก Layout ขนาดแป้นพิมพ์</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-700">100% Hot-Swap</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">เปลี่ยนสวิตช์ได้โดยไม่ต้องบัดกรี</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-700">รับประกัน 1 ปี</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">จูนเสียง Thock & Lube สวิตช์มาตรฐาน</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selector Cards per Diagram 3: [สำเร็จรูป] vs [ออกแบบคีย์บอร์ดเอง] */}
      <section className="mb-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">เลือกลักษณะการสั่งซื้อ</h2>
          <p className="text-sm text-slate-500 mt-2">ตามกระบวนการในระบบ: สามารถเลือกซื้อแบบสำเร็จรูป หรือเข้าหน้าจำลองประกอบชิ้นส่วนเอง</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Prebuilt */}
          <a
            href="#products-section"
            className="group relative p-8 rounded-3xl bg-white border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                <Icon name="keyboard" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 mb-2">
                คีย์บอร์ดสำเร็จรูป (Prebuilt)
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                ช้อปสินค้าสำเร็จรูปพร้อมใช้งาน
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                คีย์บอร์ดที่ทีมงาน Mod และจูนเสียงเรียบร้อยแล้ว ค้นหา กรองตาม Layout และช่วงราคา จัดส่งได้ทันทีหลังชำระเงิน
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>เลือกชมสินค้าในคลัง</span>
              <span>→</span>
            </div>
          </a>

          {/* Card 2: Custom Build */}
          <Link
            to="/designer"
            className="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-purple-100/50 border border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md shadow-purple-500/30">
                <Icon name="wrench" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white mb-2">
                ออกแบบคีย์บอร์ดเอง (Custom Builder)
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                จำลองและปรับแต่งทีละชิ้นส่วน
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                เข้าสู่หน้าจำลอง 3D เลือกเคส, ขนาด Layout (60%, 75%, TKL), สวิตช์เสียงที่ชอบ และสีคีย์แคป พร้อมคำนวณราคาแบบเรียลไทม์
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>เปิดหน้าจำลองปรับแต่งคีย์บอร์ด</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Products & Interactive Filter Section (Database Connected 100%) */}
      <section id="products-section" className="scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
              <span>✦</span> แคตตาล็อกสินค้า
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {visibleProducts.length !== safeProducts.length
                ? `พบสินค้า ${visibleProducts.length} รายการ (จากทั้งหมด ${safeProducts.length} รายการ)`
                : `สินค้าทั้งหมดในระบบ (${safeProducts.length} รายการ)`}
            </h2>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า / สวิตช์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-full border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm"><Icon name="search" /></span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Card — Soft Purple Theme */}
        <div className="bg-white rounded-3xl border border-purple-100 p-5 sm:p-6 mb-6 shadow-sm">
          {/* 1. Category Tabs */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              หมวดหมู่สินค้า
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.value
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                      : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70'
                  }`}
                >
                  <Icon name={cat.icon} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-purple-50">
            {/* 2. Layout or Switch Filter (Dynamic based on selected category) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {selectedCategory === 'Switches' ? 'เลือกประเภทสวิตช์' : 'ขนาด Layout'}
              </label>
              {selectedCategory === 'Switches' ? (
                <select
                  value={selectedSwitch}
                  onChange={(e) => setSelectedSwitch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/40 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {switchOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/40 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {layoutOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 3. Price Filter (ไม่เกิน 2000, 2000-3000, etc.) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                ช่วงราคา (บาท)
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/40 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {priceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sort By */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                เรียงตาม
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-purple-50/40 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="latest">สินค้าใหม่ล่าสุด</option>
                <option value="price_asc">ราคา: ต่ำ → สูง</option>
                <option value="price_desc">ราคา: สูง → ต่ำ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Quick Reset Bar */}
        {(selectedCategory !== 'All' || (selectedCategory === 'Switches' ? selectedSwitch !== 'All' : selectedLayout !== 'All') || selectedPriceRange !== 'All' || searchTerm.trim() !== '') && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 bg-purple-50/80 rounded-2xl border border-purple-100 mb-6 text-xs text-purple-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">ตัวกรองปัจจุบัน:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  หมวดหมู่: {categoryOptions.find(c => c.value === selectedCategory)?.label || selectedCategory}
                  <button type="button" onClick={() => { setSelectedCategory('All'); setSelectedSwitch('All'); setSelectedLayout('All') }} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory === 'Switches' && selectedSwitch !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  สวิตช์: {switchOptions.find(s => s.value === selectedSwitch)?.label || selectedSwitch}
                  <button type="button" onClick={() => setSelectedSwitch('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory !== 'Switches' && selectedLayout !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  Layout: {selectedLayout}
                  <button type="button" onClick={() => setSelectedLayout('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedPriceRange !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  ราคา: {priceOptions.find(p => p.value === selectedPriceRange)?.label}
                  <button type="button" onClick={() => setSelectedPriceRange('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {searchTerm.trim() !== '' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  ค้นหา: "{searchTerm}"
                  <button type="button" onClick={() => setSearchTerm('')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All')
                setSelectedLayout('All')
                setSelectedSwitch('All')
                setSelectedPriceRange('All')
                setSearchTerm('')
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
            >
              <Icon name="reset" /> ล้างตัวกรองทั้งหมด (แสดงสินค้าทั้งหมดในคลัง)
            </button>
          </div>
        )}

        {/* Product Cards Grid (Loaded from MongoDB Database) */}
        {loadingProducts || isFiltering ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">กำลังกรองข้อมูลสินค้าจาก MongoDB Atlas...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-purple-100 p-8">
            <span className="text-4xl mb-3 block"><Icon name="search" /></span>
            <h3 className="text-lg font-bold text-slate-800">ไม่พบสินค้าตามเงื่อนไขที่เลือก</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              ลองปรับตัวกรองสวิตช์ หรือช่วงราคาใหม่ เพื่อค้นหาสินค้าอื่นในระบบ
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedLayout('All')
                setSelectedSwitch('All')
                setSelectedPriceRange('All')
                setSearchTerm('')
              }}
              className="mt-4 px-5 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group cursor-pointer bg-white rounded-3xl border border-purple-100/90 hover:border-purple-300 p-4 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-purple-50/70 mb-4 flex items-center justify-center p-3.5">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      imageClassName="w-full h-full object-contain drop-shadow-xs"
                      loading="lazy"
                    />
                    {/* Badge Layout */}
                    {product.layout && product.layout !== 'N/A' && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-purple-700 shadow-sm border border-purple-100">
                        {product.layout}
                      </span>
                    )}
                    {/* Stock Status */}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                        product.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {product.stock > 0 ? `สต็อก: ${product.stock}` : 'สินค้าหมด'}
                    </span>
                  </div>

                  {/* Category & Brand */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{product.brand || 'Key Craft'}</span>
                    <span>{product.category}</span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1 text-base">
                    {product.name}
                  </h3>

                  {/* Brief Specs */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {product.description || product.switchType}
                  </p>
                </div>

                {/* Price & Add to Cart button */}
                <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">ราคา</span>
                    <div className="text-lg font-extrabold text-purple-700">
                      ฿{Number(product.price).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock <= 0}
                    className="p-2.5 rounded-full bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white transition-all shadow-sm"
                    title="เพิ่มลงตะกร้าสินค้า"
                  >
                    <Icon name="cart" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}