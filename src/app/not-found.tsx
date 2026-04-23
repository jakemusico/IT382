'use client'

import Link from 'next/link'
import { Waves, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Waves className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">LaundryPro</span>
      </div>

      {/* 404 */}
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gray-100 mb-2 select-none">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  )
}
