import React from 'react'
import { Link } from 'react-router-dom'

export default function Checkout(){
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <div className="bg-gray-900 p-4 rounded">
        <div className="mb-4">Shipping info (mock)</div>
        <div className="mb-4">Payment (mock)</div>
        <div className="flex justify-end">
          <Link to="/orders" className="px-4 py-2 bg-primary text-black rounded">Place Order</Link>
        </div>
      </div>
    </div>
  )
}
