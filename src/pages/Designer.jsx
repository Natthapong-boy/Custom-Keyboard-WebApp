import React, { useState } from 'react'

const cases = [
  { id: 'purple', name: 'Purple', color: '#5b237d', edge: '#a855f7' },
  { id: 'blue', name: 'Blue', color: '#173a73', edge: '#4f9cff' },
  { id: 'red', name: 'Red', color: '#722535', edge: '#f05b72' },
  { id: 'brown', name: 'Brown', color: '#68452f', edge: '#d69462' },
]

const switches = [
  { id: 'blue', name: 'Blue', feel: 'Clicky / tactile', force: '60g', sound: 'click', color: '#4f9cff', description: 'Crisp click with a clear tactile bump.' },
  { id: 'red', name: 'Red', feel: 'Smooth / linear', force: '45g', sound: 'linear', color: '#f05b72', description: 'Quiet, smooth and fast from top to bottom.' },
  { id: 'brown', name: 'Brown', feel: 'Soft / tactile', force: '55g', sound: 'soft', color: '#d69462', description: 'A gentle bump with a warm, muted sound.' },
]

function playSwitchSound(type) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  const context = new AudioContext()
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type === 'click' ? 'square' : 'triangle'
  oscillator.frequency.setValueAtTime(type === 'click' ? 260 : type === 'linear' ? 145 : 190, now)
  oscillator.frequency.exponentialRampToValueAtTime(type === 'click' ? 90 : 70, now + (type === 'linear' ? .09 : .055))
  gain.gain.setValueAtTime(.0001, now)
  gain.gain.exponentialRampToValueAtTime(type === 'click' ? .16 : .1, now + .004)
  gain.gain.exponentialRampToValueAtTime(.0001, now + (type === 'linear' ? .12 : .075))
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + .13)
  oscillator.addEventListener('ended', () => context.close())
}

export default function Designer() {
  const [caseId, setCaseId] = useState('purple')
  const [switchId, setSwitchId] = useState('blue')
  const [layout, setLayout] = useState('75%')
  const [keycap, setKeycap] = useState('Lilac')
  const selectedCase = cases.find(item => item.id === caseId)
  const selectedSwitch = switches.find(item => item.id === switchId)

  const selectSwitch = (id) => {
    setSwitchId(id)
    const item = switches.find(option => option.id === id)
    playSwitchSound(item.sound)
  }

  return (
    <div className="designer-page">
      <div className="designer-intro">
        <div><p className="eyebrow">The configurator / 01</p><h1>Build your <em>daily</em> driver.</h1></div>
        <p>Choose every detail, then listen to the switch before you commit. Your keyboard should sound as good as it feels.</p>
      </div>
      <div className="designer-layout">
        <section className="designer-preview">
          <div className="preview-topline"><span>Live preview</span><span className="preview-status"><i /> Ready to build</span></div>
          <div className="custom-keyboard" style={{ '--case': selectedCase.color, '--edge': selectedCase.edge, '--switch': selectedSwitch.color }}>
            <div className="custom-keyboard-top"><span>KEY CRAFT / {layout}</span><b>{selectedSwitch.name.toUpperCase()}</b></div>
            <div className="custom-key-grid">
              {Array.from({ length: layout === '65%' ? 48 : layout === 'TKL' ? 72 : 60 }).map((_, index) => <i key={index} className={index % 11 === 0 ? 'lit-key' : ''} />)}
            </div>
            <div className="custom-keyboard-side" />
          </div>
          <div className="preview-footer"><span>Drag to rotate</span><strong>${layout === '65%' ? 169 : layout === 'TKL' ? 209 : 189}</strong></div>
        </section>
        <aside className="designer-controls">
          <div className="control-group"><div className="control-heading"><span>01 / Case</span><small>{selectedCase.name}</small></div><div className="swatch-grid">{cases.map(item => <button key={item.id} className={caseId === item.id ? 'selected' : ''} onClick={() => setCaseId(item.id)}><i style={{ background: item.color, borderColor: item.edge }} />{item.name}</button>)}</div></div>
          <div className="control-group"><div className="control-heading"><span>02 / Layout</span><small>{layout}</small></div><div className="option-row">{['65%', '75%', 'TKL'].map(item => <button key={item} className={layout === item ? 'selected' : ''} onClick={() => setLayout(item)}>{item}</button>)}</div></div>
          <div className="control-group"><div className="control-heading"><span>03 / Switch</span><small>{selectedSwitch.name} / {selectedSwitch.force}</small></div><div className="switch-list">{switches.map(item => <button key={item.id} className={switchId === item.id ? 'selected' : ''} onClick={() => selectSwitch(item.id)}><i style={{ background: item.color }} /><span><strong>{item.name}</strong><small>{item.feel}</small></span><b>▶</b></button>)}</div><p className="sound-note">▶ Click a switch to hear its sound preview</p></div>
          <div className="control-group"><div className="control-heading"><span>04 / Keycaps</span><small>{keycap}</small></div><div className="option-row">{['Lilac', 'Carbon', 'Cream'].map(item => <button key={item} className={keycap === item ? 'selected' : ''} onClick={() => setKeycap(item)}>{item}</button>)}</div></div>
          <button className="save-design">Save this configuration <span>↗</span></button>
        </aside>
      </div>
    </div>
  )
}
