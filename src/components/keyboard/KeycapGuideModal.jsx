import React, { useState, useEffect } from 'react'
import Icon from '../common/Icon'
import ProductImage from '../common/ProductImage'

// Helper to deduce profile/material from keycap name/description
export function getProfileFromKeycap(keycap) {
  const text = `${keycap.name || ''} ${keycap.description || ''}`.toUpperCase()
  if (text.includes('SA') || text.includes('VINTAGE') || text.includes('พิมพ์ดีด')) return 'SA'
  if (text.includes('XDA') || text.includes('SHIRO') || text.includes('FLAT')) return 'XDA'
  if (text.includes('OEM') || text.includes('CARBON') || text.includes('CYBER') || text.includes('PUDDING')) return 'OEM'
  return 'Cherry'
}

export default function KeycapGuideModal({
  isOpen,
  onClose,
  keycaps = [],
  selectedKeycapId,
  onSelectKeycap
}) {
  const [filterProfile, setFilterProfile] = useState('all')

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Filter keycaps based on tab
  const filteredKeycaps = keycaps.filter(k => {
    if (filterProfile === 'all') return true
    const prof = getProfileFromKeycap(k).toLowerCase()
    return prof === filterProfile.toLowerCase()
  })

  const handleChooseKeycap = (k) => {
    onSelectKeycap(k.id || k._id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-6 border-b border-purple-100 flex items-start justify-between bg-gradient-to-r from-purple-50/70 via-white to-purple-50/30">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
              <Icon name="layers" />
              <span>Keycap Materials Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>คู่มือเปรียบเทียบวัสดุคีย์แคป</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              เปรียบเทียบวัสดุคีย์แคป
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (ESC)"
          >
            ✕
          </button>
        </div>

        {/* 2. Filter Tabs (วัสดุ Cherry, วัสดุ OEM, วัสดุ SA, วัสดุ XDA) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-b border-purple-100 flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-purple-100 shadow-2xs overflow-x-auto">
            {[
              { id: 'all', label: 'ทั้งหมด (All)', icon: 'sparkles' },
              { id: 'cherry', label: 'วัสดุ Cherry', icon: 'layers' },
              { id: 'oem', label: 'วัสดุ OEM', icon: 'layers' },
              { id: 'sa', label: 'วัสดุ SA', icon: 'layers' },
              { id: 'xda', label: 'วัสดุ XDA', icon: 'layers' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterProfile(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  filterProfile === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Icon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Content: Primer Cards + Keycap Sets Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 3. Quick Primer Cards (Cherry Material, SA Material, XDA Material without height numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs">
              <div className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                <Icon name="circleCheck" />
                <span>Cherry Material</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                ความสูงระดับกลาง-เตี้ย ออกแบบให้สโลปเอียงรับแนวข้อนิ้วมือ พิมพ์สบาย ไม่เมื่อยข้อมือ ตอบสนองฉับไว นิยมที่สุดในหมู่นักแข่งเกม
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Icon name="circleCheck" />
                <span>SA Material</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                ทรงสูงหลุมกลมเว้าลึก สไตล์เครื่องพิมพ์ดีดเรโทร ช่องว่างภายในตัวคีย์แคปใหญ่ ให้เสียงทุ้มแน่น Thock ทรงพลังและดังก้องกังวานสะใจ
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
              <div className="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                <Icon name="circleCheck" />
                <span>XDA Material</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                ความสูงเท่ากันทุกแถว หน้าสัมผัสปุ่มทรงมนกว้าง วางนิ้วสบาย ไม่ต้องปรับตัวกับความต่างระดับแถว สลับปุ่มตำแหน่งใดก็ได้
              </p>
            </div>
          </div>

          {/* 4. Keycaps Cards Grid - Fixed 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            {filteredKeycaps.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-purple-50/30 rounded-3xl border border-dashed border-purple-200">
                <Icon name="package" size={40} className="mx-auto text-purple-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">ไม่พบคีย์แคปในหมวดหมู่นี้</p>
                <p className="text-xs text-slate-400 mt-1">โปรดเลือกดูหมวดหมู่วัสดุอื่น หรือดูรายการทั้งหมด</p>
              </div>
            )}

            {filteredKeycaps.map((k) => {
              const kId = k.id || k._id
              const isCurrentSelected = selectedKeycapId === kId || selectedKeycapId === k.id || selectedKeycapId === k._id

              return (
                <div
                  key={kId}
                  className={`group relative p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isCurrentSelected
                      ? 'border-purple-600 bg-purple-50/20 ring-2 ring-purple-200 shadow-md'
                      : 'border-purple-100 bg-white hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header: Keycap Name only on left, Price & Selected badge on right */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {k.name}
                      </h3>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-purple-700">
                          {k.price > 0 ? `+฿${Number(k.price).toLocaleString()}` : '+฿200'}
                        </div>
                        {isCurrentSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                            ✓ กำลังเลือก
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Image Section replacing the description boxes */}
                    <div className="relative aspect-video sm:aspect-16/10 w-full rounded-2xl overflow-hidden bg-purple-50/60 my-2 flex items-center justify-center p-3 border border-purple-100/70 transition-colors group-hover:border-purple-200">
                      <ProductImage
                        src={k.image || '/images/key1.jpg'}
                        alt={k.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        imageClassName="w-full h-full object-contain drop-shadow-xs"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Action: Select Button */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-100 mt-2">
                    <div className="text-xs text-slate-500">
                      {isCurrentSelected ? 'คุณกำลังใช้เซ็ตคีย์แคปนี้' : 'คลิกเพื่อเลือกติดตั้งเซ็ตนี้'}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleChooseKeycap(k)}
                      className={`py-2 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                        isCurrentSelected
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow'
                      }`}
                      title={isCurrentSelected ? 'คลิกเพื่อยกเลิกการเลือกคีย์แคปนี้' : `เลือก ${k.name}`}
                    >
                      {isCurrentSelected ? '✕ ยกเลิกการเลือก' : '✓ เลือกคีย์แคปนี้'}
                    </button>
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
