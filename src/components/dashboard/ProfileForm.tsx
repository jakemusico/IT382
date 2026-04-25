'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from '@/app/actions/users'
import { isValidPHMobile } from '@/utils/validation'
import { User, Phone, MapPin, Mail, Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck, X } from 'lucide-react'
import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal'
import { clsx } from 'clsx'

export function ProfileForm({ profile, userEmail }: { profile: any, userEmail: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    contact_number: profile?.contact_number || '',
    address: profile?.address || '',
    email: userEmail || '',
  })

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const hasChanges = 
    formData.full_name !== (profile?.full_name || '') ||
    formData.contact_number !== (profile?.contact_number || '') ||
    formData.address !== (profile?.address || '') ||
    formData.email !== userEmail

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      if (formData.contact_number && !isValidPHMobile(formData.contact_number)) {
        setError('Please enter a valid 11-digit mobile number (09XXXXXXXXX)')
        return
      }
      const result = await updateUserProfile(formData)
      if (result.error) {
        setError(result.error)
      } else {
        if (result.message) {
          setToastMessage(result.message)
          setTimeout(() => setToastMessage(null), 10000) // Auto-dismiss after 10 seconds
        }
        setSuccess(true)
        setIsEditing(false) // Exit edit mode on success
        setTimeout(() => setSuccess(false), 5000)
      }
    })
  }

  return (
    <>
      {/* Floating Bubble Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-8 fade-in zoom-in-95 duration-500">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-gray-800">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-medium leading-relaxed max-w-sm">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors ml-2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-100 border-4 border-white">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{profile?.full_name || 'Anonymous User'}</h2>
              <p className="text-sm font-medium text-gray-400">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{profile?.role || 'Client'}</p>
            </div>
            {!isEditing && (
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  readOnly={!isEditing}
                  placeholder="Enter your full name"
                  className={clsx(
                    "w-full pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all",
                    isEditing 
                      ? "bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500" 
                      : "bg-transparent border-transparent cursor-default"
                  )}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  readOnly={!isEditing}
                  placeholder="name@example.com"
                  className={clsx(
                    "w-full pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all",
                    isEditing 
                      ? "bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500" 
                      : "bg-transparent border-transparent cursor-default"
                  )}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={11}
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  readOnly={!isEditing}
                  placeholder="09XXXXXXXXX"
                  className={clsx(
                    "w-full pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all",
                    isEditing 
                      ? "bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500" 
                      : "bg-transparent border-transparent cursor-default"
                  )}
                />
              </div>
            </div>

            {/* Security Action */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Security</label>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 leading-none">Security Credentials</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">Update your login password</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-white text-[9px] font-black uppercase tracking-widest text-blue-600 rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  Change
                </div>
              </button>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-6 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  readOnly={!isEditing}
                  placeholder="Street, City, Province, Zip Code"
                  rows={3}
                  className={clsx(
                    "w-full pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all resize-none",
                    isEditing 
                      ? "bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500" 
                      : "bg-transparent border-transparent cursor-default"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex-1 mr-8">
              {success && (
                <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Profile Saved Successfully</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-left-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      full_name: profile?.full_name || '',
                      contact_number: profile?.contact_number || '',
                      address: profile?.address || '',
                      email: userEmail || '',
                    })
                    setError(null)
                  }}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !hasChanges}
                  className={clsx(
                    "px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 shadow-xl",
                    hasChanges 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100" 
                      : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                  )}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Synchronize Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      </form>
    </>
  )
}
