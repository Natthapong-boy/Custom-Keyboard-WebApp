import React, { useState } from 'react'
import { useShop } from '../../context/ShopContext'

export default function AdminProducts() {
  const { products, loadingProducts, addProduct, editProduct, removeProduct } = useShop()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Custom Keyboard',
    layout: '75%',
    price: '',
    stock: 15,
    switchType: 'Gateron Oil King (Linear)',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    description: ''
  })

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: 'Custom Keyboard',
      layout: '75%',
      price: '',
      stock: 15,
      switchType: 'Gateron Oil King (Linear)',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      description: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
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

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingProduct) {
        await editProduct(editingProduct._id, formData)
        setToast(`แก้ไขข้อมูล "${formData.name}" เรียบร้อยแล้ว`)
      } else {
        await addProduct(formData)
        setToast(`เพิ่มสินค้าใหม่ "${formData.name}" ลงฐานข้อมูลเรียบร้อยแล้ว`)
      }
      setIsModalOpen(false)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      alert(`บันทึกไม่สำเร็จ: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}" ออกจากฐานข้อมูล?`)) {
      try {
        await removeProduct(id)
        setToast(`ลบสินค้า "${name}" ออกจากระบบเรียบร้อย`)
        setTimeout(() => setToast(null), 3000)
      } catch (err) {
        alert(`ลบไม่สำเร็จ: ${err.message}`)
      }
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <span>⌨️ สิทธิ์พนักงานร้าน (Staff Product Management per Diagram 2)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            จัดการแคตตาล็อกสินค้า (เพิ่ม / แก้ไข / ลบ)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            เชื่อมต่อกับฐานข้อมูล MongoDB Atlas เรียลไทม์ ทุกการเปลี่ยนแปลงจะแสดงที่หน้าร้านค้าทันที
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          <span>เพิ่มข้อมูลสินค้าใหม่</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="ค้นหาสินค้าในแคตตาล็อก..."
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
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <img src={prod.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-purple-100" />
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
                        onClick={() => handleDelete(prod._id, prod.name)}
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
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่เข้าแคตตาล็อก'}
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
                  <label className="block font-bold text-slate-600 mb-1">จำนวนสต็อกในคลัง *</label>
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
                <label className="block font-bold text-slate-600 mb-1">URL รูปภาพสินค้า *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/20 text-sm"
                />
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
                  {saving ? 'กำลังบันทึกลง MongoDB...' : '✓ บันทึกข้อมูลสินค้า'}
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
