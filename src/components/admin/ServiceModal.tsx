'use client'

import { useState, useTransition } from 'react'
import { createService, updateService } from '@/app/actions/services'
import { X, Sparkles, Loader2, Save, Tag, Clock, Box, Info } from 'lucide-react'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service?: any // If present, we are editing
}

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const isEditing = !!service

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEditing 
        ? await updateService(service.id, formData)
        : await createService(formData)

      if (result?.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">
                {isEditing ? 'Modify Service' : 'New Offering'}
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catalog Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-8 relative min-h-[450px]">
            {success ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-white z-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-200 animate-bounce">
                  <Box className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">Catalog Updated!</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 text-center">Service has been synchronized</p>
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
                  {/* Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Name</label>
                      <div className="relative">
                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <select 
                          name="name"
                          defaultValue={service?.name || 'Wash & Fold'}
                          required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none"
                        >
                          <option value="Wash & Fold">Wash & Fold</option>
                          <option value="Wash & Dry">Wash & Dry</option>
                          <option value="Full Service (Wash, Dry & Fold)">Full Service (Wash, Dry & Fold)</option>
                          <option value="Dry Cleaning">Dry Cleaning</option>
                          <option value="Ironing / Pressing">Ironing / Pressing</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        name="category"
                        defaultValue={service?.category || 'kilo'}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none"
                      >
                        <option value="kilo">Per Kilo Services</option>
                        <option value="item">Per Item Services</option>
                        <option value="addon">Add-ons & Extras</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <div className="relative">
                      <Info className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                      <textarea 
                        name="description"
                        defaultValue={service?.description}
                        required
                        rows={3}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all resize-none"
                        placeholder="Describe the service details..."
                      />
                    </div>
                  </div>

                  {/* Pricing & Turnaround */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₱)</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={service?.price}
                          required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                      <select 
                        name="unit"
                        defaultValue={service?.unit || 'kg'}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none"
                      >
                        <option value="kg">Per Kilo (kg)</option>
                        <option value="item">Per Item</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estimated Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <select 
                          name="turnaround"
                          defaultValue={service?.turnaround || '24 Hours'}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none"
                        >
                          <option value="12 Hours (Rush)">12 Hours (Rush)</option>
                          <option value="24 Hours (Next Day)">24 Hours (Next Day)</option>
                          <option value="48 Hours (Standard)">48 Hours (Standard)</option>
                          <option value="3-5 Days (Delicate)">3-5 Days (Delicate)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Confirm Changes' : 'Publish Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
