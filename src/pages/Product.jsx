import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { fetchProductById } from '../services/api'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, addToCart } = useShop()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Look up in loaded products first, or fetch directly by ID from MongoDB
    const found = products.find((p) => p._id === id)
    if (found) {
      setProduct(found)
      setLoading(false)
    } else {
      fetchProductById(id)
        .then((data) => {
          if (data) setProduct(data)
        })
        .finally(() => setLoading(false))
    }
  }, [id, products])

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product._id,
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      layout: product.layout,
      switchType: product.switchType,
      quantity
    })
    setToast(`เพิ่ม ${quantity} ชิ้น ลงในตะกร้าเรียบร้อย`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลสินค้าจาก MongoDB...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <span className="text-4xl block mb-3">⚠️</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">ไม่พบสินค้านี้ในระบบ</h2>
        <p className="text-sm text-slate-500 mb-6">สินค้าอาจถูกลบหรือรหัสสินค้าไม่ถูกต้อง</p>
        <Link to="/" className="btn-primary">
          กลับไปหน้าแรก
        </Link>
      </div>
    )
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

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-purple-600 transition-colors">หน้าแรก</Link>
        <span>/</span>
        <span className="text-purple-600 font-bold">{product.category}</span>
        <span>/</span>
        <span className="text-slate-700 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Product Gallery (Left) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-purple-50/50 mb-4 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
            />
            {product.layout && product.layout !== 'N/A' && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 text-purple-700 shadow-sm border border-purple-100">
                Layout {product.layout}
              </span>
            )}
          </div>

          {/* Sub images if present */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl overflow-hidden border border-purple-100 cursor-pointer hover:border-purple-400"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details (Right) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {product.brand || 'Key Craft Labs'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.stock > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {product.stock > 0 ? `สต็อก: ${product.stock} ชิ้น` : 'สินค้าหมด'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {product.description || 'คีย์บอร์ดคัสตอมคุณภาพสูง ปรับแต่งและจูนเสียงระดับมืออาชีพ'}
              </p>
            </div>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">ราคาจำหน่าย</span>
                <div className="text-3xl font-black text-purple-700">
                  ฿{Number(product.price).toLocaleString()}
                </div>
              </div>
              {product.compareAtPrice > product.price && (
                <div className="text-sm line-through text-slate-400 font-semibold">
                  ฿{Number(product.compareAtPrice).toLocaleString()}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                จำนวนที่ต้องการสั่งซื้อ
              </span>
              <div className="flex items-center border border-purple-200 rounded-full bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-purple-50 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-purple-50 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons according to Diagram 3 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                สั่งซื้อทันที (฿{(Number(product.price) * quantity).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 font-bold text-sm transition-all disabled:opacity-50"
              >
                + เพิ่มลงตะกร้า
              </button>
            </div>

            {/* Link to 3D Custom Designer */}
            <div className="pt-2 border-t border-purple-100">
              <Link
                to="/designer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors"
              >
                <span>🛠️</span>
                <span>ต้องการปรับแต่งเลือกสวิตช์และคีย์แคปเอง? เข้าสู่ Custom Builder</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Detailed Specifications Table */}
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              ข้อมูลจำเพาะ (Specifications)
            </h3>
            <div className="divide-y divide-purple-50 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">ขนาด Layout:</span>
                <span className="font-semibold text-slate-800">{product.layout || '75%'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">ประเภทสวิตช์:</span>
                <span className="font-semibold text-slate-800">{product.switchType || 'Mechanical'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">โครงสร้างตัวเรือน:</span>
                <span className="font-semibold text-slate-800">{product.caseMaterial || 'CNC Aluminum'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Mount Type:</span>
                <span className="font-semibold text-slate-800">{product.mountType || 'Gasket Mount'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Hot-Swappable:</span>
                <span className="font-semibold text-emerald-600">✓ รองรับ 5-Pin & 3-Pin</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">การเชื่อมต่อ:</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(product.connectivity) ? product.connectivity.join(', ') : 'Type-C Wired / Tri-Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
