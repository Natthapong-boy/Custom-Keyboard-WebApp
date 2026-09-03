import React, { useState } from 'react'

export default function Designer(){
  const [design, setDesign] = useState({bg:'#ffffff',accent:'#6D28D9'})
  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Keyboard Designer</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="w-full h-96 bg-gradient-to-b from-gray-900 to-gray-800 rounded flex items-center justify-center">
            <div style={{width:420,height:160,background:design.bg,borderRadius:12}} className="transform transition-transform duration-300 hover:scale-105">
              <div style={{padding:12,color:design.accent}}>Preview area</div>
            </div>
          </div>
        </div>
        <aside>
          <div className="bg-gray-900 p-4 rounded">
            <label className="block mb-2">Background</label>
            <input type="color" value={design.bg} onChange={e=>setDesign({...design,bg:e.target.value})} className="w-full h-10" />
            <label className="block mt-3 mb-2">Accent</label>
            <input type="color" value={design.accent} onChange={e=>setDesign({...design,accent:e.target.value})} className="w-full h-10" />
            <div className="mt-4">
              <button className="px-4 py-2 bg-primary text-black rounded">Save Design</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
