import React from 'react'
import { Link } from 'react-router-dom'

export default function Cart(){
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      <div className="bg-gray-900 p-4 rounded">
        <div className="flex justify-between mb-2">
          <div>Custom Keyboard x1</div>
          <div>$129</div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link to="/checkout" className="px-4 py-2 bg-primary text-black rounded">Checkout</Link>
        </div>
      </div>
    </div>
  )
}
