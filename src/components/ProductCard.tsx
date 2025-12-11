'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  description?: string
}

export default function ProductCard({ id, name, price, image, description }: ProductCardProps) {
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = () => {
    addToCart({ id, name, price, image }, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition">
      <div className="relative h-48 w-full">
        <Image 
          src={image} 
          alt={name} 
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>
        )}
        <p className="text-red-600 font-bold text-xl mt-2">LKR {price?.toFixed(2) || '0.00'}</p>
        
        <div className="mt-4 space-y-2">
          <button 
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`w-full py-2 rounded-lg font-medium transition ${
              addedToCart 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {addedToCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
          </button>
          
          <Link 
            href={`/product/${id}`}
            className="block w-full py-2 text-center border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
          >
            👁️ View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
