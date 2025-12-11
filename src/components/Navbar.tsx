"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'

interface User {
  id: number
  email: string
  fullName: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const { getTotalItems } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setShowDropdown(false)
    router.push('/')
  }

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={user?.role === 'Admin' ? '/admin/dashboard' : '/'} className="font-bold text-2xl hover:text-red-500 transition">
          🍽️ K&D
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          {user?.role !== 'Admin' && (
            <>
              <Link href="/" className="hover:text-red-500 transition font-medium">
                Home
              </Link>
              <Link href="/menu" className="hover:text-red-500 transition font-medium">
                Menu
              </Link>
              <Link href="/cart" className="hover:text-red-500 transition font-medium relative">
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="hover:text-red-500 transition font-medium">
                My Orders
              </Link>
            </>
          )}
        </div>
        <div className="flex space-x-3 items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium shadow-md"
              >
                <span className="text-lg">👤</span>
                <span>{user.fullName}</span>
                <span className="text-sm">▼</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-semibold text-sm">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {user.role === 'Admin' ? '👨‍💼 Admin' : '👤 User'}
                    </p>
                  </div>
                  
                  {user.role === 'Admin' ? (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        📊 Admin Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        🍽️ Manage Products
                      </Link>
                      <Link
                        href="/admin/orders"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        📋 Manage Orders
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        👥 Manage Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        📦 My Orders
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 hover:bg-red-50 transition text-sm"
                      >
                        🛒 My Cart
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white text-black transition text-sm border-t border-gray-200 mt-2"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Only show auth CTAs on the landing page
            pathname === '/landing' ? (
              <>
                <Link 
                  href="/login"
                  className="border-2 border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium shadow-md"
                >
                  Register
                </Link>
              </>
            ) : null
          )}
        </div>
      </div>
    </nav>
  )
}
