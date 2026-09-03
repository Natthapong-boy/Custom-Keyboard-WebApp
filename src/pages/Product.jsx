import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Product(){
  const { id } = useParams()
  const nav = useNavigate()
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full h-96 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
          <img src={`/assets/key${(id%3)||1}.jpg`} alt="product" className="object-contain w-full h-full transition-transform duration-700" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Custom Keyboard #{id}</h2>
          <p className="text-gray-300 mb-4">A beautiful custom keyboard you can design.</p>
          <div className="mb-4">Price: <span className="font-bold">$129</span></div>
          <div className="space-x-3">
            <button onClick={()=>nav('/designer')} className="px-4 py-2 bg-primary text-black rounded">Open Designer</button>
            <button className="px-4 py-2 border border-gray-600 rounded">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  )
}
