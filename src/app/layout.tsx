import './globals.css'
import { ReactNode } from 'react'
import CartProvider from '@/components/CartProvider'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata = {
  title: 'K&D',
  description: 'Discover and order your favorite dishes',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <CartProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  )
}
