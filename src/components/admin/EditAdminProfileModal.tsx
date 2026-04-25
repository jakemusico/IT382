'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from '@/app/actions/users'
import { X, User, Shield, Loader2, Save, Sparkles, Key, Smartphone, Mail, MapPin } from 'lucide-react'
import { clsx } from 'clsx'

interface EditAdminProfileModalProps {
  user: any
  profile: any
  isOpen: boolean
  onClose: () => void
}

export function EditAdminProfileModal({ user, profile, isOpen, onClose }: EditAdminProfileModalProps) {
  const [isPending, startTransition] = useTransition()

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [contactNumber, setContactNumber] = useState(profile?.contact_number || '')
  const [address, setAddress] = useState(profile?.address || '')

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const hasChanges =
    fullName !== (profile?.full_name || '') ||
    email !== (user?.email || '') ||
    contactNumber !== (profile?.contact_number || '') ||
    address !== (profile?.address || '')

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateUserProfile({
        full_name: fullName,
        email: email,
        contact_number: contactNumber,
        address: address,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1500)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col border border-white/20">
        {/* Header */}
        <div className="px-10 py-7 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Modify Admin Identity</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Self-Modification Console</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8 relative min-h-[400px]">
          {success ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-white z-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-200 animate-bounce">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">Identity Synced!</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 text-center">Administrative profile has been updated</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <Shield className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="tel"
                      maxLength={11}
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="Street, City, Province"
                    />
                  </div>
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
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
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
