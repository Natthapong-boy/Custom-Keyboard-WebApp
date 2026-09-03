import React from 'react'
import ProductCard from '../ui/ProductCard'

const sample = new Array(6).fill(0).map((_,i)=>({id:i+1,title:`Custom Keyset ${i+1}`,price:99+ i*10, img:`/assets/key${(i%3)+1}.jpg`}))

export default function Home(){
  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold mb-6">Featured</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sample.map(p=> <ProductCard key={p.id} product={p}/>)}
      </div>
    </div>
  )
}
