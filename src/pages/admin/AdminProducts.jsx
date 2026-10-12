import React, { useState, useEffect } from 'react'
import { useShop } from '../../context/ShopContext'

// Custom confirmation dialog component
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 28px 22px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          border: '1px solid #EDE9FE'
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>ยืนยันการลบสินค้า</h3>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: 12,
              background: '#EF4444', color: '#FFF',
              fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer'
            }}
          >
            ลบสินค้า
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 12,
              background: '#F1F5F9', color: '#475569',
              fontWeight: 600, fontSize: 13, border: '1px solid #E2E8F0', cursor: 'pointer'
            }}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom error alert component
function ErrorAlert({ message, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 28px 22px',
          maxWidth: 360,
          width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          border: '1px solid #FEE2E2'
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>เกิดข้อผิดพลาด</h3>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', borderRadius: 12,
            background: '#F1F5F9', color: '#475569',
            fontWeight: 700, fontSize: 13, border: '1px solid #E2E8F0', cursor: 'pointer'
          }}
        >
          ปิด
        </button>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { products, loadingProducts, addProduct, editProduct, removeProduct, refreshProducts } = useShop()

  useEffect(() => {
    // Always load all products for the management page, unaffected by storefront filters
    refreshProducts()
  }, [refreshProducts])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Custom Keyboard',
    layout: '75%',
    price: '',
    stock: 15,
    switchType: 'Gateron Oil King (Linear)',
    image: '',
    description: ''
  })

  const openAddModal = () => {
    setEditingProduct(null)
    setSelectedFileName('')
    setFormData({
      name: '',
      category: 'Custom Keyboard',
      layout: '75%',
      price: '',
      stock: 15,
      switchType: 'Gateron Oil King (Linear)',
      image: '',
      description: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setSelectedFileName('')
    setFormData({
      name: product.name,
      category: product.category,
      layout: product.layout || '75%',
      price: product.price,
      stock: product.stock,
      switchType: product.switchType || '',
      image: product.image,
      description: product.description || ''
    })
    setIsModalOpen(true)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const rawResult = uploadEvent.target.result
        const img = new Image()
        img.onload = () => {
          try {
            // 1. วาดลง Source Canvas เพื่อวิเคราะห์พิกเซล
            const origW = img.width
            const origH = img.height

            // กำหนดขนาดสูงสุดสำหรับการวิเคราะห์เพื่อความรวดเร็วและประหยัดแรม
            const maxAnalysisDim = 1400
            let scaleAnalysis = 1
            if (origW > maxAnalysisDim || origH > maxAnalysisDim) {
              scaleAnalysis = Math.min(maxAnalysisDim / origW, maxAnalysisDim / origH)
            }
            const srcW = Math.round(origW * scaleAnalysis)
            const srcH = Math.round(origH * scaleAnalysis)

            const srcCanvas = document.createElement('canvas')
            srcCanvas.width = srcW
            srcCanvas.height = srcH
            const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })
            srcCtx.drawImage(img, 0, 0, srcW, srcH)

            // 2. Auto-Trim: ตรวจจับขอบโปร่งแสงและตัดพื้นที่ว่างรอบนอกออกอัตโนมัติ
            const imgData = srcCtx.getImageData(0, 0, srcW, srcH)
            const pixels = imgData.data

            let minX = srcW, minY = srcH, maxX = -1, maxY = -1

            for (let y = 0; y < srcH; y++) {
              for (let x = 0; x < srcW; x++) {
                const idx = (y * srcW + x) * 4
                const alpha = pixels[idx + 3]
                // หากพิกเซลมีความทึบแสง (มีเนื้อภาพ)
                if (alpha > 15) {
                  if (x < minX) minX = x
                  if (x > maxX) maxX = x
                  if (y < minY) minY = y
                  if (y > maxY) maxY = y
                }
              }
            }

            // หากไม่พบพิกเซลทึบแสง (รูปว่าง) ให้ใช้ขนาดภาพเดิม
            if (maxX < minX || maxY < minY) {
              minX = 0
              minY = 0
              maxX = srcW - 1
              maxY = srcH - 1
            }

            // 3. ปรับสเกลให้ออกมาเป็นสัดส่วนของตัวสินค้าจริงที่มีความคมชัดสูง
            const rawW = maxX - minX + 1
            const rawH = maxY - minY + 1
            const pad = Math.max(4, Math.round(Math.max(rawW, rawH) * 0.02))

            const cropX = Math.max(0, minX - pad)
            const cropY = Math.max(0, minY - pad)
            const cropW = Math.min(srcW - cropX, rawW + pad * 2)
            const cropH = Math.min(srcH - cropY, rawH + pad * 2)

            // หากเป็นรูปขนาดเล็ก ให้ขยายขนาดขึ้นมาให้คมชัด (ความกว้างอย่างน้อย 1000px)
            const targetMinDim = 1000
            let scaleOut = 1
            if (cropW < targetMinDim && cropH < targetMinDim) {
              scaleOut = Math.min(targetMinDim / cropW, targetMinDim / cropH)
            }
            const outW = Math.round(cropW * scaleOut)
            const outH = Math.round(cropH * scaleOut)

            const outCanvas = document.createElement('canvas')
            outCanvas.width = outW
            outCanvas.height = outH
            const outCtx = outCanvas.getContext('2d')

            outCtx.imageSmoothingEnabled = true
            outCtx.imageSmoothingQuality = 'high'
            outCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

            const finalDataUrl = outCanvas.toDataURL('image/png')
            setFormData(prev => ({ ...prev, image: finalDataUrl }))
          } catch (err) {
            console.error('Auto-trim processing error:', err)
            setFormData(prev => ({ ...prev, image: rawResult }))
          }
        }
        img.onerror = () => {
          setFormData(prev => ({ ...prev, image: rawResult }))
        }
        img.src = rawResult
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.image) {
      alert('กรุณาเลือกไฟล์รูปภาพสินค้า (.png)')
      return
    }
    setSaving(true)
    try {
      if (editingProduct) {
        await editProduct(editingProduct._id, formData)
        setToast(`แก้ไขข้อมูล "${formData.name}" เรียบร้อยแล้ว`)
      } else {
        await addProduct(formData)
        setToast(`เพิ่มสินค้าใหม่ "${formData.name}" เข้าคลังเรียบร้อยแล้ว`)
      }
      setIsModalOpen(false)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setErrorMsg(`บันทึกไม่สำเร็จ: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = (id, name) => {
    setConfirmDelete({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    const { id, name } = confirmDelete
    setConfirmDelete(null)
    try {
      await removeProduct(id)
      setToast(`ลบสินค้า "${name}" ออกจากระบบเรียบร้อย`)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setErrorMsg(`ลบไม่สำเร็จ: ${err.message}`)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <span className="text-emerald-400">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          message={`คุณต้องการลบสินค้า "${confirmDelete.name}" ออกจากระบบใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Custom Error Dialog */}
      {errorMsg && (
        <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <span>⌨️ จัดการสินค้าโดยพนักงานร้าน</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            จัดการสินค้าในคลัง (เพิ่ม / แก้ไข / ลบ)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            เพิ่ม แก้ไข หรือลบสินค้า — การเปลี่ยนแปลงจะแสดงที่หน้าร้านค้าทันที
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          <span>เพิ่มสินค้าใหม่เข้าคลัง</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 bg-white text-xs focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Products Table */}
      {loadingProducts ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">รูปสินค้า</th>
                  <th className="py-3.5 px-4">ชื่อสินค้า</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4">Layout</th>
                  <th className="py-3.5 px-4">ราคา (บาท)</th>
                  <th className="py-3.5 px-4">คงเหลือ</th>
                  <th className="py-3.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={prod.image}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-100"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {prod.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-700">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {prod.layout || '-'}
                    </td>
                    <td className="py-3 px-4 font-black text-purple-700 text-sm">
                      ฿{Number(prod.price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        prod.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {prod.stock} ชิ้น
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(prod._id, prod.name)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                      >
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Product Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่เข้าคลัง'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">หมวดหมู่ *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                  >
                    <option value="Custom Keyboard">Custom Keyboard</option>
                    <option value="Switches">Switches</option>
                    <option value="Keycaps">Keycaps</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">ขนาด Layout</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                  >
                    <option value="60%">60%</option>
                    <option value="65%">65%</option>
                    <option value="75%">75%</option>
                    <option value="TKL (80%)">TKL (80%)</option>
                    <option value="Full Size (100%)">Full Size (100%)</option>
                    <option value="Alice / Ergo">Alice / Ergo</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">ราคา (บาท) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">จำนวนสต็อก *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">ประเภทสวิตช์ / สเปก</label>
                <input
                  type="text"
                  value={formData.switchType}
                  onChange={(e) => setFormData({ ...formData, switchType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  ไฟล์รูปภาพสินค้า (.png) *
                </label>
                <div>
                  {/* ซ่อน native file input */}
                  <input
                    id="product-image-upload"
                    type="file"
                    accept=".png,image/png"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {/* กล่องสี่เหลี่ยมรอยประ: แสดงรูปพอดีกับกรอบ มีระยะขอบสมดุล ไม่ล้น ไม่โดนตัดขอบ */}
                  <label
                    htmlFor="product-image-upload"
                    className="flex items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/20 hover:bg-purple-100/30 hover:border-purple-400 transition-all cursor-pointer overflow-hidden group p-2.5"
                  >
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Product Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/void-artisan-75.png'
                        }}
                        className="w-full h-full object-contain rounded-xl drop-shadow-xs"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-2.5 text-purple-700 font-bold text-xs py-4">
                        <span className="text-base group-hover:scale-110 transition-transform">📁</span>
                        <span>เลือกไฟล์รูปภาพ (.png)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : '✓ บันทึกข้อมูลสินค้า'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
