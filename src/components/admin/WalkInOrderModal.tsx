'use client'

import { useState, useTransition } from 'react'
import { createAdminOrder } from '@/app/actions/orders'
import { Shirt, Truck, CreditCard, Loader2, CheckCircle, X, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import type { PaymentMethod, OrderStatus } from '@/types'

const SERVICES = [
  { id: 'wash_fold', label: 'Wash & Fold', pricePerKg: 120 },
  { id: 'dry_clean', label: 'Dry Cleaning', pricePerKg: 250 },
  { id: 'pickup_delivery', label: 'Pickup & Delivery', pricePerKg: 50 },
]

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'COP', label: 'Cash on Pickup' },
  { id: 'COD', label: 'Cash on Delivery' },
  { id: 'GCASH', label: 'GCash' },
]

export function WalkInOrderModal({ 
  isOpen, 
  onClose,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedService, setSelectedService] = useState(SERVICES[0].id)
  const [weight, setWeight] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COP')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const service = SERVICES.find(s => s.id === selectedService)!
  const totalPrice = service.pricePerKg * weight

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('is_walk_in', 'true')
      formData.set('payment_method', paymentMethod)
      formData.set('total_price', String(totalPrice))
      formData.set('status', 'pending')

      const result = await createAdminOrder(formData)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-blue-900/20 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Bubble Modal Content */}
      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-blue-900/10 overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Walk-In Order
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 ml-10">Quick Transaction Protocol</p>
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
            <h3 className="text-xl font-black text-gray-900 mb-2">Order Registered!</h3>
            <p className="text-gray-500 font-medium">Syncing with history registry...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-black text-red-600 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                {error}
              </div>
            )}

            {/* Service Selection (Bubble Style) */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Service</p>
              <div className="grid grid-cols-1 gap-2">
                {SERVICES.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedService(svc.id)}
                    className={clsx(
                      'flex items-center justify-between px-6 py-4 rounded-full border-2 transition-all duration-300 relative group overflow-hidden',
                      selectedService === svc.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200'
                        : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-blue-200 hover:bg-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Shirt className={clsx('w-4 h-4', selectedService === svc.id ? 'text-white' : 'text-blue-500')} />
                      <span className="text-xs font-black uppercase tracking-wider">{svc.label}</span>
                    </div>
                    <span className={clsx(
                      'text-[10px] font-black italic',
                      selectedService === svc.id ? 'text-blue-100' : 'text-gray-400'
                    )}>₱{svc.pricePerKg}/kg</span>
                    
                    {/* Bubble Highlight */}
                    {selectedService === svc.id && (
                      <div className="absolute top-1 left-4 w-full h-1/2 bg-white/10 rounded-full blur-[2px]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight and Payment Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Load Configuration */}
              <div className="bg-gray-50/50 rounded-[2rem] p-5 border border-gray-100 relative overflow-hidden group">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Load (KG)</p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setWeight(Math.max(1, weight - 1))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-lg shadow-sm hover:scale-110 active:scale-90 transition-all"
                  >
                    −
                  </button>
                  <span className="text-2xl font-black text-gray-900 group-hover:scale-110 transition-transform">{weight}</span>
                  <button
                    type="button"
                    onClick={() => setWeight(weight + 1)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-lg shadow-sm hover:scale-110 active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Bubble */}
              <div className="bg-blue-600 rounded-[2rem] p-5 shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
                <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest">Total Valuation</p>
                <p className="text-2xl font-black text-white italic tracking-tighter">₱{totalPrice.toLocaleString()}</p>
                {/* Bubble highlight */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
              </div>
            </div>

            {/* Payment Method Bubbles */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Settlement Channel</p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={clsx(
                      'px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2',
                      paymentMethod === pm.id
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                    )}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 group overflow-hidden relative"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Register Transaction
                </>
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
