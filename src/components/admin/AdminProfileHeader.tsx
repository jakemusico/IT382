'use client'

import { useState } from 'react'
import { Shield, Settings2, Key } from 'lucide-react'
import { EditAdminProfileModal } from './EditAdminProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'

export function AdminProfileHeader({ user, profile }: { user: any, profile: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  return (
    <>
      <div className="p-6 border-b border-gray-50 bg-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-gray-800 shadow-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.full_name || 'Administrator'}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95 border border-white/10 flex items-center gap-2 group"
          >
            <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Edit Details</span>
          </button>
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 border border-blue-500 flex items-center gap-2 group shadow-lg shadow-blue-900/40"
          >
            <Key className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Password</span>
          </button>
        </div>
      </div>

      <EditAdminProfileModal 
        user={user}
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  )
}
