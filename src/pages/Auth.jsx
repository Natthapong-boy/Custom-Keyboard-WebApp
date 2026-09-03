import React from 'react'

export default function Auth(){
  return (
    <div className="py-12 max-w-md mx-auto">
      <div className="bg-gray-900 p-6 rounded">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>
        <button className="w-full mb-3 px-4 py-2 bg-white text-black rounded">Continue with Google (mock)</button>
        <div className="border-t border-gray-700 my-4"></div>
        <form>
          <input className="w-full mb-3 p-2 rounded bg-gray-800" placeholder="Email" />
          <input className="w-full mb-3 p-2 rounded bg-gray-800" placeholder="Password" type="password" />
          <button className="w-full px-4 py-2 bg-primary text-black rounded">Sign in</button>
        </form>
      </div>
    </div>
  )
}
