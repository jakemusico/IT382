'use client'

import { useState, useTransition } from 'react'
import { updateSettings } from '@/app/actions/settings'
import { Shield, CreditCard, Save, Upload, Phone, CheckCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export function AdminProfileForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [gcashNumber, setGcashNumber] = useState(initialSettings.gcash_number)
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState(initialSettings.gcash_qr_url)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('gcash_number', gcashNumber)
      if (qrFile) formData.set('gcash_qr', qrFile)

      const result = await updateSettings(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }

      setMessage({ type: 'success', text: 'Settings updated successfully!' })
      setIsEditing(false)
      setTimeout(() => setMessage(null), 3000)
    })
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={clsx(
          "p-4 rounded-2xl border text-sm font-black animate-in fade-in zoom-in-95 duration-300",
          message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
        )}>
          {message.text}
        </div>
      )}

      {/* GCash Settlement Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-blue-600 text-white">
          <div>
            <h2 className="text-xl font-black tracking-tight">GCash Settlement</h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Public Payment Configuration</p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save Changes
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/20"
            >
              Edit Details
            </button>
          )}
        </div>
        
        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-white p-4 rounded-[2rem] border border-blue-50 shadow-2xl">
              <img 
                src={qrPreview} 
                alt="GCash QR Code" 
                className="w-48 h-48 object-contain rounded-xl"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-blue-600/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-8 h-8 text-white mb-2" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Change QR</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setQrFile(file)
                        setQrPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registered Number</label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-black text-gray-900 font-mono italic focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900 font-mono italic">{gcashNumber}</span>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Active</div>
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                {isEditing 
                  ? "Careful! Changing these details will update the QR and number for all customers immediately."
                  : "This QR code and number are displayed to customers during the checkout process for all digital payments."
                }
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
