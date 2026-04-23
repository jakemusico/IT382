'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Waves,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag, exact: false },
  { href: '/dashboard/orders/new', label: 'New Order', icon: PlusCircle, exact: false },
  { href: '/dashboard/profile', label: 'Profile', icon: User, exact: false },
]

function SidebarContent({ userName, onClose }: { userName?: string | null; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">LaundryPro</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          
          // Check if there is a more specific match in the navigation items
          // e.g., if we are on /dashboard/orders/new, we shouldn't highlight /dashboard/orders
          const isMoreSpecificMatch = navItems.some(item => 
            item.href !== href && 
            item.href.startsWith(href) && 
            pathname.startsWith(item.href)
          )
          
          const active = isActive && !isMoreSpecificMatch

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 pb-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-gray-50">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 truncate">{userName ?? 'Client'}</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}

export function ClientSidebar({ userName }: { userName?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent userName={userName} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Waves className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">LaundryPro</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col">
            <SidebarContent userName={userName} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
