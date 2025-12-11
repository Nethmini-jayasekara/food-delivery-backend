'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface User {
  id: number
  email: string
  fullName: string
  role: string
}

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)

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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-black to-red-900 text-white py-28 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to K&D</h1>
          
          {user ? (
            <>
              <p className="text-xl md:text-2xl mb-8 text-red-100">
                Welcome back, {user.fullName}! Ready to order something delicious?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/menu"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg"
                >
                  Browse Menu
                </Link>
                <Link
                  href="/orders"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-black transition"
                >
                  My Orders
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl md:text-2xl mb-8 text-red-100">Delicious meals, fast delivery — sign up or login to get started</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-black transition"
                >
                  Login
                </Link>
              </div>

              <p className="text-sm text-red-100 mt-6">Or continue as a guest and browse our menu</p>
              <div className="mt-6">
                <Link href="/menu" className="text-red-100 underline hover:text-white">Browse Menu</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Simple features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-gray-600">Sign up to save addresses and orders</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-gray-600">Browse our full menu and offers</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-gray-600">Fast checkout with saved cards</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
