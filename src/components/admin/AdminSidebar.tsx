'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CreditCard,
  Waves,
  LogOut,
  Shield,
  Menu,
  X,
  Package,
  PlusCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/history', label: 'History', icon: Package },
  { href: '/admin/services', label: 'Services', icon: PlusCircle },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/profile', label: 'Profile', icon: Shield },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">LaundryPro</span>
            <span className="text-gray-500 text-xs">Admin Panel</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isMatching = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))

          // Only highlight if no other menu item is a more specific (longer) match
          const isMoreSpecificMatch = navItems.some(item =>
            item.href !== href &&
            item.href.startsWith(href) &&
            pathname.startsWith(item.href)
          )

          const isActive = isMatching && !isMoreSpecificMatch
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-white/5">
          <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-300">Administrator</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gray-950 flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-950 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Waves className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">LaundryPro Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 shadow-2xl lg:hidden flex flex-col">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
