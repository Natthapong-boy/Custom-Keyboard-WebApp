import React from 'react'

const mock = [{id:'ORD001',status:'Preparing',date:'2026-09-01'},{id:'ORD002',status:'Shipped',date:'2026-09-02'}]

export default function Orders(){
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="space-y-4">
        {mock.map(o=> (
          <div key={o.id} className="bg-gray-900 p-4 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{o.id}</div>
              <div className="text-sm text-gray-300">{o.date}</div>
            </div>
            <div className="text-sm">{o.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
