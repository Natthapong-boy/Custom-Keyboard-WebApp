import Icon from '../common/Icon'
import React, { useState, useEffect } from 'react'
import SwitchVisual from './SwitchVisual'
import { playSwitchSound, stopSwitchSound, playSingleKeypress } from '../../utils/switchAudio'

export default function SwitchSpecsModal({
  isOpen,
  onClose,
  switches = [],
  selectedSwitchId,
  onSelectSwitch,
  playingSwitchId,
  setPlayingSwitchId
}) {
  const [filterType, setFilterType] = useState('all')
  const [lastKeyPressed, setLastKeyPressed] = useState(null)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key.length === 1 || e.key === ' ' || e.key === 'Enter') {
        // Interactive keypress test for the currently selected switch!
        const currentSwitch = switches.find(s => s.id === selectedSwitchId || s._id === selectedSwitchId) || switches[0]
        if (currentSwitch) {
          playSingleKeypress(currentSwitch, e.key === ' ')
          setLastKeyPressed(e.key === ' ' ? 'Spacebar' : e.key.toUpperCase())
          setTimeout(() => setLastKeyPressed(null), 800)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedSwitchId, switches, onClose])

  if (!isOpen) return null

  const filteredSwitches = switches.filter(s => {
    if (filterType === 'all') return true
    return s.type?.toLowerCase() === filterType.toLowerCase()
  })

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

  const handleChooseSwitch = (sw) => {
    onSelectSwitch(sw.id || sw._id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-purple-100 flex items-start justify-between bg-gradient-to-r from-purple-50/70 via-white to-purple-50/30">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
              <span><Icon name="volume" /> Keychron-Style Switch Comparison Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>คู่มือเปรียบเทียบและทดสอบเสียงสวิตช์</span>
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                Switch Sound & Specs
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              เปรียบเทียบแรงกด (Operating Force), โทนเสียง (Sound Profile), ฟีลลิ่งสัมผัส พร้อมกดทดสอบฟังเสียงพิมพ์จริงแบบ Mechanical Keyboard
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-base transition-colors"
            title="ปิดหน้าต่าง (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Category Filters & Quick Guide Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
          {/* Switch Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-purple-100 shadow-2xs">
            {[
              { id: 'all', label: 'ทั้งหมด (All)', icon: 'sparkles' },
              { id: 'linear', label: 'Linear (ลื่นเงียบ)', icon: 'activity' },
              { id: 'tactile', label: 'Tactile (จังหวะป๊อป)', icon: 'activity' },
              { id: 'clicky', label: 'Clicky (คลิกสะใจ)', icon: 'activity' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Icon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Keyboard Test Prompt */}
          <div className="flex items-center gap-2 text-xs bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl">
            <span><Icon name="sparkles" /> ลองกดแป้นพิมพ์ของคุณ:</span>
            {lastKeyPressed ? (
              <span className="font-mono font-bold bg-purple-600 text-white px-2 py-0.5 rounded text-[11px] animate-bounce">
                [{lastKeyPressed}] เสียงเคาะ!
              </span>
            ) : (
              <span className="font-semibold text-purple-700">พิมพ์แป้นใดก็ได้เพื่อลองเสียงสด</span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content: Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Primer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
              <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                <span><Icon name="circleCheck" /> Linear Switch</span>
                <span className="text-[10px] px-1.5 bg-rose-100 rounded text-rose-700">ลื่น เรียบ ไร้รอยต่อ</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                จังหวะเดียว นุ่มมือ ไม่มีแรงสะดุด ตอบสนองไวมาก เหมาะสำหรับเล่นเกม FPS/MOBA และผู้ที่ชอบเสียงเงียบหรือ Thock แน่น
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs">
              <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                <span><Icon name="circleCheck" /> Tactile Switch</span>
                <span className="text-[10px] px-1.5 bg-amber-100 rounded text-amber-700">2 จังหวะ มีแรงสะดุด</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                มีจังหวะสะดุด (Bump) รับรู้จังหวะทำงานได้อย่างแม่นยำ ไม่แข็งเกินไป เสียงก้องกังวานสไตล์ Clack/Pop เหมาะสำหรับพิมพ์งานต่อเนื่อง
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs">
              <div className="font-bold text-sky-800 flex items-center gap-1.5 mb-1">
                <span><Icon name="circleCheck" /> Clicky Switch</span>
                <span className="text-[10px] px-1.5 bg-sky-100 rounded text-sky-700">เสียงคลิก คมชัด</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                มีกลไก Click Leaf ให้เสียงคลิกแหลมใสชัดเจนทุกครั้งที่กด พิมพ์มันส์สะใจ ได้ฟีลลิ่งเครื่องพิมพ์ดีด เหมาะกับผู้ชอบเสียงพิมพ์สะใจ
              </p>
            </div>
          </div>

          {/* Switch Cards Grid (Keychron Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSwitches.map((sw) => {
              const swId = sw.id || sw._id
              const isPlaying = playingSwitchId === swId
              const isCurrentSelected = selectedSwitchId === swId || selectedSwitchId === sw._id || selectedSwitchId === sw.id

              return (
                <div
                  key={swId}
                  className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isCurrentSelected
                      ? 'border-purple-600 bg-purple-50/30 ring-2 ring-purple-200 shadow-md'
                      : 'border-purple-100 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Realistic Switch Graphic / Uploaded Image */}
                      {sw.image && typeof sw.image === 'string' && sw.image.startsWith('/api/products/images') ? (
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 p-1 border border-slate-100 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={sw.image}
                            alt={sw.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <SwitchVisual
                          color={sw.color}
                          size={64}
                          isPlaying={isPlaying}
                          className="bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-2xs shrink-0"
                        />
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                            {sw.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {/* Type Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sw.type === 'Linear'
                                ? 'bg-rose-100 text-rose-700'
                                : sw.type === 'Tactile'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {sw.type || 'Linear'}
                          </span>

                          {/* Sound Profile Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                            <Icon name="volume" /> {sw.soundTone || sw.feel}
                          </span>

                          {sw.lubed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              <Icon name="sparkles" /> Factory Lubed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-purple-700">
                        {sw.price > 0 ? `+฿${Number(sw.price).toLocaleString()}` : 'ฟรี'}
                      </div>
                      {isCurrentSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ กำลังเลือก
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feel Description */}
                  <p className="text-xs text-slate-600 mb-4 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-700">{sw.subText}: </strong>
                    {sw.description || sw.feel}
                  </p>

                  {/* Deep Specs Grid (Keychron Matrix) */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    {/* Operating Force with Gauge */}
                    <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Icon name="sparkles" /> แรงกดทำงาน (Operating Force)
                      </div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">
                        {sw.operatingForce || sw.force || '50gf'}
                      </div>
                      {/* Mini Force Meter Bar */}
                      <div className="w-full bg-purple-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (parseInt(sw.force || sw.operatingForce) / 75) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Pre-travel & Travel */}
                    <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Icon name="activity" /> ระยะการกด (Travel Distance)
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        Pre: {sw.preTravel || '2.0mm'} • Total: {sw.totalTravel || '4.0mm'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        แรงกดสุด: {sw.bottomOut || '62gf'}
                      </div>
                    </div>

                    {/* Suitable for */}
                    <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Icon name="star" /> เหมาะสำหรับการใช้งาน
                      </div>
                      <div className="text-xs font-bold text-purple-900 mt-0.5">
                        {sw.suitableFor || 'Gaming & พิมพ์งานทั่วไป'}
                      </div>
                    </div>

                    {/* Durability / Specs */}
                    <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <Icon name="shield" /> อายุการใช้งาน
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {sw.lifespan || '50,000,000 ครั้ง'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        5-Pin Hot-Swap Compatible
                      </div>
                    </div>
                  </div>

                  {/* Actions: Sound Test & Select Switch */}
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                    {/* Sound Test Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSound(sw)}
                      className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isPlaying
                          ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300'
                          : 'bg-purple-100/90 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <span className="text-sm animate-pulse"><Icon name="sparkles" /></span>
                          <span>กำลังเล่นเสียงพิมพ์...</span>
                          <span className="flex items-end gap-0.5 h-3">
                            <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm"><Icon name="volume" /></span>
                          <span>ทดสอบฟังเสียงพิมพ์ (Sound Test)</span>
                        </>
                      )}
                    </button>

                    {/* Select Switch Button */}
                    <button
                      type="button"
                      onClick={() => handleChooseSwitch(sw)}
                      className={`py-2.5 px-4 rounded-2xl font-bold text-xs transition-all ${
                        isCurrentSelected
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      }`}
                    >
                      {isCurrentSelected ? 'เลือกอยู่' : '✓ เลือกสวิตช์นี้'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ระบบเสียงจำลอง Web Audio API คุณภาพสูง 24-bit mechanical switch sound acoustics</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
