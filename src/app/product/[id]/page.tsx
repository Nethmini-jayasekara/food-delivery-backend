'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock products data - replace with API call later
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil on a crispy thin crust. Made with imported Italian ingredients.',
        price: 12.99,
        image: '/food1.jpg',
        category: 'Pizza'
      },
      {
        id: '2',
        name: 'Chicken Burger',
        description: 'Juicy grilled chicken breast with lettuce, tomato, pickles, and our special sauce on a toasted bun.',
        price: 8.99,
        image: '/food2.jpg',
        category: 'Burgers'
      },
      {
        id: '3',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce, parmesan cheese, croutons, and creamy Caesar dressing.',
        price: 7.99,
        image: '/food3.jpg',
        category: 'Salads'
      },
      {
        id: '4',
        name: 'Spaghetti Carbonara',
        description: 'Traditional Italian pasta with pancetta, eggs, parmesan cheese, and black pepper.',
        price: 14.99,
        image: '/food4.jpg',
        category: 'Pasta'
      },
      {
        id: '5',
        name: 'Beef Tacos',
        description: 'Three soft tacos filled with seasoned beef, lettuce, cheese, salsa, and sour cream.',
        price: 11.99,
        image: '/food5.jpg',
        category: 'Mexican'
      },
      {
        id: '6',
        name: 'Chocolate Cake',
        description: 'Rich, moist chocolate layer cake with chocolate frosting and chocolate shavings.',
        price: 6.99,
        image: '/food6.jpg',
        category: 'Desserts'
      }
    ]

    const foundProduct = mockProducts.find(p => p.id === params.id)
    setProduct(foundProduct || null)
    setLoading(false)
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            href="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-red-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              {product.category && (
                <span className="inline-block text-sm text-red-600 font-semibold mb-2">
                  {product.category}
                </span>
              )}
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-600">
                  LKR {product.price.toFixed(2)}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={decrementQuantity}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-red-600 hover:text-red-600 font-bold text-xl transition"
                  >
                    −
                  </button>
                  <span className="text-2xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-red-600 hover:text-red-600 font-bold text-xl transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-red-600">
                    LKR {(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {addedToCart ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    className="block text-center py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/"
                    className="block text-center py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🚚</span>
              <div>
                <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Delivered hot and fresh to your door</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🌟</span>
              <div>
                <h3 className="font-semibold text-gray-800">Quality Guaranteed</h3>
                <p className="text-sm text-gray-600">Made with fresh, quality ingredients</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">💯</span>
              <div>
                <h3 className="font-semibold text-gray-800">Satisfaction Promise</h3>
                <p className="text-sm text-gray-600">100% satisfaction or money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}