'use client'

import { useState, useTransition } from 'react'
import { updateUserProfile } from '@/app/actions/users'
import { X, Key, Loader2, Save, Sparkles, Lock } from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [isPending, startTransition] = useTransition()

  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSave() {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateUserProfile({
        password: password,
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

      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col border border-white/20">
        {/* Header */}
        <div className="px-10 py-7 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Access Control</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credential Security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8 relative min-h-[350px]">
          {success ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-white z-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-200 animate-bounce">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">Access Secured!</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 text-center">Password has been updated</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="Re-type password"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button
            onClick={handleSave}
            disabled={isPending || !password}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}
