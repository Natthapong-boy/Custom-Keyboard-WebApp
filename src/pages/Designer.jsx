import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import ThreeKeyboard from '../components/keyboard/ThreeKeyboard'
import SwitchSpecsModal from '../components/keyboard/SwitchSpecsModal'
import { playSwitchSound, stopSwitchSound } from '../utils/switchAudio'
import key1 from '../assets/key1.jpg'

// 1. CASE MATERIALS & COLORS (Dependent State: Aluminum, Polycarbonate, ABS, Wood)
const caseMaterials = [
  {
    id: 'aluminum',
    name: 'Aluminum',
    label: 'Aluminum',
    desc: 'อลูมิเนียม - เสียงแน่น พรีเมียม',
    icon: '🪨',
    price: 0,
    colors: [
      { id: 'al-black', name: 'Black (ดำ)', hex: '#111827', edge: '#374151' },
      { id: 'al-silver', name: 'Silver (เงิน)', hex: '#94a3b8', edge: '#cbd5e1' },
      { id: 'al-navy', name: 'Navy (กรมท่า)', hex: '#0f2b5c', edge: '#38bdf8' },
      { id: 'al-maroon', name: 'Maroon (แดงเข้ม)', hex: '#581c27', edge: '#f43f5e' }
    ]
  },
  {
    id: 'polycarbonate',
    name: 'Polycarbonate',
    label: 'Polycarbonate (PC)',
    desc: 'PC - โปร่งแสง เสียงทุ้ม',
    icon: '💎',
    price: 0,
    colors: [
      { id: 'pc-frosted', name: 'Frosted White (ขาวขุ่น)', hex: '#e2e8f0', edge: '#cbd5e1' },
      { id: 'pc-clear', name: 'Clear (ใส)', hex: '#f8fafc', edge: '#94a3b8' },
      { id: 'pc-purple', name: 'Translucent Purple (ม่วงใส)', hex: '#7c3aed', edge: '#a855f7' }
    ]
  },
  {
    id: 'abs',
    name: 'ABS Plastic',
    label: 'ABS Plastic',
    desc: 'พลาสติก - น้ำหนักเบา คลาสสิก',
    icon: '🧊',
    price: 0,
    colors: [
      { id: 'abs-beige', name: 'Retro Beige (เบจคลาสสิก)', hex: '#d4c5a9', edge: '#e6dbb9' },
      { id: 'abs-white', name: 'Matte White (ขาวด้าน)', hex: '#ffffff', edge: '#e2e8f0' },
      { id: 'abs-black', name: 'Matte Black (ดำด้าน)', hex: '#18181b', edge: '#27272a' }
    ]
  },
  {
    id: 'wood',
    name: 'Wood',
    label: 'Wood',
    desc: 'ไม้ - ลายธรรมชาติ เสียงกังวาน',
    icon: '🪵',
    price: 0,
    colors: [
      { id: 'wd-walnut', name: 'Walnut (น้ำตาลเข้ม)', hex: '#3e2723', edge: '#5d4037' },
      { id: 'wd-rosewood', name: 'Rosewood (น้ำตาลแดง)', hex: '#5c241c', edge: '#7f3125' }
    ]
  }
]

// 2. SWITCHES (Layer 2: Mechanical Switches: Linear, Tactile, Clicky)
const switches = [
  // 1. กลุ่ม Linear (กดลื่น เสียงเบา)
  {
    id: 'red',
    name: 'Red Switch',
    type: 'Linear',
    subText: 'Linear • กดลื่น เสียงเบา',
    feel: 'กดลื่น เสียงเบา',
    color: '#ef4444', // สีแดง
    price: 0,
    force: '45g',
    operatingForce: '45 ± 15 gf',
    bottomOut: '60 gf',
    preTravel: '2.0mm',
    totalTravel: '4.0mm',
    sound: 'linear',
    soundTone: 'Smooth Linear (เสียงเบานุ่ม)',
    description: 'สวิตช์จังหวะเดียว สัมผัสลื่นมือ ไร้แรงต้าน เสียงเงียบนุ่มนวล ตอบสนองฉับไว',
    suitableFor: 'เล่นเกมแนว Fast-Paced / ทำงานในออฟฟิศ',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },
  {
    id: 'black',
    name: 'Black Switch',
    type: 'Linear',
    subText: 'Linear • กดลื่น เสียงเบา',
    feel: 'กดลื่น เสียงเบา',
    color: '#18181b', // สีดำ
    price: 0,
    force: '60g',
    operatingForce: '60 ± 15 gf',
    bottomOut: '75 gf',
    preTravel: '2.0mm',
    totalTravel: '4.0mm',
    sound: 'linear',
    soundTone: 'Deep Linear (ทุ้มแน่น หนักแน่น)',
    description: 'สวิตช์ Linear น้ำหนักกดแน่น มั่นคง ป้องกันการกดพลาด เหมาะสำหรับผู้ชอบสวิตช์หนัก',
    suitableFor: 'เกมเมอร์มือหนัก / ผู้ที่ต้องการความแม่นยำสูง',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },
  {
    id: 'yellow',
    name: 'Yellow Switch',
    type: 'Linear',
    subText: 'Linear • กดลื่น เสียงเบา',
    feel: 'กดลื่น เสียงเบา',
    color: '#eab308', // สีเหลือง
    price: 0,
    force: '50g',
    operatingForce: '50 ± 15 gf',
    bottomOut: '62 gf',
    preTravel: '2.0mm',
    totalTravel: '4.0mm',
    sound: 'thock',
    soundTone: 'Creamy Thock (ลื่นละมุน ทุ้มเบา)',
    description: 'สวิตช์น้ำหนักกดสมดุลกำลังดี ลื่นไหลสบายมือต่อเนื่อง ลดอาการเมื่อยล้า',
    suitableFor: 'พิมพ์งานต่อเนื่องตลอดวัน / ใช้งานทั่วไป',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },
  {
    id: 'silver',
    name: 'Silver Switch',
    type: 'Linear',
    subText: 'Linear • กดลื่น เสียงเบา',
    feel: 'กดลื่น เสียงเบา',
    color: '#94a3b8', // สีเงิน
    price: 0,
    force: '45g',
    operatingForce: '45 ± 15 gf',
    bottomOut: '55 gf',
    preTravel: '1.2mm',
    totalTravel: '3.4mm',
    sound: 'linear',
    soundTone: 'Speed Linear (ตอบสนองไว)',
    description: 'สวิตช์ Speed ระยะกดสั้น ทำงานฉับไวทันใจ สัมผัสลื่นไหลไม่มีสะดุด',
    suitableFor: 'E-Sports / การแข่งขันเกมที่ต้องการความเร็วสูงสุด',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },

  // 2. กลุ่ม Tactile (มีแรงต้านที่นิ้ว เสียงปานกลาง)
  {
    id: 'brown',
    name: 'Brown Switch',
    type: 'Tactile',
    subText: 'Tactile • มีแรงต้าน เสียงปานกลาง',
    feel: 'มีแรงต้าน เสียงปานกลาง',
    color: '#854d0e', // สีน้ำตาล
    price: 0,
    force: '55g',
    operatingForce: '55 ± 10 gf',
    bottomOut: '65 gf',
    preTravel: '2.0mm',
    totalTravel: '4.0mm',
    sound: 'soft',
    soundTone: 'Gentle Bump (เสียงปานกลาง นุ่มหู)',
    description: 'สวิตช์ 2 จังหวะยอดนิยม มีแรงต้านสะดุดนิ้วเบาๆ ยืนยันจังหวะพิมพ์ พิมพ์สนุก',
    suitableFor: 'พิมพ์งาน / เขียนบทความ / ใช้งานได้ทั้งทำงานและเล่นเกม',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },
  {
    id: 'clear',
    name: 'Clear Switch',
    type: 'Tactile',
    subText: 'Tactile • มีแรงต้าน เสียงปานกลาง',
    feel: 'มีแรงต้าน เสียงปานกลาง',
    color: '#f1f5f9', // สีใส (เทาอ่อน/ขาวโปร่ง)
    price: 0,
    force: '65g',
    operatingForce: '65 ± 15 gf',
    bottomOut: '80 gf',
    preTravel: '2.0mm',
    totalTravel: '4.0mm',
    sound: 'soft',
    soundTone: 'Pronounced Bump (แรงต้านแน่นชัด)',
    description: 'สวิตช์ Tactile สัมผัสใส พร้อมแรงต้านสะดุดนิ้วชัดเจน เด้งสู้มือนิ้วไม่ล้า',
    suitableFor: 'โปรแกรมเมอร์ / สายพิมพ์สัมผัสที่ชอบแรงสะท้อนชัดเจน',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },

  // 3. กลุ่ม Clicky (มีเสียงคลิกดังชัดเจน)
  {
    id: 'blue',
    name: 'Blue Switch',
    type: 'Clicky',
    subText: 'Clicky • เสียงคลิกดังชัดเจน',
    feel: 'เสียงคลิกดังชัดเจน',
    color: '#0284c7', // สีฟ้า
    price: 0,
    force: '60g',
    operatingForce: '60 ± 15 gf',
    bottomOut: '65 gf',
    preTravel: '2.2mm',
    totalTravel: '4.0mm',
    sound: 'click',
    soundTone: 'Crisp Click (คลิกใส คมชัด)',
    description: 'สวิตช์ Clicky แท้ มีเสียงคลิกแหลมใส ชัดเจนทุกจังหวะ สไตล์คลาสสิกพิมพ์ดีด',
    suitableFor: 'ผู้ชื่นชอบเสียงพิมพ์สะใจ / พิมพ์สัมผัสในห้องส่วนตัว',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  },
  {
    id: 'green',
    name: 'Green Switch',
    type: 'Clicky',
    subText: 'Clicky • เสียงคลิกดังชัดเจน',
    feel: 'เสียงคลิกดังชัดเจน',
    color: '#16a34a', // สีเขียว
    price: 0,
    force: '70g',
    operatingForce: '70 ± 15 gf',
    bottomOut: '80 gf',
    preTravel: '2.2mm',
    totalTravel: '4.0mm',
    sound: 'click',
    soundTone: 'Heavy Loud Click (คลิกแน่น หนักแน่น)',
    description: 'สวิตช์ Clicky แรงต้านสูง เสียงคลิกดังสะใจ หนักแน่นทุกจังหวะสัมผัส',
    suitableFor: 'ผู้ที่ชอบสวิตช์น้ำหนักกดสูงและเสียงคลิกสะใจเป็นพิเศษ',
    lubed: false,
    lifespan: '50 ล้านครั้ง',
    audioUrl: ''
  }
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

  // Customization States (with Dependent Case Material & Color)
  const [caseMaterialId, setCaseMaterialId] = useState('aluminum')
  const [caseColorId, setCaseColorId] = useState('al-black')
  const [switchId, setSwitchId] = useState('red')
  const [plateId, setPlateId] = useState('fr4')
  const [keycapId, setKeycapId] = useState('Lilac')
  const [layout, setLayout] = useState('75%')

  // 3D Assembly & Viewport States
  const [isExploded, setIsExploded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotationPreset, setRotationPreset] = useState('isometric')
  const [zoom, setZoom] = useState(1.0)
  const [toast, setToast] = useState(null)

  // Switch Sound & Specs Modal States
  const [playingSwitchId, setPlayingSwitchId] = useState(null)
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)

  // Clean up audio playback on component unmount
  useEffect(() => {
    return () => {
      stopSwitchSound()
    }
  }, [])

  const handleToggleSound = (sw) => {
    if (playingSwitchId === sw.id) {
      stopSwitchSound()
      setPlayingSwitchId(null)
    } else {
      playSwitchSound(sw, (state) => {
        setPlayingSwitchId(state.isPlaying ? state.switchId : null)
      })
    }
  }

  // When user changes material in Part 1, reset color to the first color of the new material
  const handleMaterialChange = (newMaterialId) => {
    setCaseMaterialId(newMaterialId)
    const newMat = caseMaterials.find(m => m.id === newMaterialId)
    if (newMat && newMat.colors.length > 0) {
      setCaseColorId(newMat.colors[0].id)
    }
  }

  const selectedMaterial = caseMaterials.find(m => m.id === caseMaterialId) || caseMaterials[0]
  const availableColors = selectedMaterial.colors
  const selectedColor = availableColors.find(c => c.id === caseColorId) || availableColors[0]

  const selectedCase = {
    id: `${selectedMaterial.id}-${selectedColor.id}`,
    material: selectedMaterial.id,
    materialName: selectedMaterial.name,
    colorName: selectedColor.name,
    name: `${selectedMaterial.name} Case - ${selectedColor.name}`,
    color: selectedColor.hex,
    edge: selectedColor.edge,
    price: selectedMaterial.price || 0
  }
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
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
            isFullscreen ? 'fixed inset-0 z-50 rounded-none p-3 sm:p-8 bg-slate-950 text-white' : 'min-h-[420px] sm:min-h-[520px] p-3 sm:p-6'
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
          <div className="bg-white rounded-3xl border border-purple-100 p-4 sm:p-7 shadow-sm space-y-6">
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

            {/* 2. เคสคีย์บอร์ด (CASE MATERIAL & COLOR) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. เคสคีย์บอร์ด (CASE MATERIAL & COLOR)
                </label>
                <span className="text-xs text-purple-700 font-semibold">
                  {selectedMaterial.name} • {selectedColor.name}
                </span>
              </div>

              {/* ส่วนที่ 1: เลือกประเภทวัสดุเคส (Case Material) */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  ประเภทวัสดุ (Material):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {caseMaterials.map((mat) => {
                    const isSelected = caseMaterialId === mat.id
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => handleMaterialChange(mat.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold shadow-xs ring-1 ring-purple-200'
                            : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span>{mat.icon}</span>
                            <span>{mat.label}</span>
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal leading-tight">
                          {mat.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ส่วนที่ 2: เลือกสีเคส (Case Color - Color Swatches) */}
              <div className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🎨 เฉดสีของ {selectedMaterial.name}:</span>
                  </span>
                  {/* Selected Color Name Badge */}
                  <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                    {selectedColor.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 items-center pt-1">
                  {availableColors.map((col) => {
                    const isSelected = caseColorId === col.id
                    const isLightColor =
                      col.hex === '#ffffff' ||
                      col.hex === '#f8fafc' ||
                      col.hex === '#f1f5f9' ||
                      col.hex === '#e2e8f0' ||
                      col.hex === '#d4c5a9' ||
                      col.hex === '#94a3b8'

                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setCaseColorId(col.id)}
                        className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center relative shadow-xs hover:scale-110 ${
                          isSelected
                            ? 'border-purple-600 ring-4 ring-purple-200 scale-110 shadow-md'
                            : 'border-slate-300 hover:border-purple-300'
                        }`}
                        style={{
                          backgroundColor: col.hex,
                          boxShadow: isLightColor ? 'inset 0 0 0 1.5px rgba(0,0,0,0.12)' : undefined
                        }}
                        title={`${col.name}`}
                      >
                        {isSelected && (
                          <span
                            className={`text-xs font-bold ${
                              isLightColor ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 3. Switch Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. สวิตช์ (Switches)
                  </label>
                  {/* Button: Switch Guide & Sound Test Modal */}
                  <button
                    type="button"
                    onClick={() => setIsSwitchModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all border border-purple-200/70 shadow-2xs group"
                    title="เปิดคู่มือเปรียบเทียบและฟังเสียงสวิตช์เชิงลึก (Keychron Style)"
                  >
                    <span className="group-hover:scale-110 transition-transform">🔊</span>
                    <span>คู่มือเปรียบเทียบและฟังเสียง</span>
                  </button>
                </div>
                <span className="text-xs text-purple-700 font-semibold">{selectedSwitch.name}</span>
              </div>

              <div className="space-y-2">
                {switches.map((s) => {
                  const isPlaying = playingSwitchId === s.id
                  const isSelected = switchId === s.id

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSwitchId(s.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs'
                          : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Color Dot Indicator */}
                        <span
                          className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${
                            s.id === 'clear' ? 'border-2 border-slate-300 ring-1 ring-slate-200' : 'border border-black/15'
                          }`}
                          style={{ backgroundColor: s.color }}
                          title={`${s.name} (${s.type})`}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold ${isSelected ? 'text-purple-950 font-bold' : ''}`}>
                              {s.name}
                            </span>

                            {/* Sound Preview Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleSound(s)
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                isPlaying
                                  ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                                  : 'bg-purple-100/90 text-purple-700 hover:bg-purple-200'
                              }`}
                              title={isPlaying ? 'คลิกเพื่อหยุดเสียง' : 'คลิกเพื่อทดลองฟังเสียงพิมพ์'}
                            >
                              {isPlaying ? (
                                <>
                                  <span className="text-[10px] animate-pulse">⏸️</span>
                                  <span>หยุดฟัง</span>
                                  {/* Wave equalizer animation */}
                                  <span className="flex items-end gap-0.5 h-2.5 ml-0.5">
                                    <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                                    <span className="w-0.5 bg-white rounded-full animate-bounce h-2.5" style={{ animationDelay: '150ms' }} />
                                    <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>🔊</span>
                                  <span>ฟังเสียง</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            {s.subText}
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-purple-700 shrink-0 ml-2">
                        {s.price > 0 ? `+฿${s.price}` : 'ฟรี'}
                      </div>
                    </div>
                  )
                })}
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

      {/* Switch Comparison & Sound Test Modal (Keychron Style) */}
      <SwitchSpecsModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        switches={switches}
        selectedSwitchId={switchId}
        onSelectSwitch={(id) => {
          setSwitchId(id)
          const sw = switches.find(s => s.id === id)
          if (sw) {
            setToast(`เลือกสวิตช์: ${sw.name} เรียบร้อยแล้ว`)
            setTimeout(() => setToast(null), 3000)
          }
        }}
        playingSwitchId={playingSwitchId}
        setPlayingSwitchId={setPlayingSwitchId}
      />
    </div>
  )
}
