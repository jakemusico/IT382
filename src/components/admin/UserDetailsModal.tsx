'use client'

import { useState, useTransition } from 'react'
import { updateUserDetails } from '@/app/actions/users'
import { X, User, Mail, Shield, ShieldAlert, ShieldCheck, Loader2, Save, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface UserDetailsModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [role, setRole] = useState(user.role || 'client')
  const [status, setStatus] = useState(user.status || 'active')

  if (!isOpen) return null

  const hasChanges = 
    fullName !== (user.full_name || '') || 
    email !== (user.email || '') || 
    role !== user.role || 
    status !== (user.status || 'active')

  async function handleSave() {
    startTransition(async () => {
      const result = await updateUserDetails(user.id, {
        full_name: fullName,
        email: email,
        role: role,
        status: status,
      })
      if (result?.error) alert(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col">
        {/* Header */}
        <div className="px-10 py-7 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Identity Profile</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modification Desk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-mono"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Status</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'active', label: 'Active', icon: ShieldCheck, color: 'emerald' },
                { id: 'revoked', label: 'Revoked', icon: ShieldAlert, color: 'red' },
              ].map((s) => {
                const Icon = s.icon
                const isActive = status === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={clsx(
                      "px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 flex items-center justify-center gap-3",
                      isActive 
                        ? `bg-${s.color}-50 border-${s.color}-600 text-${s.color}-600 shadow-lg shadow-${s.color}-100` 
                        : "bg-white border-gray-100 text-gray-300 hover:border-gray-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          {hasChanges ? (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Save Profile Changes
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95"
            >
              Discard & Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
