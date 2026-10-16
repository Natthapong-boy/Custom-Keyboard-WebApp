import React, { useState, useEffect } from 'react'
import Icon from '../common/Icon'
import ProductImage from '../common/ProductImage'

export default function PlateGuideModal({
  isOpen,
  onClose,
  plates = [],
  selectedPlateId,
  onSelectPlate
}) {
  const [filterCategory, setFilterCategory] = useState('all')

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

  // Filter plates based on selected tab: all, soft, stiff
  const filteredPlates = plates.filter(p => {
    if (filterCategory === 'all') return true
    return p.category === filterCategory
  })

  const handleChoosePlate = (plate) => {
    onSelectPlate(plate.id || plate._id)
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
              <span>Plate Materials Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>คู่มือเปรียบเทียบวัสดุเพลต</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              เปรียบเทียบสัมผัสการพิมพ์และโทนเสียงของวัสดุเพลตแต่ละชนิด
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

        {/* 2. Filter Tabs (ทั้งหมด, วัสดุแบบนุ่ม, วัสดุแบบแข็ง) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-b border-purple-100 flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-purple-100 shadow-2xs overflow-x-auto">
            {[
              { id: 'all', label: 'ทั้งหมด (All)', icon: 'sparkles' },
              { id: 'soft', label: 'วัสดุแบบนุ่ม (Soft/Flexible)', icon: 'box' },
              { id: 'stiff', label: 'วัสดุแบบแข็ง (Stiff/Rigid)', icon: 'shield' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  filterCategory === tab.id
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

        {/* Modal Scrollable Content: Primer Cards + Plates Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 3. Quick Primer Comparison Cards (Soft vs Stiff) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs">
              <div className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                <Icon name="circleCheck" />
                <span>วัสดุแบบนุ่ม (Soft / Flexible: PC, POM, FR4)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                สัมผัสยืดหยุ่น ซับแรงกระแทกได้ยอดเยี่ยม ช่วยลดอาการเมื่อยนิ้วเมื่อพิมพ์เวลานาน ให้โทนเสียงทุ้มแน่น นุ่มละมุน (Thock)
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Icon name="circleCheck" />
                <span>วัสดุแบบแข็ง (Stiff / Rigid: Aluminum, Brass, Carbon, Steel)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                โครงสร้างแข็งแกร่ง มั่นคง ไม่ยวบ ตอบสนองแม่นยำทุกจังหวะกด ให้โทนเสียงสะท้อนคมใส กังวาน ชัดเจน (Clack)
              </p>
            </div>
          </div>

          {/* 4. Plates Cards Grid - Fixed 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            {filteredPlates.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-purple-50/30 rounded-3xl border border-dashed border-purple-200">
                <Icon name="package" size={40} className="mx-auto text-purple-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">ไม่พบวัสดุเพลตในหมวดหมู่นี้</p>
                <p className="text-xs text-slate-400 mt-1">โปรดเลือกดูหมวดหมู่อื่น หรือดูรายการทั้งหมด</p>
              </div>
            )}

            {filteredPlates.map((plate) => {
              const pId = plate.id || plate._id
              const isCurrentSelected = selectedPlateId === pId || selectedPlateId === plate.id || selectedPlateId === plate._id

              return (
                <div
                  key={pId}
                  className={`group relative p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isCurrentSelected
                      ? 'border-purple-600 bg-purple-50/20 ring-2 ring-purple-200 shadow-md'
                      : 'border-purple-100 bg-white hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header: Plate Name & Description on left, Price & Selected badge on right */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                          {plate.name}
                        </h3>
                        {/* Short description underneath name */}
                        <p className="text-xs text-purple-700/80 font-medium mt-1 leading-relaxed">
                          {plate.desc || plate.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-purple-700">
                          {plate.price > 0 ? `+฿${Number(plate.price).toLocaleString()}` : '+฿200'}
                        </div>
                        {isCurrentSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                            ✓ กำลังเลือก
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Image Section */}
                    <div className="relative aspect-video sm:aspect-16/10 w-full rounded-2xl overflow-hidden bg-purple-50/60 my-2 flex items-center justify-center p-3 border border-purple-100/70 transition-colors group-hover:border-purple-200">
                      <ProductImage
                        src={plate.image || '/images/key2.jpg'}
                        alt={plate.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        imageClassName="w-full h-full object-contain drop-shadow-xs"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Action: Select Button */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-100 mt-2">
                    <div className="text-xs text-slate-500">
                      {isCurrentSelected ? 'คุณกำลังใช้เพลตนี้' : 'คลิกเพื่อเลือกติดตั้งเพลตนี้'}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleChoosePlate(plate)}
                      className={`py-2 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                        isCurrentSelected
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow'
                      }`}
                      title={isCurrentSelected ? 'คลิกเพื่อยกเลิกการเลือกเพลตนี้' : `เลือก ${plate.name}`}
                    >
                      {isCurrentSelected ? '✕ ยกเลิกการเลือก' : '✓ เลือกเพลตนี้'}
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
