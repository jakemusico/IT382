'use client'

import { useState, useTransition, useEffect } from 'react'
import { updateUserDetails } from '@/app/actions/users'
import { X, User, Mail, Shield, ShieldAlert, ShieldCheck, Loader2, Save, Sparkles, MapPin } from 'lucide-react'
import { clsx } from 'clsx'

interface UserDetailsModalProps {
  user: any
  isOpen: boolean
  onClose: (updatedUser?: any) => void
  onSuccess?: () => void
}

export function UserDetailsModal({ user, isOpen, onClose, onSuccess }: UserDetailsModalProps) {
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [contactNumber, setContactNumber] = useState(user.contact_number || '')
  const [address, setAddress] = useState(user.address || '')
  const [role, setRole] = useState(user.role || 'client')
  const [status, setStatus] = useState(user.status || 'active')

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
      setContactNumber(user.contact_number || '')
      setAddress(user.address || '')
      setRole(user.role || 'client')
      setStatus(user.status || 'active')
    }
  }, [user])

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const hasChanges = 
    fullName !== (user.full_name || '') || 
    email !== (user.email || '') || 
    contactNumber !== (user.contact_number || '') ||
    address !== (user.address || '') ||
    role !== user.role || 
    status !== (user.status || 'active')

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateUserDetails(user.id, {
        full_name: fullName,
        email: email,
        contact_number: contactNumber,
        role: role,
        status: status,
      })
      
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        if (onSuccess) onSuccess()
        setTimeout(() => {
          setSuccess(false)
          onClose({
            ...user,
            full_name: fullName,
            email: email,
            contact_number: contactNumber,
            address: address,
            role: role,
            status: status
          })
        }, 1500)
      }
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

        <div className="p-10 space-y-8 relative min-h-[400px]">
          {success ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-white z-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-100 animate-bounce">
                <Sparkles className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">Profile Updated!</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Identity synced successfully</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Legal Name
                    <span className="text-[8px] text-blue-400 normal-case">Private Information</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text"
                      value={fullName}
                      readOnly
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Email Address
                    <span className="text-[8px] text-blue-400 normal-case">Private Information</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed transition-all font-mono"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Contact Number
                    <span className="text-[8px] text-blue-400 normal-case">Private Information</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 flex items-center justify-center font-black">#</div>
                    <input 
                      type="tel"
                      value={contactNumber}
                      readOnly
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed transition-all"
                      placeholder="09123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    Residential Address
                    <span className="text-[8px] text-blue-400 normal-case">Private Information</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text"
                      value={address}
                      readOnly
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed transition-all"
                      placeholder="Street, City, Province"
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
            </>
          )}
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
