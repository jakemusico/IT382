'use client'

import { NotificationConsole } from './NotificationConsole'
import { User, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function AdminTopNav({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
          <User className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Admin</p>
          <p className="text-sm font-black text-gray-900 tracking-tight">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationConsole />
        
        <div className="w-px h-8 bg-gray-100 mx-2" />
        
        <button 
          onClick={handleLogout}
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
