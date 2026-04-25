'use client'

import { useState, useTransition } from 'react'
import { createCustomer } from '@/app/actions/users'
import { UserPlus, X, Loader2, CheckCircle, Mail, Key, User } from 'lucide-react'

export function AddCustomerModal({ 
  isOpen, 
  onClose,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createCustomer(formData)
      if (result?.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
      }, 1500)
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-blue-900/20 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Bubble Modal */}
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-blue-900/10 overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              Register Client
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center animate-in zoom-in-90 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Registration Complete!</h3>
            <p className="text-gray-500 text-sm font-medium">Identity synced to directory.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center font-black">#</div>
                <input
                  type="tel"
                  name="contact_number"
                  placeholder="Contact Number (e.g. 09123456789)"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Full Residential Address"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Temporary Password"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-5 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 group overflow-hidden relative"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Add to Registry'
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
