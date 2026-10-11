import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import ThreeKeyboard from '../components/keyboard/ThreeKeyboard'
import key1 from '../assets/key1.jpg'

// 1. CASES (Layer 5: CNC Aluminum Chassis)
const cases = [
  { id: 'purple', name: 'Midnight Purple Anodized', color: '#2c123d', edge: '#a855f7', price: 0 },
  { id: 'blue', name: 'Deep Space Navy', color: '#0d213f', edge: '#38bdf8', price: 0 },
  { id: 'red', name: 'Crimson Ruby CNC', color: '#4a121e', edge: '#f43f5e', price: 150 },
  { id: 'brown', name: 'Mocha Walnut Finish', color: '#382215', edge: '#fb923c', price: 250 },
  { id: 'grey', name: 'Titanium Silver Matte', color: '#1a1c24', edge: '#94a3b8', price: 200 }
]

// 2. SWITCHES (Layer 2: Mechanical Switches)
const switches = [
  { id: 'blue', name: 'Gateron Blue Clicky', feel: 'Clicky / Crisp bump', force: '60g', sound: 'click', color: '#38bdf8', price: 0 },
  { id: 'red', name: 'Cherry MX Red Linear', feel: 'Smooth Linear', force: '45g', sound: 'linear', color: '#f43f5e', price: 0 },
  { id: 'brown', name: 'Holy Panda Tactile', feel: 'Soft Tactile Bump', force: '55g', sound: 'soft', color: '#fb923c', price: 250 },
  { id: 'yellow', name: 'Milky Yellow Pro (Lubed)', feel: 'Deep Thock Linear', force: '50g', sound: 'linear', color: '#eab308', price: 350 }
]

// 3. PLATES (Layer 3: Switch Mounting Plate)
const plates = [
  { id: 'fr4', name: 'FR4 Matte Black', color: '#0f172a', desc: 'ยืดหยุ่น เสียง Thock นุ่มนวล', price: 0 },
  { id: 'brass', name: 'Polished Brass', color: '#eab308', desc: 'น้ำหนักแน่น เสียง Clack กังวานหรูหรา', price: 450 },
  { id: 'carbon', name: 'Carbon Fiber', color: '#1e293b', desc: 'แน่นหนา แข็งแรง น้ำหนักเบา', price: 350 },
  { id: 'aluminum', name: 'CNC Aluminum', color: '#64748b', desc: 'คลาสสิก ตอบสนองฉับไว', price: 200 }
]

// 4. KEYCAPS (Layer 1: Keycaps)
const keycaps = [
  { id: 'Lilac', name: 'Lilac Dream (ม่วงพาสเทล)', topColor: '#583670', botColor: '#1a0e22', price: 0 },
  { id: 'Carbon', name: 'Carbon Matrix (เทาดำ)', topColor: '#2b3544', botColor: '#0f172a', price: 300 },
  { id: 'Cream', name: 'Retro Cream (ครีมคลาสสิก)', topColor: '#baa77e', botColor: '#352e1f', price: 0 },
  { id: 'Cyber', name: 'Cyberpunk Neon (นีออน)', topColor: '#0284c7', botColor: '#170c28', price: 450 }
]

export default function Designer() {
  const { addToCart } = useShop()
  const navigate = useNavigate()

  // Customization States
  const [caseId, setCaseId] = useState('purple')
  const [switchId, setSwitchId] = useState('yellow')
  const [plateId, setPlateId] = useState('fr4')
  const [keycapId, setKeycapId] = useState('Lilac')
  const [layout, setLayout] = useState('75%')

  // 3D Assembly & Viewport States
  const [isExploded, setIsExploded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotationPreset, setRotationPreset] = useState('isometric')
  const [zoom, setZoom] = useState(1.0)
  const [toast, setToast] = useState(null)

  const selectedCase = cases.find(c => c.id === caseId) || cases[0]
  const selectedSwitch = switches.find(s => s.id === switchId) || switches[0]
  const selectedPlate = plates.find(p => p.id === plateId) || plates[0]
  const selectedKeycap = keycaps.find(k => k.id === keycapId) || keycaps[0]

  // Dynamic Base Price in THB (บาท)
  const basePrice = layout === '60%' ? 1890 : layout === '65%' ? 2490 : layout === 'TKL' ? 3490 : layout === '100%' ? 3990 : 2990
  const totalPrice = basePrice + selectedCase.price + selectedSwitch.price + selectedPlate.price + selectedKeycap.price

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const triggerCameraPreset = (preset) => {
    setRotationPreset(preset)
    if (preset === 'exploded') {
      setIsExploded(true)
    }
  }

  const buildCustomItem = () => ({
    id: `custom-${Date.now()}`,
    name: `Custom Keyboard ${layout} (${selectedCase.name})`,
    orderType: 'custom', // Mark as custom assembly for Diagram 1 & 3 flow
    type: 'Custom Build',
    layout,
    specs: `${layout} • ${selectedCase.name} • ${selectedSwitch.name} • Plate: ${selectedPlate.name} • Keycaps: ${selectedKeycap.name}`,
    caseColor: selectedCase.name,
    caseColorHex: selectedCase.color,
    caseEdgeHex: selectedCase.edge,
    switchType: selectedSwitch.name,
    switchPlate: selectedPlate.name,
    keycaps: selectedKeycap.name,
    price: totalPrice,
    quantity: 1,
    image: key1
  })

  const handleAddToCart = () => {
    const item = buildCustomItem()
    addToCart(item)
    setToast(`เพิ่มคีย์บอร์ดประกอบเอง (${layout}) ลงในตะกร้าแล้ว`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveAndCheckout = () => {
    const item = buildCustomItem()
    addToCart(item)
    navigate('/checkout')
  }

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400">✓</span>
          <span>{toast}</span>
          <Link to="/cart" className="ml-2 text-purple-300 underline font-semibold">ดูตะกร้า</Link>
        </div>
      )}

      {/* Intro Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
          <span>🛠️ โหมดออกแบบประกอบเอง (Custom Keyboard Builder)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          จำลองและประกอบคีย์บอร์ดทีละชิ้นส่วน
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          เลือกขนาด Layout, สีเคสอลูมิเนียม CNC, เพลตซับเสียง, สวิตช์ และเซ็ตคีย์แคป ระบบจะคำนวณราคาจริงและจำลองภาพ 3D ทันที
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 3D Interactive Canvas Mount */}
        <section
          className={`lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-6 shadow-sm flex flex-col ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none p-8 bg-slate-950 text-white' : 'min-h-[520px]'
          }`}
          onWheel={(e) => {
            e.preventDefault()
            setZoom(prev => Math.min(1.8, Math.max(0.65, prev - e.deltaY * 0.0012)))
          }}
        >
          {/* Topline HUD Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-purple-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">Three.js 3D Interactive Preview</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(คลิกลากหมุน 360° / สกรอลล์ซูม)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsExploded(!isExploded)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isExploded
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {isExploded ? 'ประกอบชิ้นส่วน' : '💥 แยกชิ้นส่วน 3D'}
              </button>

              <button
                type="button"
                onClick={() => triggerCameraPreset('isometric')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rotationPreset === 'isometric' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                มุมเฉียง
              </button>
              <button
                type="button"
                onClick={() => triggerCameraPreset('top')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rotationPreset === 'top' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                มุมบน
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                {isFullscreen ? '✕ ย่อ' : '⛶ ขยาย'}
              </button>
            </div>
          </div>

          {/* Canvas Mount */}
          <div className="relative w-full flex-1 min-h-[380px] rounded-2xl overflow-hidden bg-slate-900/5 flex items-center justify-center">
            <ThreeKeyboard
              caseConfig={selectedCase}
              switchConfig={selectedSwitch}
              plateConfig={selectedPlate}
              keycapConfig={selectedKeycap}
              layout={layout}
              isExploded={isExploded}
              rotationPreset={rotationPreset}
              zoom={zoom}
            />

            {/* Exploded Layers Info */}
            {isExploded && (
              <div className="absolute top-4 left-4 z-10 space-y-1.5 pointer-events-none text-[11px] font-medium">
                <div className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-900 px-3 py-1 rounded-xl shadow-sm">
                  1. คีย์แคป: <strong>{selectedKeycap.name}</strong>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-900 px-3 py-1 rounded-xl shadow-sm">
                  2. สวิตช์: <strong>{selectedSwitch.name}</strong>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-900 px-3 py-1 rounded-xl shadow-sm">
                  3. เพลต: <strong>{selectedPlate.name}</strong>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-900 px-3 py-1 rounded-xl shadow-sm">
                  4. Hot-Swap PCB + RGB Backlit
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-900 px-3 py-1 rounded-xl shadow-sm">
                  5. ตัวเรือนเคส: <strong>{selectedCase.name}</strong>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Customization Controls & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-7 shadow-sm space-y-6">
            {/* 1. Layout Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                1. ขนาด Layout
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '60%', label: '60%' },
                  { id: '65%', label: '65%' },
                  { id: '75%', label: '75%' },
                  { id: 'TKL', label: 'TKL' }
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLayout(l.id)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      layout === l.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CNC Case Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. สีตัวเรือน CNC Case
                </label>
                <span className="text-xs text-purple-700 font-semibold">{selectedCase.name}</span>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCaseId(c.id)}
                    className={`h-11 rounded-xl border-2 transition-all flex items-center justify-center relative ${
                      caseId === c.id ? 'border-purple-600 ring-2 ring-purple-200 scale-105' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={`${c.name} (${c.price > 0 ? `+฿${c.price}` : 'รวมในชุด'})`}
                  >
                    {caseId === c.id && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Switch Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. สวิตช์ (Switches)
                </label>
                <span className="text-xs text-purple-700 font-semibold">{selectedSwitch.name}</span>
              </div>
              <div className="space-y-2">
                {switches.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSwitchId(s.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs ${
                      switchId === s.id
                        ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold'
                        : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{s.feel} • แรงกด {s.force}</div>
                    </div>
                    <div className="font-bold text-purple-700">
                      {s.price > 0 ? `+฿${s.price}` : 'ฟรี'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Plate Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  4. เพลตซับเสียง (Plate Material)
                </label>
                <span className="text-xs text-purple-700 font-semibold">{selectedPlate.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {plates.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlateId(p.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      plateId === p.id
                        ? 'border-purple-600 bg-purple-50 font-bold text-purple-900'
                        : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40'
                    }`}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.price > 0 ? `+฿${p.price}` : 'รวมในชุด'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Keycaps Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  5. คีย์แคป PBT
                </label>
                <span className="text-xs text-purple-700 font-semibold">{selectedKeycap.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {keycaps.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKeycapId(k.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      keycapId === k.id
                        ? 'border-purple-600 bg-purple-50 font-bold text-purple-900'
                        : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40'
                    }`}
                  >
                    <div className="font-semibold">{k.name}</div>
                    <div className="text-[10px] text-slate-500">{k.price > 0 ? `+฿${k.price}` : 'รวมในชุด'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary & Checkout Button */}
            <div className="pt-4 border-t border-purple-100 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">ราคารวมทั้งชุด</span>
                  <div className="text-3xl font-black text-purple-700">
                    ฿{totalPrice.toLocaleString()}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  แบบประกอบเอง
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveAndCheckout}
                  className="flex-1 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all"
                >
                  บันทึกและสั่งซื้อทันที →
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-5 py-3.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 font-bold text-sm transition-all"
                  title="เพิ่มลงในตะกร้า"
                >
                  🛒 +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
