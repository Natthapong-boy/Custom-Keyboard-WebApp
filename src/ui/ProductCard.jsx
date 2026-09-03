import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({product}){
  const nav = useNavigate()
  return (
    <div onClick={()=>nav(`/product/${product.id}`)} className="group bg-gradient-to-b from-[#0f1724] to-[#081024] p-4 rounded-lg cursor-pointer transform transition-transform duration-500 hover:scale-105">
      <div className="w-full h-48 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
        <img src={product.img} alt={product.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-sm text-gray-300">${product.price}</div>
        </div>
        <button className="px-3 py-1 bg-primary text-black rounded">Buy</button>
      </div>
    </div>
  )
}
