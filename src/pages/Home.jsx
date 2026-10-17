import Icon from '../components/common/Icon'
import ProductImage from '../components/common/ProductImage'
import CustomSelect from '../components/common/CustomSelect'
import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { fetchProductsPage } from '../services/api'

const PRODUCTS_PER_PAGE = 10

export default function Home() {
  const { products, cart, addToCart, updateCartQty, removeFromCart } = useShop()
  const navigate = useNavigate()

  // useMemo ป้องกันการสร้าง array ใหม่ทุกครั้งที่ render (กัน useEffect วนลูปไม่รู้จบ)
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products])

  // Filtered products from the database-backed storefront.
  const [storeProducts, setStoreProducts] = useState(safeProducts)
  const [isFiltering, setIsFiltering] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 0 })
  const [productLoadError, setProductLoadError] = useState('')
  const [productRetryKey, setProductRetryKey] = useState(0)

  // Filters state (Fully connected to MongoDB query)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAllFilter, setSelectedAllFilter] = useState('All')
  const [selectedLayout, setSelectedLayout] = useState('All')
  const [selectedSwitch, setSelectedSwitch] = useState('All')
  const [selectedPlateType, setSelectedPlateType] = useState('All')
  const [selectedKeycapProfile, setSelectedKeycapProfile] = useState('All')
  const [selectedCaseMaterial, setSelectedCaseMaterial] = useState('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [addedToast, setAddedToast] = useState(null)

  // Options groups for the custom 'สินค้าทั้งหมด' dropdown
  const allFilterGroups = [
    {
      group: 'กลุ่ม Layout',
      options: [
        { label: '60% Compact', value: 'layout:60%' },
        { label: '65% Arrow Keys', value: 'layout:65%' },
        { label: '75% Popular', value: 'layout:75%' },
        { label: 'TKL (80%)', value: 'layout:TKL (80%)' },
        { label: 'Full Size (100%)', value: 'layout:Full Size (100%)' },
        { label: 'Alice / Ergo', value: 'layout:Alice / Ergo' }
      ]
    },
    {
      group: 'กลุ่มเคส (Material)',
      options: [
        { label: 'Aluminum', value: 'case:Aluminum' },
        { label: 'PC', value: 'case:PC' },
        { label: 'ABS', value: 'case:ABS' },
        { label: 'Wood', value: 'case:Wood' }
      ]
    },
    {
      group: 'กลุ่มสวิตช์ (Switch Type)',
      options: [
        { label: 'Linear (Red)', value: 'switch:Linear (Red)' },
        { label: 'Linear (Black)', value: 'switch:Linear (Black)' },
        { label: 'Linear (Yellow)', value: 'switch:Linear (Yellow)' },
        { label: 'Tactile (Brown)', value: 'switch:Tactile (Brown)' },
        { label: 'Clicky (Blue)', value: 'switch:Clicky (Blue)' },
        { label: 'Clicky (Green)', value: 'switch:Clicky (Green)' }
      ]
    },
    {
      group: 'กลุ่มคีย์แคป (Profile)',
      options: [
        { label: 'วัสดุ Cherry', value: 'keycap:Cherry' },
        { label: 'วัสดุ OEM', value: 'keycap:OEM' },
        { label: 'วัสดุ SA', value: 'keycap:SA' },
        { label: 'วัสดุ XDA', value: 'keycap:XDA' }
      ]
    },
    {
      group: 'กลุ่มเพลต (Plate Type)',
      options: [
        { label: 'วัสดุแบบนุ่ม (Soft/Flexible)', value: 'plate:soft' },
        { label: 'วัสดุแบบแข็ง (Stiff/Rigid)', value: 'plate:stiff' }
      ]
    }
  ]

  const allFilterOptions = [
    { label: 'ทั้งหมด', value: 'All' },
    ...allFilterGroups
  ]

  const sortOptions = [
    { label: 'สินค้าใหม่ล่าสุด', value: 'latest' },
    { label: 'ราคา: ต่ำ → สูง', value: 'price_asc' },
    { label: 'ราคา: สูง → ต่ำ', value: 'price_desc' }
  ]

  // Layout filter options
  const layoutOptions = [
    { label: 'ทั้งหมด', value: 'All' },
    { label: '60% Compact', value: '60%' },
    { label: '65% Arrow Keys', value: '65%' },
    { label: '75% Popular', value: '75%' },
    { label: 'TKL (80%)', value: 'TKL (80%)' },
    { label: 'Full Size (100%)', value: 'Full Size (100%)' },
    { label: 'Alice / Ergo', value: 'Alice / Ergo' }
  ]

  // Keycap profile filter options (Cherry, OEM, SA, XDA)
  const keycapProfileOptions = [
    { label: 'ทั้งหมด', value: 'All' },
    { label: 'วัสดุ Cherry', value: 'Cherry' },
    { label: 'วัสดุ OEM', value: 'OEM' },
    { label: 'วัสดุ SA', value: 'SA' },
    { label: 'วัสดุ XDA', value: 'XDA' }
  ]

  // Plate material filter options (Soft/Flexible vs Stiff/Rigid)
  const plateOptions = [
    { label: 'ทั้งหมด', value: 'All' },
    { label: 'วัสดุแบบนุ่ม (Soft/Flexible)', value: 'soft' },
    { label: 'วัสดุแบบแข็ง (Stiff/Rigid)', value: 'stiff' }
  ]

  // Case material filter options (Aluminum, PC, ABS, Wood)
  const caseMaterialOptions = [
    { label: 'ทั้งหมด', value: 'All' },
    { label: 'Aluminum', value: 'Aluminum' },
    { label: 'PC', value: 'PC' },
    { label: 'ABS', value: 'ABS' },
    { label: 'Wood', value: 'Wood' }
  ]

  // Switch type filter options (Linear, Tactile, Clicky - 1-to-1 breakdown)
  const switchOptions = [
    { label: 'ทั้งหมด', value: 'All' },
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
    { label: 'เคสคีย์บอร์ด (Case Material & Color)', value: 'Case Material & Color', icon: 'box' },
    { label: 'คีย์บอร์ดสำเร็จรูป (Pre-built Keyboard)', value: 'Pre-built Keyboard', icon: 'package' },
    { label: 'สวิตช์ (Switches)', value: 'Switches', icon: 'activity' },
    { label: 'คีย์แคป (Keycaps)', value: 'Keycaps', icon: 'palette' },
    { label: 'เพลตซับเสียง (Plate Material)', value: 'Plate Material', icon: 'layers' }
  ]

  // Keycap profile deduction helper
  const getKeycapProfile = (k) => {
    if (k.keycapProfile) return k.keycapProfile
    const text = `${k.name || ''} ${k.description || ''}`.toUpperCase()
    if (text.includes('SA') || text.includes('VINTAGE') || text.includes('พิมพ์ดีด')) return 'SA'
    if (text.includes('XDA') || text.includes('SHIRO') || text.includes('FLAT')) return 'XDA'
    if (text.includes('OEM') || text.includes('CARBON') || text.includes('CYBER') || text.includes('PUDDING')) return 'OEM'
    return 'Cherry'
  }

  // Case material matching helper
  const matchCaseMaterial = (p, material) => {
    if (!material || material === 'All') return true
    const target = material.toLowerCase()
    const matField = (p.caseMaterial || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()

    if (target === 'aluminum') {
      return matField.includes('aluminum') || name.includes('aluminum') || desc.includes('อลูมิเนียม')
    }
    if (target === 'pc') {
      return matField.includes('pc') || matField.includes('polycarbonate') || name.includes('pc') || name.includes('polycarbonate') || desc.includes('polycarbonate')
    }
    if (target === 'abs') {
      return matField.includes('abs') || name.includes('abs') || desc.includes('abs')
    }
    if (target === 'wood') {
      return matField.includes('wood') || name.includes('wood') || desc.includes('ไม้')
    }
    return matField.includes(target) || name.includes(target)
  }

  // Plate classification helpers for fallback / client-side filtering
  const isSoftPlate = (p) => {
    if (p.plateCategory === 'soft') return true
    if (p.plateCategory === 'stiff') return false
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    return name.includes('fr4') ||
      name.includes('polycarbonate') ||
      name.includes('pc') ||
      name.includes('pom') ||
      desc.includes('ยืดหยุ่น') ||
      desc.includes('thock')
  }

  const isStiffPlate = (p) => {
    if (p.plateCategory === 'stiff') return true
    if (p.plateCategory === 'soft') return false
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    if (name.includes('polycarbonate') || name.includes('pom') || name.includes('fr4')) return false
    return name.includes('aluminum') ||
      name.includes('brass') ||
      name.includes('carbon fiber') ||
      name.includes('copper') ||
      name.includes('steel') ||
      name.includes('ทองแดง') ||
      name.includes('ทองเหลือง') ||
      name.includes('สแตนเลส') ||
      name.includes('อลูมิเนียม') ||
      desc.includes('clack')
  }

  // Switch matching helper
  const matchSwitch = (p, switchVal) => {
    if (!switchVal || switchVal === 'All') return true
    if (p.switchType === switchVal) return true
    if (p.switchType && p.switchType.trim().toLowerCase() === switchVal.toLowerCase()) return true
    const match = switchVal.match(/\(([^)]+)\)/)
    const colorKeyword = match ? match[1].toLowerCase() : ''
    if (colorKeyword) {
      const nameWords = (p.name || '').toLowerCase().split(/\s+/)
      if (nameWords.includes(colorKeyword)) return true
    }
    return false
  }

  // Parser and evaluator for the unified 'สินค้าทั้งหมด' dropdown
  const parseAllFilter = (val) => {
    if (!val || val === 'All') return { type: 'all', value: 'All' }
    if (val.startsWith('layout:')) return { type: 'layout', value: val.replace('layout:', '') }
    if (val.startsWith('case:')) return { type: 'caseMaterial', value: val.replace('case:', '') }
    if (val.startsWith('switch:')) return { type: 'switchType', value: val.replace('switch:', '') }
    if (val.startsWith('keycap:')) return { type: 'keycapProfile', value: val.replace('keycap:', '') }
    if (val.startsWith('plate:')) return { type: 'plateCategory', value: val.replace('plate:', '') }

    if (['60%', '65%', '75%', 'TKL (80%)', 'Full Size (100%)', 'Alice / Ergo'].includes(val)) {
      return { type: 'layout', value: val }
    }
    if (['Aluminum', 'PC', 'ABS', 'Wood'].includes(val)) {
      return { type: 'caseMaterial', value: val }
    }
    if (['Linear (Red)', 'Linear (Black)', 'Linear (Yellow)', 'Tactile (Brown)', 'Clicky (Blue)', 'Clicky (Green)'].includes(val)) {
      return { type: 'switchType', value: val }
    }
    if (['Cherry', 'OEM', 'SA', 'XDA'].includes(val)) {
      return { type: 'keycapProfile', value: val }
    }
    if (['soft', 'stiff'].includes(val)) {
      return { type: 'plateCategory', value: val }
    }
    return { type: 'all', value: 'All' }
  }

  const applyAllFilter = (p, parsed) => {
    if (!parsed || parsed.type === 'all') return true
    if (parsed.type === 'layout') {
      return p.layout === parsed.value
    }
    if (parsed.type === 'caseMaterial') {
      return matchCaseMaterial(p, parsed.value)
    }
    if (parsed.type === 'switchType') {
      return matchSwitch(p, parsed.value)
    }
    if (parsed.type === 'keycapProfile') {
      return getKeycapProfile(p).toLowerCase() === parsed.value.toLowerCase() ||
        (p.name || '').toLowerCase().includes(parsed.value.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(parsed.value.toLowerCase())
    }
    if (parsed.type === 'plateCategory') {
      return parsed.value === 'soft' ? isSoftPlate(p) : isStiffPlate(p)
    }
    return true
  }

  const getAllFilterLabel = (val) => {
    const map = {
      'layout:60%': 'Layout: 60% Compact',
      'layout:65%': 'Layout: 65% Arrow Keys',
      'layout:75%': 'Layout: 75% Popular',
      'layout:TKL (80%)': 'Layout: TKL (80%)',
      'layout:Full Size (100%)': 'Layout: Full Size (100%)',
      'layout:Alice / Ergo': 'Layout: Alice / Ergo',
      'case:Aluminum': 'เคส: Aluminum',
      'case:PC': 'เคส: PC',
      'case:ABS': 'เคส: ABS',
      'case:Wood': 'เคส: Wood',
      'switch:Linear (Red)': 'สวิตช์: Linear (Red)',
      'switch:Linear (Black)': 'สวิตช์: Linear (Black)',
      'switch:Linear (Yellow)': 'สวิตช์: Linear (Yellow)',
      'switch:Tactile (Brown)': 'สวิตช์: Tactile (Brown)',
      'switch:Clicky (Blue)': 'สวิตช์: Clicky (Blue)',
      'switch:Clicky (Green)': 'สวิตช์: Clicky (Green)',
      'keycap:Cherry': 'คีย์แคป: วัสดุ Cherry',
      'keycap:OEM': 'คีย์แคป: วัสดุ OEM',
      'keycap:SA': 'คีย์แคป: วัสดุ SA',
      'keycap:XDA': 'คีย์แคป: วัสดุ XDA',
      'plate:soft': 'เพลต: วัสดุแบบนุ่ม (Soft/Flexible)',
      'plate:stiff': 'เพลต: วัสดุแบบแข็ง (Stiff/Rigid)'
    }
    return map[val] || val
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedAllFilter, selectedLayout, selectedSwitch, selectedPlateType, selectedKeycapProfile, selectedCaseMaterial, selectedPriceRange, searchTerm, sortBy])

  // Fetch only the requested storefront page from MongoDB.
  useEffect(() => {
    let isMounted = true
    const selectedPrice = priceOptions.find(p => p.value === selectedPriceRange)
    const parsedAll = selectedCategory === 'All' ? parseAllFilter(selectedAllFilter) : null

    const filters = {
      category: selectedCategory,
      layout: selectedCategory === 'All'
        ? (parsedAll?.type === 'layout' ? parsedAll.value : 'All')
        : ((selectedCategory === 'Custom Keyboard' || selectedCategory === 'Pre-built Keyboard') ? selectedLayout : 'All'),
      switchType: selectedCategory === 'All'
        ? (parsedAll?.type === 'switchType' ? parsedAll.value : 'All')
        : (selectedCategory === 'Switches' ? selectedSwitch : 'All'),
      plateCategory: selectedCategory === 'All'
        ? (parsedAll?.type === 'plateCategory' ? parsedAll.value : 'All')
        : ((selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') ? selectedPlateType : 'All'),
      keycapProfile: selectedCategory === 'All'
        ? (parsedAll?.type === 'keycapProfile' ? parsedAll.value : 'All')
        : (selectedCategory === 'Keycaps' ? selectedKeycapProfile : 'All'),
      caseMaterial: selectedCategory === 'All'
        ? (parsedAll?.type === 'caseMaterial' ? parsedAll.value : 'All')
        : (selectedCategory === 'Case Material & Color' ? selectedCaseMaterial : 'All'),
      minPrice: selectedPrice?.min || '',
      maxPrice: selectedPrice?.max || '',
      search: searchTerm,
      sort: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : 'latest'
    }

    setIsFiltering(true)
    setProductLoadError('')
    fetchProductsPage({ ...filters, page: currentPage, limit: PRODUCTS_PER_PAGE })
      .then(data => {
        if (isMounted && (Array.isArray(data) || Array.isArray(data?.products))) {
          const legacyResponse = Array.isArray(data)
          let list = legacyResponse ? data : data.products
          if (selectedCategory === 'All' && selectedAllFilter !== 'All') {
            const parsed = parseAllFilter(selectedAllFilter)
            list = list.filter(p => applyAllFilter(p, parsed))
          }
          if ((selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') && selectedPlateType !== 'All') {
            list = list.filter(p => selectedPlateType === 'soft' ? isSoftPlate(p) : isStiffPlate(p))
          }
          if (selectedCategory === 'Keycaps' && selectedKeycapProfile !== 'All') {
            list = list.filter(p => getKeycapProfile(p).toLowerCase() === selectedKeycapProfile.toLowerCase())
          }
          if (selectedCategory === 'Case Material & Color' && selectedCaseMaterial !== 'All') {
            list = list.filter(p => matchCaseMaterial(p, selectedCaseMaterial))
          }
          if (selectedCategory === 'Switches' && selectedSwitch !== 'All') {
            list = list.filter(p => matchSwitch(p, selectedSwitch))
          }
          const total = legacyResponse ? list.length : Number(data.total) || 0
          const totalPages = legacyResponse
            ? Math.ceil(total / PRODUCTS_PER_PAGE)
            : Number(data.totalPages) || 0
          setPagination({ totalPages })
          setStoreProducts(legacyResponse
            ? list.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
            : list)
          if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages)
          }
        } else if (isMounted) {
          // Fallback to local filter on safeProducts
          let list = [...safeProducts]
          if (selectedCategory && selectedCategory !== 'All') {
            if (selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') {
              list = list.filter(p => p.category === 'Plate Material' || p.category === 'Accessories' || p.partType === 'plate')
            } else if (selectedCategory === 'Case Material & Color') {
              list = list.filter(p => p.category === 'Case Material & Color' || (p.partType || '').toLowerCase() === 'case')
            } else {
              list = list.filter(p => p.category === selectedCategory)
            }
          }
          if (selectedCategory === 'All' && selectedAllFilter !== 'All') {
            const parsed = parseAllFilter(selectedAllFilter)
            list = list.filter(p => applyAllFilter(p, parsed))
          }
          if ((selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') && selectedPlateType !== 'All') {
            list = list.filter(p => selectedPlateType === 'soft' ? isSoftPlate(p) : isStiffPlate(p))
          } else if (selectedCategory === 'Keycaps' && selectedKeycapProfile !== 'All') {
            list = list.filter(p => getKeycapProfile(p).toLowerCase() === selectedKeycapProfile.toLowerCase())
          } else if (selectedCategory === 'Case Material & Color' && selectedCaseMaterial !== 'All') {
            list = list.filter(p => matchCaseMaterial(p, selectedCaseMaterial))
          } else if (selectedCategory === 'Switches' && selectedSwitch !== 'All') {
            list = list.filter(p => matchSwitch(p, selectedSwitch))
          } else if ((selectedCategory === 'Custom Keyboard' || selectedCategory === 'Pre-built Keyboard') && selectedLayout && selectedLayout !== 'All') {
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
          const total = list.length
          const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)
          setPagination({ totalPages })
          setStoreProducts(list.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE))
          if (safeProducts.length === 0) {
            setProductLoadError('เชื่อมต่อระบบสินค้าไม่สำเร็จ กรุณาลองโหลดรายการอีกครั้ง')
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsFiltering(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedCategory, selectedAllFilter, selectedLayout, selectedSwitch, selectedPlateType, selectedKeycapProfile, selectedCaseMaterial, selectedPriceRange, searchTerm, sortBy, safeProducts, currentPage, productRetryKey])

  const visibleProducts = Array.isArray(storeProducts) ? storeProducts : []
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0)
  const pageNumbers = pagination.totalPages <= 7
    ? Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
    : currentPage <= 4
      ? [1, 2, 3, 4, 5, 'ellipsis-end', pagination.totalPages]
      : currentPage >= pagination.totalPages - 3
        ? [1, 'ellipsis-start', ...Array.from({ length: 5 }, (_, index) => pagination.totalPages - 4 + index)]
        : [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', pagination.totalPages]

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

      {/* Hero Section */}
      <section className="rounded-3xl bg-white border border-purple-100 p-7 sm:p-10 lg:p-12 mb-12 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold tracking-wide mb-5">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            คีย์บอร์ดในแบบของคุณ
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            เลือกคีย์บอร์ด <span className="text-purple-700">ในสไตล์คุณ</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-7 max-w-xl">
            เลือกแบบพร้อมใช้ หรือปรับแต่งและประกอบเองได้ตามใจ
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/designer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-colors"
            >
              <Icon name="wrench" /> ปรับแต่งคีย์บอร์ด
              <Icon name="arrowRight" />
            </Link>

            <a
              href="#products-section"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-purple-50 text-purple-800 font-semibold text-sm border border-purple-200 transition-colors"
            >
              <Icon name="keyboard" /> ดูแบบพร้อมใช้
            </a>
          </div>

        </div>
      </section>

      <section className="mb-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">เริ่มต้นแบบไหนดี?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="#products-section"
            className="group min-h-56 p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
                <Icon name="keyboard" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                เลือกแบบพร้อมใช้
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                เลือกคีย์บอร์ดที่ประกอบเสร็จแล้ว
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-bold text-purple-700">
              <span>เลือกสินค้า</span>
              <Icon name="arrowRight" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          <Link
            to="/designer"
            className="group min-h-56 p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
                <Icon name="wrench" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                ออกแบบเอง
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                เลือกเคส สวิตช์ และคีย์แคปในแบบคุณ
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-bold text-purple-700">
              <span>เริ่มปรับแต่ง</span>
              <Icon name="arrowRight" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Products & Interactive Filter Section (Database Connected 100%) */}
      <section id="products-section" className="scroll-mt-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="min-w-0 order-last xl:order-first xl:col-span-9">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="w-full md:w-96 relative md:ml-auto">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า / สวิตช์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-2xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
            <span className="absolute left-4 top-3.5 text-purple-600 text-sm"><Icon name="search" /></span>
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

        <div className="bg-purple-50 rounded-3xl border border-purple-200 p-5 sm:p-6 mb-6 shadow-sm">
          {/* 1. Category Tabs */}
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                <Icon name="sliders" />
              </span>
              ค้นหาสินค้าและเลือกอะไหล่
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-3.5">เลือกหมวดหมู่เพื่อดูเคส สวิตช์ คีย์แคป และอุปกรณ์ต่าง ๆ</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    if (cat.value === 'Custom Keyboard') {
                      navigate('/designer')
                      return
                    }
                    setSelectedCategory(cat.value)
                    setSelectedAllFilter('All')
                    setSelectedKeycapProfile('All')
                    setSelectedPlateType('All')
                    setSelectedSwitch('All')
                    setSelectedCaseMaterial('All')
                    setSelectedLayout('All')
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    selectedCategory === cat.value
                      ? 'bg-purple-700 text-white border-purple-700 shadow-md shadow-purple-900/15'
                      : 'bg-white text-slate-700 border-purple-200 hover:border-purple-500 hover:text-purple-800'
                  }`}
                >
                  <Icon name={cat.icon} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-filter helpers */}
          {(() => {
            const showKeycapFilter = selectedCategory === 'Keycaps'
            const showPlateFilter = selectedCategory === 'Plate Material' || selectedCategory === 'Accessories'
            const showSwitchFilter = selectedCategory === 'Switches'
            const showCaseFilter = selectedCategory === 'Case Material & Color'
            // For other categories (เช่น ทั้งหมด, คีย์บอร์ดประกอบเอง, คีย์บอร์ดสำเร็จรูป, ฯลฯ)

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-purple-200">
                {/* 2. Dynamic Category Dropdown (Keycaps / Plates / Switches / Case Materials / Layout / All Products) */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    {showKeycapFilter
                      ? 'เลือกประเภทคีย์แคป'
                      : showPlateFilter
                      ? 'เลือกประเภทแผ่นซับเสียง'
                      : showSwitchFilter
                      ? 'เลือกประเภทสวิตช์'
                      : showCaseFilter
                      ? 'เลือกวัสดุเคส'
                      : selectedCategory === 'All'
                      ? 'สินค้าทั้งหมด'
                      : 'ขนาด Layout'}
                  </label>
                  {showKeycapFilter ? (
                    <CustomSelect
                      value={selectedKeycapProfile}
                      onChange={setSelectedKeycapProfile}
                      options={keycapProfileOptions}
                    />
                  ) : showPlateFilter ? (
                    <CustomSelect
                      value={selectedPlateType}
                      onChange={setSelectedPlateType}
                      options={plateOptions}
                    />
                  ) : showSwitchFilter ? (
                    <CustomSelect
                      value={selectedSwitch}
                      onChange={setSelectedSwitch}
                      options={switchOptions}
                    />
                  ) : showCaseFilter ? (
                    <CustomSelect
                      value={selectedCaseMaterial}
                      onChange={setSelectedCaseMaterial}
                      options={caseMaterialOptions}
                    />
                  ) : selectedCategory === 'All' ? (
                    <CustomSelect
                      value={selectedAllFilter}
                      onChange={setSelectedAllFilter}
                      options={allFilterOptions}
                    />
                  ) : (
                    <CustomSelect
                      value={selectedLayout}
                      onChange={setSelectedLayout}
                      options={layoutOptions}
                    />
                  )}
                </div>

                {/* 3. Price Filter (ไม่เกิน 2000, 2000-3000, etc.) */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    ช่วงราคา (บาท)
                  </label>
                  <CustomSelect
                    value={selectedPriceRange}
                    onChange={setSelectedPriceRange}
                    options={priceOptions}
                  />
                </div>

                {/* 4. Sort By */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    เรียงตาม
                  </label>
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                  />
                </div>
              </div>
            )
          })()}
        </div>

        {/* Active Filter Badges & Quick Reset Bar */}
        {(selectedCategory !== 'All' ||
          (selectedCategory === 'All' && selectedAllFilter !== 'All') ||
          (selectedCategory === 'Keycaps' && selectedKeycapProfile !== 'All') ||
          ((selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') && selectedPlateType !== 'All') ||
          (selectedCategory === 'Switches' && selectedSwitch !== 'All') ||
          (selectedCategory === 'Case Material & Color' && selectedCaseMaterial !== 'All') ||
          ((selectedCategory === 'Custom Keyboard' || selectedCategory === 'Pre-built Keyboard') && selectedLayout !== 'All') ||
          selectedPriceRange !== 'All' ||
          searchTerm.trim() !== '') && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 bg-purple-50/80 rounded-2xl border border-purple-100 mb-6 text-xs text-purple-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">ตัวกรองปัจจุบัน:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  หมวดหมู่: {categoryOptions.find(c => c.value === selectedCategory)?.label || selectedCategory}
                  <button type="button" onClick={() => { setSelectedCategory('All'); setSelectedAllFilter('All'); setSelectedPlateType('All'); setSelectedKeycapProfile('All'); setSelectedSwitch('All'); setSelectedCaseMaterial('All'); setSelectedLayout('All') }} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory === 'All' && selectedAllFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  {getAllFilterLabel(selectedAllFilter)}
                  <button type="button" onClick={() => setSelectedAllFilter('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory === 'Keycaps' && selectedKeycapProfile !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  ประเภทคีย์แคป: {keycapProfileOptions.find(p => p.value === selectedKeycapProfile)?.label || selectedKeycapProfile}
                  <button type="button" onClick={() => setSelectedKeycapProfile('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {(selectedCategory === 'Plate Material' || selectedCategory === 'Accessories') && selectedPlateType !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  แผ่นซับเสียง: {plateOptions.find(p => p.value === selectedPlateType)?.label || selectedPlateType}
                  <button type="button" onClick={() => setSelectedPlateType('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory === 'Switches' && selectedSwitch !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  สวิตช์: {switchOptions.find(s => s.value === selectedSwitch)?.label || selectedSwitch}
                  <button type="button" onClick={() => setSelectedSwitch('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {selectedCategory === 'Case Material & Color' && selectedCaseMaterial !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 font-semibold border border-purple-200 shadow-xs">
                  วัสดุเคส: {caseMaterialOptions.find(c => c.value === selectedCaseMaterial)?.label || selectedCaseMaterial}
                  <button type="button" onClick={() => setSelectedCaseMaterial('All')} className="hover:text-purple-950 font-bold">✕</button>
                </span>
              )}
              {(selectedCategory === 'Custom Keyboard' || selectedCategory === 'Pre-built Keyboard') && selectedLayout !== 'All' && (
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
                setSelectedAllFilter('All')
                setSelectedLayout('All')
                setSelectedSwitch('All')
                setSelectedPlateType('All')
                setSelectedKeycapProfile('All')
                setSelectedCaseMaterial('All')
                setSelectedPriceRange('All')
                setSearchTerm('')
                setSortBy('latest')
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
            >
              <Icon name="reset" /> ล้างตัวกรองทั้งหมด (แสดงสินค้าทั้งหมดในคลัง)
            </button>
          </div>
        )}

        {/* Product Cards Grid (Loaded from MongoDB Database) */}
        {productLoadError && visibleProducts.length === 0 ? (
          <div role="alert" className="py-16 text-center bg-white rounded-3xl border border-rose-200 p-8">
            <span className="text-4xl mb-3 block text-rose-500"><Icon name="alertTriangle" /></span>
            <h3 className="text-lg font-bold text-slate-800">{productLoadError}</h3>
            <button
              type="button"
              onClick={() => setProductRetryKey((key) => key + 1)}
              className="mt-4 px-5 py-2 rounded-full bg-purple-700 text-white font-bold text-sm hover:bg-purple-800"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : isFiltering && visibleProducts.length === 0 ? (
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
                setSelectedAllFilter('All')
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
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group cursor-pointer bg-white rounded-3xl border border-purple-100/90 hover:border-purple-300 p-5 flex min-h-[420px] flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-purple-50/70 mb-5 flex items-center justify-center p-4">
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
          <div className="mt-7 flex flex-col items-center justify-center gap-3 border-t border-slate-200 pt-5">
            {isFiltering && (
              <span className="text-xs font-medium text-purple-700" role="status">
                กำลังโหลดสินค้า...
              </span>
            )}
            {pagination.totalPages > 1 && (
              <nav aria-label="เปลี่ยนหน้ารายการสินค้า" className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={isFiltering || currentPage === 1}
                  aria-label="หน้าก่อนหน้า"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="arrowLeft" />
                </button>
                {pageNumbers.map((page, index) => typeof page === 'number' ? (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    disabled={isFiltering}
                    aria-current={currentPage === page ? 'page' : undefined}
                    aria-label={`หน้า ${page}`}
                    className={`min-w-10 h-10 px-2 rounded-full border text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'border-purple-700 bg-purple-700 text-white'
                        : 'border-transparent bg-white text-slate-700 hover:border-purple-300 hover:text-purple-700'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={`${page}-${index}`} className="px-1 text-slate-400" aria-hidden="true">…</span>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(pagination.totalPages, page + 1))}
                  disabled={isFiltering || currentPage === pagination.totalPages}
                  aria-label="หน้าถัดไป"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="arrowRight" />
                </button>
              </nav>
            )}
          </div>
          </>
        )}
        </div>

        <aside className="order-first xl:order-last xl:col-span-3 xl:sticky xl:top-24">
          <div className="rounded-3xl border border-purple-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Icon name="cart" className="text-purple-700" />
                รายการที่เลือก
              </h2>
              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                {cartItemCount} ชิ้น
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-600">ยังไม่มีสินค้าในรายการ</p>
                <p className="mt-1 text-xs text-slate-400">กดไอคอนรถเข็นบนสินค้าเพื่อเพิ่ม</p>
              </div>
            ) : (
              <>
                <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const itemId = item.id || item._id
                    return (
                      <div key={itemId} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-purple-100 bg-white p-1">
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full"
                              imageClassName="h-full w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-bold leading-relaxed text-slate-800">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs font-extrabold text-purple-700">
                              ฿{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(itemId)}
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            aria-label={`ลบ ${item.name} ออกจากรายการ`}
                            title="ลบสินค้า"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">จำนวน</span>
                          <div className="inline-flex items-center overflow-hidden rounded-full border border-purple-200 bg-white">
                            <button
                              type="button"
                              onClick={() => updateCartQty(itemId, (item.quantity || 1) - 1)}
                              className="h-7 w-8 font-bold text-slate-600 hover:bg-purple-50"
                              aria-label={`ลดจำนวน ${item.name}`}
                            >
                              −
                            </button>
                            <span className="min-w-7 text-center text-xs font-bold text-slate-800">
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(itemId, (item.quantity || 1) + 1)}
                              className="h-7 w-8 font-bold text-slate-600 hover:bg-purple-50"
                              aria-label={`เพิ่มจำนวน ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 border-t border-purple-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">ยอดรวมสินค้า</span>
                    <span className="text-base font-black text-purple-700">฿{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <Link
                    to="/checkout"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800"
                  >
                    ดำเนินการสั่งซื้อ
                    <Icon name="arrowRight" />
                  </Link>
                  <Link
                    to="/cart"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-purple-200 px-4 py-2.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-50"
                  >
                    ดูตะกร้าเต็มรูปแบบ
                  </Link>
                </div>
              </>
            )}
          </div>
        </aside>
        </div>
      </section>
    </div>
  )
}