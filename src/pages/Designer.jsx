import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop, playSwitchSound } from '../context/ShopContext'
import ThreeKeyboard from '../components/keyboard/ThreeKeyboard'
import key1 from '../assets/key1.jpg'

// 1. CASES (Layer 5: CNC Aluminum Chassis & Weight)
const cases = [
  { id: 'purple', name: 'Midnight Purple', color: '#2c123d', edge: '#a855f7', price: 0 },
  { id: 'blue', name: 'Deep Space Blue', color: '#0d213f', edge: '#38bdf8', price: 0 },
  { id: 'red', name: 'Crimson Anodized', color: '#4a121e', edge: '#f43f5e', price: 0 },
  { id: 'brown', name: 'Mocha Walnut', color: '#382215', edge: '#fb923c', price: 10 },
  { id: 'grey', name: 'Titanium Grey', color: '#1a1c24', edge: '#94a3b8', price: 15 },
]

// 2. SWITCHES (Layer 2: Mechanical Switches & Acoustic Stems)
const switches = [
  { id: 'blue', name: 'Gateron Blue', feel: 'Clicky / Crisp bump', force: '60g', sound: 'click', color: '#38bdf8', price: 0 },
  { id: 'red', name: 'Cherry MX Red', feel: 'Smooth / Linear speed', force: '45g', sound: 'linear', color: '#f43f5e', price: 0 },
  { id: 'brown', name: 'Holy Panda Brown', feel: 'Muted / Soft tactile', force: '55g', sound: 'soft', color: '#fb923c', price: 5 },
  { id: 'yellow', name: 'Milky Yellow Pro', feel: 'Deep Thock / Linear', force: '50g', sound: 'linear', color: '#eab308', price: 10 },
]

// 3. PLATES (Layer 3: Switch Mounting Plate Material)
const plates = [
  { id: 'brass', name: 'Polished Brass', color: '#eab308', desc: 'Bright acoustic clack & heavy golden shimmer', price: 20 },
  { id: 'carbon', name: 'Carbon Fiber', color: '#1e293b', desc: 'Stiff, high-pitched clack and ultra lightweight', price: 15 },
  { id: 'fr4', name: 'FR4 Matte Black', color: '#0f172a', desc: 'Balanced flex and deep acoustic sound profile', price: 0 },
  { id: 'aluminum', name: 'CNC Aluminum', color: '#64748b', desc: 'Classic tactile feedback with sturdy stiffness', price: 5 },
]

// 4. KEYCAPS (Layer 1: Keycaps)
const keycaps = [
  { id: 'Lilac', name: 'Lilac Dream', topColor: '#583670', botColor: '#1a0e22', price: 0 },
  { id: 'Carbon', name: 'Carbon Matrix', topColor: '#2b3544', botColor: '#0f172a', price: 10 },
  { id: 'Cream', name: 'Retro Cream', topColor: '#baa77e', botColor: '#352e1f', price: 0 },
  { id: 'Cyber', name: 'Cyberpunk Noir', topColor: '#0284c7', botColor: '#170c28', price: 15 },
]

export default function Designer() {
  const { addToCart } = useShop()
  const navigate = useNavigate()

  // Customization States
  const [caseId, setCaseId] = useState('purple')
  const [switchId, setSwitchId] = useState('blue')
  const [plateId, setPlateId] = useState('brass')
  const [keycapId, setKeycapId] = useState('Lilac')
  const [layout, setLayout] = useState('75%')

  // 3D Assembly & Viewport States
  const [isExploded, setIsExploded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotationPreset, setRotationPreset] = useState('isometric')
  const [zoom, setZoom] = useState(1.0)

  const selectedCase = cases.find(c => c.id === caseId) || cases[0]
  const selectedSwitch = switches.find(s => s.id === switchId) || switches[0]
  const selectedPlate = plates.find(p => p.id === plateId) || plates[0]
  const selectedKeycap = keycaps.find(k => k.id === keycapId) || keycaps[0]

  // Dynamic Price Calculation
  const basePrice = layout === '65%' ? 169 : layout === 'TKL' ? 209 : layout === '100%' ? 239 : 189
  const totalPrice = basePrice + selectedCase.price + selectedSwitch.price + selectedPlate.price + selectedKeycap.price

  // Play Sound Helper
  const handleSelectSwitch = (id) => {
    setSwitchId(id)
    const item = switches.find(option => option.id === id)
    if (item) playSwitchSound(item.sound)
  }

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

  // Camera Presets
  const triggerCameraPreset = (preset) => {
    setRotationPreset(preset)
    if (preset === 'exploded') {
      setIsExploded(true)
    }
  }

  const handleSaveAndCheckout = () => {
    const item = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedCase.name} ${layout} Artisan`,
      type: 'Three.js Modular Keyboard',
      layout,
      caseColor: selectedCase.name,
      caseColorHex: selectedCase.color,
      caseEdgeHex: selectedCase.edge,
      switchType: selectedSwitch.name,
      switchSound: selectedSwitch.sound,
      switchFeel: selectedSwitch.feel,
      switchPlate: selectedPlate.name,
      keycaps: selectedKeycap.name,
      price: totalPrice,
      quantity: 1,
      image: key1
    }
    addToCart(item)
    navigate('/checkout')
  }

  const handleAddToCart = () => {
    const item = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedCase.name} ${layout} Artisan`,
      type: 'Three.js Modular Keyboard',
      layout,
      caseColor: selectedCase.name,
      caseColorHex: selectedCase.color,
      caseEdgeHex: selectedCase.edge,
      switchType: selectedSwitch.name,
      switchSound: selectedSwitch.sound,
      switchFeel: selectedSwitch.feel,
      switchPlate: selectedPlate.name,
      keycaps: selectedKeycap.name,
      price: totalPrice,
      quantity: 1,
      image: key1
    }
    addToCart(item)
  }

  return (
    <div className="designer-page">
      {/* Intro Header */}
      <div className="designer-intro">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> WebGL Three.js PBR Engine / 01</p>
          <h1>Craft your <em>ultimate</em> keyboard.</h1>
        </div>
        <p>
          Inspect all 5 structural layers in true 3D Three.js WebGL space. Separate components, test switch acoustics, and customize every material in real-time.
        </p>
      </div>

      <div className="designer-layout">
        {/* LEFT: 360° Three.js 3D Viewport */}
        <section
          className={`designer-preview ${isFullscreen ? 'is-fullscreen' : ''}`}
          onWheel={(e) => {
            e.preventDefault()
            setZoom(prev => Math.min(1.8, Math.max(0.65, prev - e.deltaY * 0.0012)))
          }}
        >
          {/* Topline Status & HUD Controls */}
          <div className="preview-topline">
            <div className="flex items-center gap-2">
              <span className="preview-status"><i /> Three.js PBR Engine</span>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                | Drag to Rotate 360° • Wheel to Zoom
              </span>
            </div>

            {/* Quick Camera Presets & Explode Button */}
            <div className="viewport-hud-bar">
              <button
                type="button"
                onClick={() => setIsExploded(!isExploded)}
                className={`hud-btn ${isExploded ? 'active' : ''}`}
                title="Separate 5 Structural Layers in 3D"
              >
                <span>💥</span>
                <span>{isExploded ? 'Assemble 3D' : 'Explode Layers'}</span>
              </button>

              <div className="w-[1px] h-3.5 bg-white/20 my-auto"></div>

              <button
                type="button"
                onClick={() => triggerCameraPreset('isometric')}
                className={`hud-btn ${rotationPreset === 'isometric' && !isExploded ? 'active' : ''}`}
                title="Isometric 3D View"
              >
                3D Iso
              </button>
              <button
                type="button"
                onClick={() => triggerCameraPreset('top')}
                className={`hud-btn ${rotationPreset === 'top' ? 'active' : ''}`}
                title="Top-Down View"
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => triggerCameraPreset('side')}
                className={`hud-btn ${rotationPreset === 'side' ? 'active' : ''}`}
                title="Side Profile View"
              >
                Side
              </button>

              <div className="w-[1px] h-3.5 bg-white/20 my-auto"></div>

              {/* Expand / Minimize Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`hud-btn ${isFullscreen ? '!bg-purple-600 !text-white font-bold' : ''}`}
                title="Toggle Fullscreen Inspection"
              >
                {isFullscreen ? '✕ Exit Fullscreen' : '⛶ Expand'}
              </button>
            </div>
          </div>

          {/* Three.js 3D Canvas Mount Container */}
          <div className="relative w-full flex-1 overflow-hidden">
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

            {/* Floating Layer Exploded Labels */}
            {isExploded && (
              <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
                <div className="bg-[#0f0a18]/90 border border-purple-500/40 text-[#e9d5ff] font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  1. Artisan Keycaps: <strong className="text-white">{selectedKeycap.name}</strong>
                </div>
                <div className="bg-[#0f0a18]/90 border border-purple-500/40 text-[#e9d5ff] font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  2. Switches: <strong className="text-white">{selectedSwitch.name} ({selectedSwitch.force})</strong>
                </div>
                <div className="bg-[#0f0a18]/90 border border-purple-500/40 text-[#e9d5ff] font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  3. Switch Plate: <strong className="text-white">{selectedPlate.name}</strong>
                </div>
                <div className="bg-[#0f0a18]/90 border border-purple-500/40 text-[#e9d5ff] font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  4. Hot-Swap PCB & RGB Matrix
                </div>
                <div className="bg-[#0f0a18]/90 border border-purple-500/40 text-[#e9d5ff] font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  5. CNC Chassis: <strong className="text-white">{selectedCase.name}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls & Zoom Slider */}
          <div className="preview-footer">
            <div className="flex items-center gap-3">
              <span className="text-white font-mono text-xs">Zoom: {Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.65, prev - 0.15))}
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                title="Zoom out"
              >
                -
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="text-[10px] text-purple-400 font-mono hover:text-white ml-1"
              >
                Reset Zoom
              </button>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-mono block">Estimated Build Total</span>
              <strong className="text-2xl text-white font-mono font-bold tracking-tight">${totalPrice}</strong>
            </div>
          </div>
        </section>

        {/* RIGHT: Comprehensive 5-Component Modular Customization Panel */}
        <aside className="designer-controls">
          {/* Component 1: Case & Weight */}
          <div className="control-group">
            <div className="control-heading">
              <span>01 / Chassis & CNC Case</span>
              <small>{selectedCase.name} {selectedCase.price > 0 && `(+$${selectedCase.price})`}</small>
            </div>
            <div className="swatch-grid">
              {cases.map(item => (
                <button
                  key={item.id}
                  className={caseId === item.id ? 'selected' : ''}
                  onClick={() => setCaseId(item.id)}
                >
                  <i style={{ background: item.color, borderColor: item.edge }} />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Component 2: Layout */}
          <div className="control-group">
            <div className="control-heading">
              <span>02 / Layout Form Factor</span>
              <small>{layout}</small>
            </div>
            <div className="option-row">
              {['65%', '75%', 'TKL', '100%'].map(item => (
                <button
                  key={item}
                  className={layout === item ? 'selected' : ''}
                  onClick={() => setLayout(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Component 3: Mechanical Switches & Acoustic Test */}
          <div className="control-group">
            <div className="control-heading">
              <span>03 / Mechanical Switches</span>
              <small>{selectedSwitch.name} / {selectedSwitch.force}</small>
            </div>
            <div className="switch-list">
              {switches.map(item => (
                <button
                  key={item.id}
                  className={switchId === item.id ? 'selected' : ''}
                  onClick={() => handleSelectSwitch(item.id)}
                >
                  <i style={{ background: item.color }} />
                  <span>
                    <strong>{item.name} {item.price > 0 && `(+$${item.price})`}</strong>
                    <small>{item.feel} • {item.force}</small>
                  </span>
                  <b className="hover:scale-125 transition-transform" title="Click to hear sound">▶</b>
                </button>
              ))}
            </div>
            <p className="sound-note">▶ Click any switch or play button to listen to acoustic audio preview</p>
          </div>

          {/* Component 4: Switch Plate Material */}
          <div className="control-group">
            <div className="control-heading">
              <span>04 / Switch Mounting Plate</span>
              <small>{selectedPlate.name} {selectedPlate.price > 0 && `(+$${selectedPlate.price})`}</small>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {plates.map(item => (
                <button
                  key={item.id}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    plateId === item.id
                      ? 'border-purple-500 bg-purple-950/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'border-white/10 bg-white/5 text-[#a09ca9] hover:text-white'
                  }`}
                  onClick={() => setPlateId(item.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: item.color }}></span>
                    <strong className="text-xs font-bold text-white">{item.name}</strong>
                  </div>
                  <p className="text-[9px] text-[#8c8296] leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Component 5: Artisan Keycaps */}
          <div className="control-group">
            <div className="control-heading">
              <span>05 / Artisan Keycaps</span>
              <small>{selectedKeycap.name} {selectedKeycap.price > 0 && `(+$${selectedKeycap.price})`}</small>
            </div>
            <div className="option-row">
              {keycaps.map(item => (
                <button
                  key={item.id}
                  className={keycapId === item.id ? 'selected' : ''}
                  onClick={() => setKeycapId(item.id)}
                >
                  <div className="w-4 h-4 rounded-full mx-auto mb-1 border border-white/40" style={{ background: item.topColor }}></div>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6 pt-2">
            <button onClick={handleSaveAndCheckout} className="save-design !mt-0">
              Save & Proceed to Checkout (${totalPrice}) <span>➔</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-full border border-purple-500/40 hover:border-purple-400 text-[#d8b4fe] hover:text-white font-mono text-xs uppercase tracking-wider transition-all bg-white/5 hover:bg-white/10"
            >
              + Add to Cart (${totalPrice})
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
