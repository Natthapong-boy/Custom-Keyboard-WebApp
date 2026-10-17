import Icon from '../components/common/Icon'
import ProductImage from '../components/common/ProductImage'
import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { fetchProductById } from '../services/api'
import SwitchSpecsModal from '../components/keyboard/SwitchSpecsModal'
import KeycapGuideModal from '../components/keyboard/KeycapGuideModal'
import PlateGuideModal from '../components/keyboard/PlateGuideModal'
import { playSwitchSound, stopSwitchSound } from '../utils/switchAudio'
import key1 from '../assets/key1.jpg'
import { getKeyboardLayout } from '../config/layout75'
import { useKeyboardConfig } from '../store/keyboardConfig'

const KeyboardViewer = lazy(() => import('../components/KeyboardViewer/Scene'))

// Default Fallback Keyboards (เมื่อเข้า /designer โดยตรงหรือยังไม่ได้เชื่อมต่อฐานข้อมูล)
const defaultBaseKeyboards = [
  {
    _id: 'default-akko-mod007',
    id: 'default-akko-mod007',
    name: 'AKKO MOD007B PC Tokyo 8K Hz',
    category: 'Keyboards',
    price: 3890,
    layout: '75%',
    caseMaterial: 'Polycarbonate (PC) + Multi-layer Silicone',
    mountType: 'Gasket Mount',
    switchType: 'Akko Piano Pro (Linear)',
    connectivity: ['Type-C Wired', 'Bluetooth 5.0', '2.4GHz Wireless'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'คีย์บอร์ดโครงสร้าง PC พร้อมไฟ RGB ใส Polling Rate 8,000Hz สัมผัสพิมพ์แน่นนุ่ม'
  },
  {
    _id: 'default-keychron-q1',
    id: 'default-keychron-q1',
    name: 'Keychron Q1 Pro Wireless Custom',
    category: 'Keyboards',
    price: 6990,
    layout: '75%',
    caseMaterial: '6063 Full CNC Aluminum Body',
    mountType: 'Double Gasket Mount',
    switchType: 'Keychron K Pro Red',
    connectivity: ['Type-C Wired', 'Bluetooth 5.1'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'คีย์บอร์ดอลูมิเนียม CNC พรีเมียมเต็มตัว รองรับ QMK/VIA สัมผัสแน่นสไตล์สตูดิโอ'
  },
  {
    _id: 'default-keychron-q3',
    id: 'default-keychron-q3',
    name: 'Keychron Q3 Max TKL Hot-Swap',
    category: 'Keyboards',
    price: 7290,
    layout: 'TKL (80%)',
    caseMaterial: 'Full CNC Aluminum Body',
    mountType: 'Acoustic Foam Gasket Mount',
    switchType: 'Gateron Jupiter Brown',
    connectivity: ['Type-C Wired', 'Bluetooth 5.1', '2.4GHz Wireless'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'ขนาด Tenkeyless 80% ปรับแต่งเสียงโฟมซับเสียง 5 ชั้น เสียง Thock นุ่มนวล'
  },
  {
    _id: 'default-monsgeek-m1w',
    id: 'default-monsgeek-m1w',
    name: 'MonsGeek M1W V3 SP Tri-Mode',
    category: 'Keyboards',
    price: 3490,
    layout: '75%',
    caseMaterial: 'CNC Anodized Aluminum',
    mountType: 'Gasket Mount',
    switchType: 'V3 Piano Switch',
    connectivity: ['Type-C Wired', 'Bluetooth 5.0', '2.4GHz Wireless'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'อลูมิเนียมราคาคุ้มค่า มีปุ่ม Knob ปรับเสียง รองรับการปรับแต่งสวิตช์อย่างอิสระ'
  },
  {
    _id: 'default-nuphy-halo65',
    id: 'default-nuphy-halo65',
    name: 'NuPhy Halo65 Wireless Keyboard',
    category: 'Keyboards',
    price: 4190,
    layout: '65%',
    caseMaterial: 'Aluminum Frame + ABS Base',
    mountType: 'Silicone Gasket Mount',
    switchType: 'Baby Kangaroo (Tactile)',
    connectivity: ['Type-C Wired', 'Bluetooth 5.0', '2.4GHz Wireless'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'ขนาด 65% กระทัดรัด ไฟ Halo Light รอบตัว ดีไซน์มินิมอลพกพาสะดวก'
  },
  {
    _id: 'default-keychron-v6',
    id: 'default-keychron-v6',
    name: 'Keychron V6 Full Size (100%)',
    category: 'Keyboards',
    price: 3990,
    layout: 'Full Size (100%)',
    caseMaterial: 'Frosted Translucent ABS Body',
    mountType: 'Tray Mount with Sound Dampening Foam',
    switchType: 'Keychron K Pro Red',
    connectivity: ['Type-C Wired'],
    hotSwappable: true,
    rgbBacklit: true,
    image: key1,
    description: 'ขนาด 100% ครบทุกปุ่มพร้อม Numpad เหมาะสำหรับสายงานบัญชีและทำงานเต็มรูปแบบ'
  }
]

// 1. CASE MATERIALS & COLORS (Dependent State: Aluminum, Polycarbonate, ABS, Wood)
const caseMaterials = [
  {
    id: 'aluminum',
    name: 'Aluminum',
    label: 'Aluminum',
    desc: 'อลูมิเนียม - เสียงแน่น พรีเมียม',
    icon: 'layers',
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
    icon: 'gem',
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
    icon: 'box',
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
    icon: 'tree',
    price: 0,
    colors: [
      { id: 'wd-walnut', name: 'Walnut (น้ำตาลเข้ม)', hex: '#3e2723', edge: '#5d4037' },
      { id: 'wd-rosewood', name: 'Rosewood (น้ำตาลแดง)', hex: '#5c241c', edge: '#7f3125' }
    ]
  }
]

// 2. DEFAULT FALLBACK SWITCHES (Mechanical Switches: Linear, Tactile, Clicky)
const defaultSwitches = [
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
    price: 150,
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
    price: 250,
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
  // 2. กลุ่ม Tactile (มีแรงต้านที่นิ้ว เสียงปานกลาง)
  {
    id: 'brown',
    name: 'Brown Switch',
    type: 'Tactile',
    subText: 'Tactile • มีแรงต้าน เสียงปานกลาง',
    feel: 'มีแรงต้าน เสียงปานกลาง',
    color: '#854d0e', // สีน้ำตาล
    price: 150,
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
    price: 250,
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
  { id: 'fr4', name: 'FR4 Matte Black', color: '#0f172a', price: 200 },
  { id: 'brass', name: 'Polished Brass', color: '#eab308', price: 450 },
  { id: 'carbon', name: 'Carbon Fiber', color: '#1e293b', price: 350 },
  { id: 'aluminum', name: 'CNC Aluminum', color: '#64748b', price: 200 },
  { id: 'pc', name: 'Polycarbonate (PC)', color: '#f1f5f9', price: 250 },
  { id: 'pom', name: 'POM Plate', color: '#e2e8f0', price: 300 },
  { id: 'copper', name: 'Copper (ทองแดง)', color: '#b87333', price: 600 },
  { id: 'steel', name: 'Stainless Steel', color: '#94a3b8', price: 350 }
]

// 4. DEFAULT KEYCAPS (Layer 1: Keycaps)
const defaultKeycaps = [
  { id: 'Lilac', name: 'Lilac Dream (ม่วงพาสเทล)', topColor: '#583670', botColor: '#1a0e22', price: 200, image: '/images/key1.jpg' },
  { id: 'Carbon', name: 'Carbon Matrix (เทาดำ)', topColor: '#2b3544', botColor: '#0f172a', price: 300, image: '/images/key1.jpg' },
  { id: 'Cream', name: 'Retro Cream (ครีมคลาสสิก)', topColor: '#baa77e', botColor: '#352e1f', price: 200, image: '/images/key1.jpg' },
  { id: 'Cyber', name: 'Cyberpunk Neon (นีออน)', topColor: '#0284c7', botColor: '#170c28', price: 450, image: '/images/key1.jpg' },
  { id: 'KuroShiro', name: 'Kuro/Shiro (ขาวฟอนต์ญี่ปุ่น)', topColor: '#f8fafc', botColor: '#0f172a', price: 350, image: '/images/key1.jpg' },
  { id: 'PuddingBlack', name: 'Pudding Black (พุดดิ้งดำ)', topColor: '#18181b', botColor: '#e2e8f0', price: 200, image: '/images/key1.jpg' },
  { id: 'SidePrintedGradient', name: 'Side-Printed Gradient (ไล่สีเทา)', topColor: '#475569', botColor: '#1e293b', price: 400, image: '/images/key1.jpg' },
  { id: 'VintageSA', name: 'Vintage SA (เครื่องพิมพ์ดีดคลาสสิก)', topColor: '#d4c5b9', botColor: '#3e3228', price: 550, image: '/images/key1.jpg' }
]

// Helper to transform MongoDB switch product into Designer switch format
const formatDbSwitch = (p) => {
  const switchTypeStr = p.switchType || ''
  
  // Determine Type: Linear, Tactile, Clicky
  let type = 'Linear'
  if (switchTypeStr.toLowerCase().includes('tactile')) type = 'Tactile'
  else if (switchTypeStr.toLowerCase().includes('clicky')) type = 'Clicky'
  else if (switchTypeStr.toLowerCase().includes('linear')) type = 'Linear'
  else if (p.name?.toLowerCase().includes('tactile') || p.name?.toLowerCase().includes('brown')) type = 'Tactile'
  else if (p.name?.toLowerCase().includes('clicky') || p.name?.toLowerCase().includes('blue') || p.name?.toLowerCase().includes('green')) type = 'Clicky'

  // Determine Color
  let color = '#ef4444' // fallback red
  const combined = `${p.name || ''} ${switchTypeStr}`.toLowerCase()
  if (combined.includes('red') || combined.includes('แดง')) color = '#ef4444'
  else if (combined.includes('black') || combined.includes('ดำ')) color = '#18181b'
  else if (combined.includes('yellow') || combined.includes('เหลือง')) color = '#eab308'
  else if (combined.includes('brown') || combined.includes('น้ำตาล')) color = '#854d0e'
  else if (combined.includes('blue') || combined.includes('น้ำเงิน') || combined.includes('ฟ้า')) color = '#0284c7'
  else if (combined.includes('green') || combined.includes('เขียว')) color = '#16a34a'
  else if (combined.includes('white') || combined.includes('ขาว')) color = '#f8fafc'
  else if (combined.includes('silver') || combined.includes('เงิน')) color = '#94a3b8'
  else if (combined.includes('pink') || combined.includes('ชมพู')) color = '#ec4899'
  else if (combined.includes('orange') || combined.includes('ส้ม')) color = '#f97316'
  else if (combined.includes('purple') || combined.includes('ม่วง')) color = '#7c3aed'

  // Determine Sound profile for Web Audio API synthesis
  let sound = p.switchSound
  if (!sound) {
    if (type === 'Clicky') sound = 'click'
    else if (type === 'Tactile') sound = 'soft'
    else if (combined.includes('yellow') || combined.includes('cream') || combined.includes('oil')) sound = 'thock'
    else sound = 'linear'
  }

  const soundTone = p.switchSoundTone || (
    type === 'Clicky' ? 'Crisp Click (คลิกใส คมชัด)' :
    type === 'Tactile' ? 'Gentle Bump (เสียงปานกลาง นุ่มหู)' :
    sound === 'thock' ? 'Creamy Thock (ลื่นละมุน ทุ้มเบา)' :
    'Smooth Linear (เสียงเบานุ่ม)'
  )

  const feel = p.switchFeel || (
    type === 'Clicky' ? 'เสียงคลิกดังชัดเจน' :
    type === 'Tactile' ? 'มีแรงต้าน เสียงปานกลาง' :
    'กดลื่น เสียงเบา'
  )

  const subText = `${type} • ${feel}`

  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.name,
    type,
    subText,
    feel,
    color,
    price: Number(p.price) || 0,
    force: p.switchOperatingForce || (type === 'Clicky' ? '60g' : type === 'Tactile' ? '55g' : '45g'),
    operatingForce: p.switchOperatingForce || (type === 'Clicky' ? '60 ± 15 gf' : type === 'Tactile' ? '55 ± 10 gf' : '45 ± 15 gf'),
    bottomOut: p.switchBottomOut || '60 gf',
    preTravel: p.switchPreTravel || (type === 'Clicky' ? '2.2mm' : '2.0mm'),
    totalTravel: p.switchTotalTravel || '4.0mm',
    sound,
    soundTone,
    description: p.description || `${p.name} - สวิตช์ ${type} คุณภาพสูง ตอบสนองแม่นยำ ทนทาน`,
    suitableFor: p.suitableFor || (type === 'Linear' ? 'เล่นเกมแนว Fast-Paced / ทำงานในออฟฟิศ' : type === 'Tactile' ? 'พิมพ์งาน / เขียนบทความ / ใช้งานได้ทั้งทำงานและเล่นเกม' : 'ผู้ชื่นชอบเสียงพิมพ์สะใจ / พิมพ์สัมผัสในห้องส่วนตัว'),
    lubed: Boolean(p.switchLubed),
    lifespan: p.lifespan || '50 ล้านครั้ง',
    audioUrl: p.switchAudioUrl || '',
    image: p.image || null,
    isFromDb: true
  }
}

// Helper to transform MongoDB keycap product into Designer keycap format
const formatDbKeycap = (p) => {
  let topColor = '#583670'
  let botColor = '#1a0e22'
  const name = (p.name || '').toLowerCase()
  if (name.includes('carbon') || name.includes('ดำ') || name.includes('black')) {
    topColor = '#2b3544'; botColor = '#0f172a'
  } else if (name.includes('cream') || name.includes('ครีม') || name.includes('beige')) {
    topColor = '#baa77e'; botColor = '#352e1f'
  } else if (name.includes('cyber') || name.includes('neon') || name.includes('blue')) {
    topColor = '#0284c7'; botColor = '#170c28'
  } else if (name.includes('shiro') || name.includes('ขาว') || name.includes('white')) {
    topColor = '#f8fafc'; botColor = '#0f172a'
  } else if (name.includes('gradient') || name.includes('เทา') || name.includes('gray')) {
    topColor = '#475569'; botColor = '#1e293b'
  } else if (name.includes('vintage') || name.includes('retro') || name.includes('sa')) {
    topColor = '#d4c5b9'; botColor = '#3e3228'
  }

  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.name,
    topColor,
    botColor,
    price: Number(p.price) || 0,
    image: p.image || '/images/key1.jpg',
    description: p.description || '',
    isFromDb: true
  }
}

// Helper to deduce case svg image path based on material and color
const getCaseImage = (matId, colId) => {
  if (!matId) return null
  const colClean = colId ? colId.replace(/^[a-z]+-/, '') : 'black'
  return `/images/case-${matId}-${colClean}.svg`
}

/**
 * Thumbnail component for selected custom keyboard parts
 * Features compact rounded frame, object-cover image, and elegant fallback UI
 */
function PartThumbnail({ src, alt = '', fallbackIcon = 'package', colorDot = null }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const isValidSrc = typeof src === 'string' && src.trim().length > 0 && !hasError

  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-purple-200/90 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center relative p-0.5">
      {isValidSrc ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-md select-none transition-transform hover:scale-110"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : colorDot ? (
        <span
          className="w-4 h-4 rounded-full border border-black/15 shadow-2xs shrink-0"
          style={{ backgroundColor: colorDot }}
          title={alt}
        />
      ) : (
        <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
          <Icon name={fallbackIcon} size="1.1em" />
        </div>
      )}
    </div>
  )
}

export default function Designer() {
  const { products, loadingProducts, addToCart } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const productIdFromQuery = searchParams.get('productId')

  // Base Keyboard Product State
  const [baseProduct, setBaseProduct] = useState(() => location.state?.product || null)
  const [isSelectBaseModalOpen, setIsSelectBaseModalOpen] = useState(false)
  const [baseSearchTerm, setBaseSearchTerm] = useState('')

  // Customization States (with Toggle Logic: null = unselected)
  const [caseMaterialId, setCaseMaterialId] = useState(null)
  const [caseColorId, setCaseColorId] = useState(null)
  const [switchId, setSwitchId] = useState(null)
  const [plateId, setPlateId] = useState(null)
  const [keycapId, setKeycapId] = useState(null)
  const [layout, setLayout] = useState(() => location.state?.product?.layout || '75%')
  const keyboardViewerRef = useRef(null)
  const [isSavingCustomItem, setIsSavingCustomItem] = useState(false)
  const [customItemError, setCustomItemError] = useState('')

  // Toast Notification State
  const [toast, setToast] = useState(null)

  // Switch Sound & Specs Modal States
  const [playingSwitchId, setPlayingSwitchId] = useState(null)
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)

  // Keycap Profiles & Materials Guide Modal State
  const [isKeycapModalOpen, setIsKeycapModalOpen] = useState(false)

  // Plate Materials Guide Modal State
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false)

  // Clean up audio playback on component unmount
  useEffect(() => {
    return () => {
      stopSwitchSound()
    }
  }, [])

  const handleToggleSound = (sw) => {
    const swId = sw.id || sw._id
    if (playingSwitchId === swId) {
      stopSwitchSound()
      setPlayingSwitchId(null)
    } else {
      playSwitchSound(sw, (state) => {
        setPlayingSwitchId(state.isPlaying ? state.switchId : null)
      })
    }
  }

  // 1. Toggle Case Material & Color
  const handleToggleMaterial = (newMaterialId) => {
    if (caseMaterialId === newMaterialId) {
      // Toggle OFF: clear material and color
      setCaseMaterialId(null)
      setCaseColorId(null)
      setToast('ยกเลิกการเลือกเคสคีย์บอร์ดแล้ว')
    } else {
      // Toggle ON: select material and default color to its first shade
      setCaseMaterialId(newMaterialId)
      const newMat = caseMaterials.find(m => m.id === newMaterialId)
      if (newMat && newMat.colors.length > 0) {
        setCaseColorId(newMat.colors[0].id)
        setToast(`เลือกเคส: ${newMat.label} - ${newMat.colors[0].name}`)
      } else {
        setCaseColorId(null)
        setToast(`เลือกเคส: ${newMat?.label || newMaterialId}`)
      }
    }
    setTimeout(() => setToast(null), 2500)
  }

  // Toggle Case Color specifically
  const handleToggleCaseColor = (newColorId) => {
    if (caseColorId === newColorId) {
      // Toggle OFF: deselect color
      setCaseColorId(null)
      setToast('ยกเลิกการเลือกสีเคสแล้ว')
    } else {
      // Toggle ON: select color
      setCaseColorId(newColorId)
      if (!caseMaterialId) {
        const parentMat = caseMaterials.find(m => m.colors.some(c => c.id === newColorId))
        if (parentMat) setCaseMaterialId(parentMat.id)
      }
      const allColors = caseMaterials.flatMap(m => m.colors)
      const foundColor = allColors.find(c => c.id === newColorId)
      if (foundColor) {
        setToast(`เลือกสีเคส: ${foundColor.name}`)
      }
    }
    setTimeout(() => setToast(null), 2500)
  }

  // 2. Toggle Switch
  const handleToggleSwitch = (newSwitchId) => {
    if (switchId === newSwitchId) {
      // Toggle OFF: deselect switch
      setSwitchId(null)
      if (playingSwitchId === newSwitchId) {
        stopSwitchSound()
        setPlayingSwitchId(null)
      }
      setToast('ยกเลิกการเลือกสวิตช์แล้ว')
    } else {
      // Toggle ON: select switch
      setSwitchId(newSwitchId)
      const sw = availableSwitches.find(s => s.id === newSwitchId || s._id === newSwitchId)
      if (sw) {
        setToast(`เลือกสวิตช์: ${sw.name} เรียบร้อยแล้ว`)
      }
    }
    setTimeout(() => setToast(null), 2500)
  }

  // 3. Toggle Plate Material
  const handleTogglePlate = (newPlateId) => {
    if (plateId === newPlateId) {
      // Toggle OFF: deselect plate
      setPlateId(null)
      setToast('ยกเลิกการเลือกเพลตซับเสียงแล้ว')
    } else {
      // Toggle ON: select plate
      setPlateId(newPlateId)
      const pl = availablePlates.find(p => p.id === newPlateId || p._id === newPlateId)
      if (pl) {
        setToast(`เลือกเพลต: ${pl.name} เรียบร้อยแล้ว`)
      }
    }
    setTimeout(() => setToast(null), 2500)
  }

  // 4. Toggle Keycaps
  const handleToggleKeycap = (newKeycapId) => {
    if (keycapId === newKeycapId) {
      // Toggle OFF: deselect keycap
      setKeycapId(null)
      setToast('ยกเลิกการเลือกคีย์แคปแล้ว')
    } else {
      // Toggle ON: select keycap
      setKeycapId(newKeycapId)
      const kc = availableKeycaps.find(k => k.id === newKeycapId || k._id === newKeycapId)
      if (kc) {
        setToast(`เลือกคีย์แคป: ${kc.name} เรียบร้อยแล้ว`)
      }
    }
    setTimeout(() => setToast(null), 2500)
  }

  // Available base keyboards list: prioritize MongoDB keyboards, combine with fallback defaults
  const availableKeyboards = useMemo(() => {
    const dbKeyboards = Array.isArray(products)
      ? products.filter(p => !p.category || p.category.toLowerCase().includes('keyboard') || p.category === 'คีย์บอร์ด')
      : []
    if (dbKeyboards.length > 0) {
      return dbKeyboards
    }
    return defaultBaseKeyboards
  }, [products])

  const filteredBaseKeyboards = useMemo(() => {
    if (!baseSearchTerm.trim()) return availableKeyboards
    const term = baseSearchTerm.toLowerCase()
    return availableKeyboards.filter(k =>
      (k.name && k.name.toLowerCase().includes(term)) ||
      (k.layout && k.layout.toLowerCase().includes(term)) ||
      (k.caseMaterial && k.caseMaterial.toLowerCase().includes(term))
    )
  }, [availableKeyboards, baseSearchTerm])

  // Available switches list: dynamically load from MongoDB Atlas products
  const availableSwitches = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return defaultSwitches
    }
    const dbSwitches = products
      .filter(p => {
        const cat = (p.category || '').toLowerCase()
        const part = (p.partType || '').toLowerCase()
        const nameUpper = (p.name || '').toUpperCase()

        // Defensively filter out keyboards or non-switch items
        const isKeyboard = part === 'keyboard' ||
          cat.includes('keyboard') ||
          cat.includes('คีย์บอร์ด') ||
          nameUpper.includes('MOD00') ||
          nameUpper.includes('LUCKY65') ||
          nameUpper.includes('MONSGEEK') ||
          nameUpper.includes('LEOBOG') ||
          nameUpper.includes('KEYDOUS') ||
          nameUpper.includes('WEIKAV')

        if (isKeyboard) return false

        return cat === 'switches' || cat === 'switch' || cat === 'สวิตช์' || part === 'switch'
      })
      .map(p => formatDbSwitch(p))

    return dbSwitches.length > 0 ? dbSwitches : defaultSwitches
  }, [products])

  // Available keycaps list: dynamically load from MongoDB Atlas products
  const availableKeycaps = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return defaultKeycaps
    }
    const dbKeycaps = products
      .filter(p => {
        const cat = (p.category || '').toLowerCase()
        const part = (p.partType || '').toLowerCase()
        const nameUpper = (p.name || '').toUpperCase()

        // Defensively filter out keyboards or base models
        const isKeyboard = cat.includes('custom keyboard') ||
          cat.includes('pre-built') ||
          nameUpper.includes('MOD00') ||
          nameUpper.includes('LUCKY65') ||
          nameUpper.includes('MONSGEEK') ||
          nameUpper.includes('LEOBOG') ||
          nameUpper.includes('KEYDOUS') ||
          nameUpper.includes('WEIKAV')

        if (isKeyboard) return false

        return cat === 'keycaps' || cat === 'keycap' || cat === 'คีย์แคป' || part === 'keycap'
      })
      .map(p => formatDbKeycap(p))

    return dbKeycaps.length > 0 ? dbKeycaps : defaultKeycaps
  }, [products])

  // Available plates list: with soft/stiff categories, acoustic descriptions and database/mock accessories integration
  const availablePlates = useMemo(() => {
    const basePlates = [
      { id: 'fr4', name: 'FR4 Matte Black', category: 'soft', color: '#0f172a', price: 200, desc: 'สัมผัสยืดหยุ่น พิมพ์สบายนิ้ว โทนเสียงทุ้มละมุน (Thock)', image: '/images/plate-fr4.svg' },
      { id: 'pc', name: 'Polycarbonate (PC)', category: 'soft', color: '#f1f5f9', price: 250, desc: 'สัมผัสยืดหยุ่น พิมพ์สบายนิ้ว โทนเสียงทุ้มละมุน (Thock)', image: '/images/plate-pc.svg' },
      { id: 'pom', name: 'POM Plate', category: 'soft', color: '#e2e8f0', price: 300, desc: 'สัมผัสยืดหยุ่น พิมพ์สบายนิ้ว โทนเสียงทุ้มละมุน (Thock)', image: '/images/plate-pom.svg' },
      { id: 'aluminum', name: 'CNC Aluminum', category: 'stiff', color: '#64748b', price: 200, desc: 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)', image: '/images/plate-aluminum.svg' },
      { id: 'brass', name: 'Polished Brass', category: 'stiff', color: '#eab308', price: 450, desc: 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)', image: '/images/plate-brass.svg' },
      { id: 'carbon', name: 'Carbon Fiber', category: 'stiff', color: '#1e293b', price: 350, desc: 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)', image: '/images/plate-carbon.svg' },
      { id: 'copper', name: 'Copper (ทองแดง)', category: 'stiff', color: '#b87333', price: 600, desc: 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)', image: '/images/plate-copper.svg' },
      { id: 'steel', name: 'Stainless Steel', category: 'stiff', color: '#94a3b8', price: 350, desc: 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)', image: '/images/plate-steel.svg' }
    ]

    if (!Array.isArray(products) || products.length === 0) {
      return basePlates
    }

    const dbAccessories = products.filter(p => {
      const cat = (p.category || '').toLowerCase()
      const nameUpper = (p.name || '').toUpperCase()

      // Defensively filter out keyboards or base models
      const isKeyboard = cat.includes('keyboard') ||
        cat.includes('คีย์บอร์ด') ||
        nameUpper.includes('MOD00') ||
        nameUpper.includes('LUCKY65') ||
        nameUpper.includes('MONSGEEK') ||
        nameUpper.includes('LEOBOG') ||
        nameUpper.includes('KEYDOUS') ||
        nameUpper.includes('WEIKAV')

      if (isKeyboard) return false

      return cat === 'plate material' || cat === 'เพลตซับเสียง' || cat.includes('plate') || cat.includes('เพลต') || cat === 'accessories' || cat === 'อุปกรณ์เสริม' || cat.includes('accessories') || cat.includes('อุปกรณ์เสริม')
    })

    if (dbAccessories.length === 0) {
      return basePlates
    }

    const matchedDbIds = new Set()

    // Merge matching DB accessories into basePlates
    const result = basePlates.map(plate => {
      const matched = dbAccessories.find(a => {
        const aname = (a.name || '').toLowerCase()
        return aname.includes(plate.id.toLowerCase()) || aname.includes(plate.name.toLowerCase().split(' ')[0])
      })
      if (matched) {
        matchedDbIds.add(matched._id || matched.id)
        return {
          ...plate,
          dbId: matched._id || matched.id,
          price: Number(matched.price) || plate.price,
          image: matched.image || plate.image,
          desc: matched.description || plate.desc
        }
      }
      return plate
    })

    // Include other non-matched Accessories from DB that are plates
    dbAccessories.forEach(acc => {
      const accId = acc._id || acc.id
      if (!matchedDbIds.has(accId)) {
        const nameLower = (acc.name || '').toLowerCase()
        const isSoft = nameLower.includes('pc') || nameLower.includes('pom') || nameLower.includes('fr4')
        const isPlate = (acc.partType || '').toLowerCase() === 'plate' || nameLower.includes('plate') || acc.name.includes('เพลต')
        if (isPlate) {
          result.push({
            id: acc._id || acc.id,
            _id: acc._id || acc.id,
            name: acc.name,
            category: isSoft ? 'soft' : 'stiff',
            price: Number(acc.price) || 200,
            desc: acc.description || (isSoft ? 'สัมผัสยืดหยุ่น พิมพ์สบายนิ้ว โทนเสียงทุ้มละมุน (Thock)' : 'สัมผัสแน่น มั่นคง โทนเสียงใส คมชัด (Clack)'),
            image: acc.image || (isSoft ? '/images/plate-pc.svg' : '/images/plate-aluminum.svg'),
            isFromDb: true
          })
        }
      }
    })

    return result
  }, [products])

  // Validate selected switch if switchId is set (do NOT auto-select when null)
  useEffect(() => {
    if (switchId && availableSwitches.length > 0) {
      const match = availableSwitches.some(s => s.id === switchId || s._id === switchId)
      if (!match) {
        setSwitchId(null)
      }
    }
  }, [availableSwitches, switchId])

  // Validate selected keycap if keycapId is set (do NOT auto-select when null)
  useEffect(() => {
    if (keycapId && availableKeycaps.length > 0) {
      const match = availableKeycaps.some(k => k.id === keycapId || k._id === keycapId)
      if (!match) {
        setKeycapId(null)
      }
    }
  }, [availableKeycaps, keycapId])

  // Synchronize incoming Base Keyboard data from Route state or URL query
  useEffect(() => {
    if (location.state?.product) {
      const p = location.state.product
      setBaseProduct(p)
      if (p.layout) setLayout(p.layout)
      if (p._id && searchParams.get('productId') !== p._id) {
        setSearchParams({ productId: p._id }, { replace: true })
      }
      setIsSelectBaseModalOpen(false)
      return
    }

    if (productIdFromQuery) {
      const foundInProducts = products.find(p => (p._id === productIdFromQuery || p.id === productIdFromQuery))
      if (foundInProducts) {
        setBaseProduct(foundInProducts)
        if (foundInProducts.layout) setLayout(foundInProducts.layout)
        setIsSelectBaseModalOpen(false)
        return
      }

      const foundInDefaults = defaultBaseKeyboards.find(p => (p._id === productIdFromQuery || p.id === productIdFromQuery))
      if (foundInDefaults) {
        setBaseProduct(foundInDefaults)
        if (foundInDefaults.layout) setLayout(foundInDefaults.layout)
        setIsSelectBaseModalOpen(false)
        return
      }

      if (!loadingProducts) {
        fetchProductById(productIdFromQuery)
          .then(data => {
            if (data && (data._id || data.id)) {
              setBaseProduct(data)
              if (data.layout) setLayout(data.layout)
              setIsSelectBaseModalOpen(false)
            } else {
              setIsSelectBaseModalOpen(true)
            }
          })
          .catch(() => setIsSelectBaseModalOpen(true))
      }
      return
    }

    // Direct access to /designer with NO state and NO query parameter: open modal!
    if (!baseProduct) {
      setIsSelectBaseModalOpen(true)
    }
  }, [location.state, productIdFromQuery, products, loadingProducts])

  // Synchronize layout if baseProduct changes (Keep part choices independent)
  useEffect(() => {
    if (!baseProduct) return
    if (baseProduct.layout) setLayout(baseProduct.layout)
  }, [baseProduct])

  const handleSelectBaseKeyboard = (selected) => {
    setBaseProduct(selected)
    if (selected.layout) setLayout(selected.layout)
    setSearchParams({ productId: selected._id || selected.id }, { replace: true })
    setIsSelectBaseModalOpen(false)
    setToast(`เลือกโมเดลคีย์บอร์ด: ${selected.name} เรียบร้อยแล้ว`)
    setTimeout(() => setToast(null), 3500)
  }

  const handleCloseBaseModal = () => {
    if (!baseProduct) {
      const defaultKb = (availableKeyboards && availableKeyboards.length > 0)
        ? availableKeyboards[0]
        : defaultBaseKeyboards[0]
      if (defaultKb) {
        setBaseProduct(defaultKb)
        if (defaultKb.layout) setLayout(defaultKb.layout)
        setSearchParams({ productId: defaultKb._id || defaultKb.id }, { replace: true })
      }
    }
    setIsSelectBaseModalOpen(false)
  }

  // Handle ESC key to close base selection modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSelectBaseModalOpen) {
        handleCloseBaseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelectBaseModalOpen, baseProduct, availableKeyboards])

  // Null-safe Selected Objects
  const selectedMaterial = caseMaterialId ? (caseMaterials.find(m => m.id === caseMaterialId) || null) : null
  const availableColors = selectedMaterial ? selectedMaterial.colors : []
  const selectedColor = caseColorId ? (availableColors.find(c => c.id === caseColorId) || null) : null

  const selectedCase = selectedMaterial ? {
    id: selectedColor ? `${selectedMaterial.id}-${selectedColor.id}` : selectedMaterial.id,
    material: selectedMaterial.id,
    materialName: selectedMaterial.name,
    colorName: selectedColor ? selectedColor.name : 'ไม่ได้ระบุสี',
    name: selectedColor ? `${selectedMaterial.name} Case - ${selectedColor.name}` : `${selectedMaterial.name} Case`,
    color: selectedColor?.hex || '#ffffff',
    edge: selectedColor?.edge || '#cbd5e1',
    image: getCaseImage(selectedMaterial.id, selectedColor?.id),
    price: Number(selectedMaterial.price) || 0
  } : null

  const selectedSwitch = switchId ? (availableSwitches.find(s => s.id === switchId || s._id === switchId) || null) : null
  const selectedPlate = plateId ? (availablePlates.find(p => p.id === plateId || p._id === plateId) || null) : null
  const selectedKeycap = keycapId ? (availableKeycaps.find(k => k.id === keycapId || k._id === keycapId) || null) : null
  const activeKeyboardLayout = getKeyboardLayout(layout)
  const setViewerAppearance = useKeyboardConfig((state) => state.setAppearance)

  useEffect(() => {
    const materialId = selectedMaterial?.id
    const caseMaterial = materialId === 'polycarbonate' || materialId === 'abs' || materialId === 'wood'
      ? materialId
      : 'aluminum'

    setViewerAppearance({
      caseMaterial,
      caseColor: selectedCase?.color || '#64748b',
      switchType: selectedSwitch?.type || 'linear',
      keycapColors: {
        alphas: selectedKeycap?.color || selectedKeycap?.topColor || '#f8fafc',
        mods: selectedKeycap?.accentColor || '#e9d5ff',
        accents: selectedSwitch?.color || '#c4b5fd'
      }
    })
  }, [
    selectedMaterial?.id,
    selectedCase?.color,
    selectedSwitch?.type,
    selectedSwitch?.color,
    selectedKeycap?.color,
    selectedKeycap?.topColor,
    selectedKeycap?.accentColor,
    setViewerAppearance
  ])

  // Base Price automatically set from the incoming/selected Base Keyboard Product
  const basePrice = baseProduct ? (Number(baseProduct.price) || 2990) : 2990
  const casePrice = selectedCase ? (Number(selectedCase.price) || 0) : 0
  const switchPrice = selectedSwitch ? (Number(selectedSwitch.price) || 0) : 0
  const platePrice = selectedPlate ? (Number(selectedPlate.price) || 0) : 0
  const keycapPrice = selectedKeycap ? (Number(selectedKeycap.price) || 0) : 0

  const totalPrice = basePrice + casePrice + switchPrice + platePrice + keycapPrice

  const buildCustomItem = (image) => {
    const customPartsList = [
      `คีย์บอร์ดประกอบเอง (Layout ${layout || '75%'})`,
      selectedCase ? `เคส: ${selectedCase.name}` : null,
      selectedSwitch ? `สวิตช์: ${selectedSwitch.name}` : null,
      selectedPlate ? `เพลต: ${selectedPlate.name}` : null,
      selectedKeycap ? `คีย์แคป: ${selectedKeycap.name}` : null
    ].filter(Boolean)

    return {
      id: `custom-${Date.now()}`,
      name: `คีย์บอร์ดประกอบเอง (${layout || '75%'})${selectedCase ? ` - ${selectedCase.name}` : ''}`,
      orderType: 'custom', // Mark as custom assembly for Diagram 1 & 3 flow
      type: 'Custom Build',
      layout: layout || '75%',
      specs: customPartsList.join(' • '),
      caseColor: selectedCase ? selectedCase.name : 'ไม่ได้เลือก',
      caseColorHex: selectedCase?.color || null,
      caseEdgeHex: selectedCase?.edge || null,
      switchType: selectedSwitch ? selectedSwitch.name : 'ไม่ได้เลือก',
      switchPlate: selectedPlate ? selectedPlate.name : 'ไม่ได้เลือก',
      keycaps: selectedKeycap ? selectedKeycap.name : 'ไม่ได้เลือก',
      price: totalPrice,
      quantity: 1,
      image
    }
  }

  const captureCustomizedKeyboard = async () => {
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)))
    const image = keyboardViewerRef.current?.captureImage()
    if (!image) throw new Error('โมเดลยังไม่พร้อมบันทึกภาพ กรุณารอสักครู่แล้วลองใหม่')
    return image
  }

  const saveCustomizedKeyboard = async (continueToCheckout) => {
    if (isSavingCustomItem) return
    setIsSavingCustomItem(true)
    setCustomItemError('')

    try {
      const image = await captureCustomizedKeyboard()
      addToCart(buildCustomItem(image))
      if (continueToCheckout) {
        navigate('/checkout')
      } else {
        setToast(`เพิ่มคีย์บอร์ดประกอบเอง Layout ${layout} ลงในตะกร้าแล้ว`)
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      console.error('Unable to save customized keyboard preview:', error)
      setCustomItemError(error.message || 'บันทึกภาพโมเดลไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsSavingCustomItem(false)
    }
  }

  const handleAddToCart = () => saveCustomizedKeyboard(false)
  const handleSaveAndCheckout = () => saveCustomizedKeyboard(true)

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
          <span><Icon name="wrench" /> โหมดออกแบบประกอบเอง (Custom Keyboard Builder)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          จำลองและประกอบคีย์บอร์ดทีละชิ้นส่วน
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          ออกแบบคีย์บอร์ดในสไตล์คุณ เลือกโมเดลตั้งต้น ปรับแต่งวัสดุเคส เพลต สวิตช์ และคีย์แคป พร้อมระบบคำนวณราคาแบบเรียลไทม์
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 3D Keyboard Preview */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-4 sm:p-6 shadow-sm flex flex-col justify-center items-center">
          <div className="relative w-full aspect-4/3 sm:aspect-16/10 min-h-[380px] sm:min-h-[500px] rounded-2xl bg-slate-100/90 border border-purple-100 flex items-center justify-center p-4 sm:p-8 overflow-hidden group">
            {/* 4 มุมวงเล็บขอบสีม่วง (Purple Corner Brackets) */}
            <span className="absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 border-purple-600 rounded-tl-sm pointer-events-none z-10" />
            <span className="absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 border-purple-600 rounded-tr-sm pointer-events-none z-10" />
            <span className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 border-purple-600 rounded-bl-sm pointer-events-none z-10" />
            <span className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 border-purple-600 rounded-br-sm pointer-events-none z-10" />

            <Suspense
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                  กำลังเตรียมโมเดลคีย์บอร์ด...
                </div>
              }
            >
              <KeyboardViewer
                fallbackAlt="ภาพคีย์บอร์ดประกอบเอง"
                layout={layout}
                ref={keyboardViewerRef}
              />
            </Suspense>
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-purple-100 bg-white/90 px-3 py-1.5 text-center text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur sm:text-xs">
              ลากเพื่อหมุน 360° · เลื่อนหรือบีบนิ้วเพื่อซูม
            </div>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-purple-100 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur">
              Layout {activeKeyboardLayout.label} · {activeKeyboardLayout.keyCount} ปุ่ม
            </div>
          </div>
        </section>

        {/* RIGHT: Customization Controls & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-purple-100 p-4 sm:p-7 shadow-sm space-y-6">
            {/* 1. คีย์บอร์ดตั้งต้น (Base Model) */}
            <div className="bg-gradient-to-br from-purple-50/70 via-white to-purple-50/40 rounded-2xl border border-purple-200/90 p-4 sm:p-5 shadow-xs transition-all">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    1. โมเดลคีย์บอร์ดตั้งต้น (BASE MODEL)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSelectBaseModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-purple-700 bg-white hover:bg-purple-100 border border-purple-200 transition-colors shadow-2xs cursor-pointer"
                  title="คลิกเพื่อเปลี่ยนโมเดลคีย์บอร์ดตั้งต้น"
                >
                  <Icon name="rotateCcw" size="0.85em" />
                  <span>เปลี่ยนรุ่น</span>
                </button>
              </div>

              {/* Main Keyboard Name Headline */}
              <div className="pt-0.5">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {baseProduct?.name || 'กำลังโหลดโมเดลคีย์บอร์ด...'}
                </h2>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-2xs">
                    Layout {baseProduct?.layout || layout || '75%'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ราคาเริ่มต้น: <strong className="text-purple-700 font-bold">฿{Number(baseProduct?.price || basePrice).toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. เคสคีย์บอร์ด (CASE MATERIAL & COLOR) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. เคสคีย์บอร์ด (CASE MATERIAL & COLOR)
                </label>
                <span className="text-xs font-semibold">
                  {selectedMaterial ? (
                    <span className="text-purple-700">
                      {selectedMaterial.name} {selectedColor ? `• ${selectedColor.name}` : '(ยังไม่เลือกสี)'}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">ยังไม่ได้เลือก</span>
                  )}
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
                        onClick={() => handleToggleMaterial(mat.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold shadow-xs ring-2 ring-purple-300'
                            : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                        }`}
                        title={isSelected ? 'คลิกซ้ำเพื่อยกเลิกการเลือก' : `เลือก ${mat.label}`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <Icon name={mat.icon} />
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
              {selectedMaterial ? (
                <div className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100/80 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span><Icon name="palette" /> เฉดสีของ {selectedMaterial.name}:</span>
                    </span>
                    {/* Selected Color Name Badge */}
                    {selectedColor ? (
                      <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                        {selectedColor.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        คลิกเลือกสี (ไม่บังคับ)
                      </span>
                    )}
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
                          onClick={() => handleToggleCaseColor(col.id)}
                          className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center relative shadow-xs hover:scale-110 cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 ring-4 ring-purple-200 scale-110 shadow-md'
                              : 'border-slate-300 hover:border-purple-300'
                          }`}
                          style={{
                            backgroundColor: col.hex,
                            boxShadow: isLightColor ? 'inset 0 0 0 1.5px rgba(0,0,0,0.12)' : undefined
                          }}
                          title={`${col.name} (คลิกซ้ำเพื่อยกเลิกสี)`}
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
              ) : (
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 text-center text-xs text-slate-400">
                  เลือกประเภทวัสดุเคสด้านบนเพื่อแสดงตัวเลือกเฉดสี
                </div>
              )}
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all border border-purple-200/70 shadow-2xs group cursor-pointer"
                    title="เปิดคู่มือเปรียบเทียบและฟังเสียงสวิตช์เชิงลึก (Keychron Style)"
                  >
                    <span className="group-hover:scale-110 transition-transform"><Icon name="sparkles" /></span>
                    <span>คู่มือเปรียบเทียบและฟังเสียง</span>
                  </button>
                </div>
                <span className="text-xs font-semibold">
                  {selectedSwitch ? (
                    <span className="text-purple-700">
                      {selectedSwitch.name} {selectedSwitch.price > 0 ? `(+฿${Number(selectedSwitch.price).toLocaleString()})` : '(ฟรี)'}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">ยังไม่ได้เลือก</span>
                  )}
                </span>
              </div>

              <div className="space-y-2">
                {availableSwitches.map((s) => {
                  const sId = s.id || s._id
                  const isPlaying = playingSwitchId === sId
                  const isSelected = Boolean(switchId) && (switchId === sId || switchId === s.id || switchId === s._id)

                  return (
                    <div
                      key={sId}
                      onClick={() => handleToggleSwitch(sId)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold shadow-xs ring-2 ring-purple-300'
                          : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                      }`}
                      title={isSelected ? 'คลิกซ้ำเพื่อยกเลิกการเลือกสวิตช์นี้' : `เลือก ${s.name}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Switch Thumbnail or Color Dot */}
                        {s.image && typeof s.image === 'string' && s.image.startsWith('/api/products/images') ? (
                          <div className="w-6 h-6 rounded-md bg-slate-50 p-0.5 border border-purple-200 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={s.image} alt={s.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-black/15"
                            style={{ backgroundColor: s.color }}
                            title={`${s.name} (${s.type})`}
                          />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold ${isSelected ? 'text-purple-950 font-bold' : ''}`}>
                              {s.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}

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
                                  <span className="text-[10px] animate-pulse"><Icon name="sparkles" /></span>
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
                                  <span><Icon name="sparkles" /></span>
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

                      <div className={`font-bold shrink-0 ml-2 ${isSelected ? 'text-purple-700' : 'text-slate-500'}`}>
                        {s.price > 0 ? `+฿${Number(s.price).toLocaleString()}` : 'ฟรี'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. Plate Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4. เพลตซับเสียง (Plate Material)
                  </label>
                  {/* Button: Plate Materials Guide Modal */}
                  <button
                    type="button"
                    onClick={() => setIsPlateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all border border-purple-200/70 shadow-2xs group cursor-pointer"
                    title="เปิดคู่มือเปรียบเทียบวัสดุเพลต"
                  >
                    <span className="group-hover:scale-110 transition-transform"><Icon name="sparkles" /></span>
                    <span>คู่มือเปรียบเทียบเพลต</span>
                  </button>
                </div>
                <span className="text-xs font-semibold">
                  {selectedPlate ? (
                    <span className="text-purple-700">
                      {selectedPlate.name} (+฿{Number(selectedPlate.price || 0).toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">ยังไม่ได้เลือก</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availablePlates.map((p) => {
                  const pId = p.id || p._id
                  const isSelected = Boolean(plateId) && (plateId === pId || plateId === p.id || plateId === p._id)

                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => handleTogglePlate(pId)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 font-bold text-purple-900 shadow-2xs ring-2 ring-purple-300'
                          : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                      }`}
                      title={isSelected ? 'คลิกซ้ำเพื่อยกเลิกการเลือกเพลตนี้' : `เลือก ${p.name}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold line-clamp-1">{p.name}</div>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold shrink-0 ml-1">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-medium ${isSelected ? 'text-purple-700 font-bold' : 'text-slate-500'}`}>
                        +฿{Number(p.price).toLocaleString()}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Keycaps Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    5. คีย์แคป (Keycaps)
                  </label>
                  {/* Button: Keycap Profiles & Materials Guide Modal */}
                  <button
                    type="button"
                    onClick={() => setIsKeycapModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all border border-purple-200/70 shadow-2xs group cursor-pointer"
                    title="เปิดคู่มือเปรียบเทียบวัสดุคีย์แคป"
                  >
                    <span className="group-hover:scale-110 transition-transform"><Icon name="sparkles" /></span>
                    <span>คู่มือเปรียบเทียบวัสดุ</span>
                  </button>
                </div>
                <span className="text-xs font-semibold">
                  {selectedKeycap ? (
                    <span className="text-purple-700">
                      {selectedKeycap.name} (+฿{Number(selectedKeycap.price).toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">ยังไม่ได้เลือก</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableKeycaps.map((k) => {
                  const kId = k.id || k._id
                  const isSelected = Boolean(keycapId) && (keycapId === kId || keycapId === k.id || keycapId === k._id)

                  return (
                    <button
                      key={kId}
                      type="button"
                      onClick={() => handleToggleKeycap(kId)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 font-bold text-purple-900 shadow-2xs ring-2 ring-purple-300'
                          : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50/40 hover:border-purple-200'
                      }`}
                      title={isSelected ? 'คลิกซ้ำเพื่อยกเลิกการเลือกคีย์แคปนี้' : `เลือก ${k.name}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold line-clamp-1">{k.name}</div>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold shrink-0 ml-1">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-medium ${isSelected ? 'text-purple-700 font-bold' : 'text-slate-500'}`}>
                        +฿{Number(k.price).toLocaleString()}
                      </div>
                    </button>
                  )
                })}
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
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    แบบประกอบเอง
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    ชิ้นส่วนที่เลือก: <strong className="text-purple-700">{[selectedCase, selectedSwitch, selectedPlate, selectedKeycap].filter(Boolean).length}</strong>/4 รายการ
                  </div>
                </div>
              </div>

              {/* Selected parts tags breakdown with Image Thumbnails */}
              <div className="flex flex-wrap gap-2 pt-1">
                {/* 1. Base Model Tag */}
                <div className="flex items-center gap-2 bg-slate-50 text-slate-800 p-1.5 pr-3 rounded-xl border border-slate-200/90 shadow-2xs">
                  <PartThumbnail
                    src={baseProduct?.image || key1}
                    alt={baseProduct?.name || 'Base Model'}
                    fallbackIcon="keyboard"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                      โมเดล: <strong className="text-slate-800 font-bold truncate inline-block max-w-[120px] sm:max-w-[160px] align-bottom">{baseProduct?.name || 'Base Model'}</strong>
                    </span>
                    <span className="text-[10px] font-extrabold text-purple-700 block">
                      ฿{basePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2. Case Tag */}
                {selectedCase && (
                  <div className="flex items-center gap-2 bg-purple-50/70 text-purple-950 p-1.5 pr-3 rounded-xl border border-purple-200/80 shadow-2xs">
                    <PartThumbnail
                      src={selectedCase.image}
                      alt={selectedCase.name}
                      colorDot={selectedCase.color}
                      fallbackIcon="layers"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-700/80 font-semibold block leading-tight">
                        เคส: <strong className="text-purple-950 font-bold truncate inline-block max-w-[120px] sm:max-w-[160px] align-bottom">{selectedCase.materialName} {selectedColor ? `• ${selectedColor.name}` : ''}</strong>
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700 block">
                        {selectedCase.price > 0 ? `+฿${selectedCase.price.toLocaleString()}` : 'ฟรี'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Switch Tag */}
                {selectedSwitch && (
                  <div className="flex items-center gap-2 bg-purple-50/70 text-purple-950 p-1.5 pr-3 rounded-xl border border-purple-200/80 shadow-2xs">
                    <PartThumbnail
                      src={selectedSwitch.image}
                      alt={selectedSwitch.name}
                      colorDot={selectedSwitch.color}
                      fallbackIcon="sparkles"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-700/80 font-semibold block leading-tight">
                        สวิตช์: <strong className="text-purple-950 font-bold truncate inline-block max-w-[120px] sm:max-w-[160px] align-bottom">{selectedSwitch.name}</strong>
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700 block">
                        {selectedSwitch.price > 0 ? `+฿${Number(selectedSwitch.price).toLocaleString()}` : 'ฟรี'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Plate Tag */}
                {selectedPlate && (
                  <div className="flex items-center gap-2 bg-purple-50/70 text-purple-950 p-1.5 pr-3 rounded-xl border border-purple-200/80 shadow-2xs">
                    <PartThumbnail
                      src={selectedPlate.image}
                      alt={selectedPlate.name}
                      colorDot={selectedPlate.color}
                      fallbackIcon="layers"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-700/80 font-semibold block leading-tight">
                        เพลต: <strong className="text-purple-950 font-bold truncate inline-block max-w-[120px] sm:max-w-[160px] align-bottom">{selectedPlate.name}</strong>
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700 block">
                        +฿{Number(selectedPlate.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. Keycaps Tag */}
                {selectedKeycap && (
                  <div className="flex items-center gap-2 bg-purple-50/70 text-purple-950 p-1.5 pr-3 rounded-xl border border-purple-200/80 shadow-2xs">
                    <PartThumbnail
                      src={selectedKeycap.image}
                      alt={selectedKeycap.name}
                      colorDot={selectedKeycap.topColor}
                      fallbackIcon="box"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-700/80 font-semibold block leading-tight">
                        คีย์แคป: <strong className="text-purple-950 font-bold truncate inline-block max-w-[120px] sm:max-w-[160px] align-bottom">{selectedKeycap.name}</strong>
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700 block">
                        +฿{Number(selectedKeycap.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveAndCheckout}
                  disabled={isSavingCustomItem}
                  className="flex-1 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:cursor-wait disabled:opacity-60"
                >
                  {isSavingCustomItem ? 'กำลังบันทึกโมเดล...' : 'บันทึกและสั่งซื้อทันที →'}
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSavingCustomItem}
                  className="px-5 py-3.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 font-bold text-sm transition-all cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  title="เพิ่มลงในตะกร้า"
                >
                  <Icon name="cart" /> {isSavingCustomItem ? '…' : '+'}
                </button>
              </div>
              {customItemError && (
                <p className="text-sm font-semibold text-rose-700" role="alert">
                  {customItemError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Switch Comparison & Sound Test Modal (Keychron Style) */}
      <SwitchSpecsModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        switches={availableSwitches}
        selectedSwitchId={selectedSwitch ? (selectedSwitch.id || selectedSwitch._id) : null}
        onSelectSwitch={(id) => handleToggleSwitch(id)}
        playingSwitchId={playingSwitchId}
        setPlayingSwitchId={setPlayingSwitchId}
      />

      {/* Keycap Profiles & Materials Guide Modal */}
      <KeycapGuideModal
        isOpen={isKeycapModalOpen}
        onClose={() => setIsKeycapModalOpen(false)}
        keycaps={availableKeycaps}
        selectedKeycapId={selectedKeycap ? (selectedKeycap.id || selectedKeycap._id) : null}
        onSelectKeycap={(id) => handleToggleKeycap(id)}
      />

      {/* Plate Materials Guide Modal */}
      <PlateGuideModal
        isOpen={isPlateModalOpen}
        onClose={() => setIsPlateModalOpen(false)}
        plates={availablePlates}
        selectedPlateId={selectedPlate ? (selectedPlate.id || selectedPlate._id) : null}
        onSelectPlate={(id) => handleTogglePlate(id)}
      />

      {/* Base Keyboard Selection Modal (Automatic Fallback & Switch Base Kit) */}
      {isSelectBaseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={handleCloseBaseModal}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/90 via-white to-purple-50/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold mb-1.5">
                    <Icon name="keyboard" size="0.95em" />
                    <span>เลือกคีย์บอร์ดตั้งต้น (Base Kit)</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    เลือกโมเดลคีย์บอร์ดที่ต้องการ Custom
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    เลือกคีย์บอร์ดตั้งต้นเพื่อโหลดโครงสร้าง ขนาด Layout สเปก และราคาตั้งต้นอัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseBaseModal}
                  className="w-8 h-8 rounded-full bg-white border border-purple-200 text-slate-500 hover:text-slate-800 hover:bg-purple-100/60 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs"
                  title="ปิดหน้าต่าง (ESC)"
                  aria-label="ปิดหน้าต่าง"
                >
                  <Icon name="close" size="1.1em" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-4">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icon name="search" size="1em" />
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อคีย์บอร์ด หรือขนาด Layout (เช่น AKKO, 75%, TKL)..."
                  value={baseSearchTerm}
                  onChange={(e) => setBaseSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-purple-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Modal Body - Keyboards Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              {filteredBaseKeyboards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <Icon name="help" size={36} className="mx-auto mb-2 text-purple-300" />
                  ไม่พบโมเดลคีย์บอร์ดที่ตรงกับคำค้นหา
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredBaseKeyboards.map((kb) => {
                    const isCurrent = (baseProduct?._id === kb._id || baseProduct?.id === kb.id)
                    return (
                      <div
                        key={kb._id || kb.id}
                        onClick={() => handleSelectBaseKeyboard(kb)}
                        className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-300 shadow-sm'
                            : 'border-purple-100 bg-white hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl bg-purple-50/60 border border-purple-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <ProductImage
                              src={kb.image || key1}
                              alt={kb.name}
                              className="w-full h-full"
                              imageClassName="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                {kb.layout || '75%'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] text-slate-500 bg-slate-100 font-medium">
                                {kb.mountType || 'Gasket Mount'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                              {kb.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {kb.caseMaterial || 'CNC Aluminum'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-purple-50">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">ราคาตั้งต้น</span>
                            <span className="text-sm font-extrabold text-purple-700">
                              ฿{Number(kb.price || 2990).toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white'
                            }`}
                          >
                            {isCurrent ? 'กำลังเลือก ✓' : 'เลือกโมเดลนี้ →'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-purple-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
              <span>พบทั้งหมด {filteredBaseKeyboards.length} โมเดลคีย์บอร์ด</span>
              <button
                type="button"
                onClick={handleCloseBaseModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
