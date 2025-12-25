'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, Search } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartItemsCount = useCartStore((state) => state.getTotalItems())
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin())

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold">Digital Frames</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/digital-frames" className="text-gray-700 hover:text-black transition">
              Shop
            </Link>
            <Link href="/digital-frames?category=bestsellers" className="text-gray-700 hover:text-black transition">
              Bestsellers
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-black transition">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-black transition">
              Contact
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-50 rounded-lg transition">
              <Search className="w-5 h-5" />
            </button>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 hover:bg-gray-50 rounded-lg transition">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <Link href="/account/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="p-2 hover:bg-gray-50 rounded-lg transition">
                <User className="w-5 h-5" />
              </Link>
            )}
            
            <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg transition">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'md:hidden transition-all duration-200',
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}>
          <div className="py-4 space-y-2">
            <Link href="/digital-frames" className="block py-2 text-gray-700">
              Shop
            </Link>
            <Link href="/digital-frames?category=bestsellers" className="block py-2 text-gray-700">
              Bestsellers
            </Link>
            <Link href="/about" className="block py-2 text-gray-700">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}