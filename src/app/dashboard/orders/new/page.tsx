'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder, uploadGcashProof } from '@/app/actions/orders'
import { getSettings } from '@/app/actions/settings'
import { Shirt, Truck, CreditCard, Upload, Loader2, CheckCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'
import type { PaymentMethod } from '@/types'

const SERVICES = [
  { id: 'wash_fold', label: 'Wash & Fold', pricePerKg: 120 },
  { id: 'dry_clean', label: 'Dry Cleaning', pricePerKg: 250 },
  { id: 'pickup_delivery', label: 'Pickup & Delivery', pricePerKg: 50 },
]

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: 'COP', label: 'Cash on Pickup', desc: 'Pay when you pick up your laundry' },
  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when we deliver your laundry' },
  { id: 'GCASH', label: 'GCash', desc: 'Send payment to our GCash number' },
]

export default function NewOrderPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState({ gcash_number: '0909-203-9693', gcash_qr_url: '/images/gcash-qr.png' })
  const [selectedService, setSelectedService] = useState(SERVICES[0].id)
  const [weight, setWeight] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COP')
  const [gcashFile, setGcashFile] = useState<File | null>(null)
  const [gcashPreview, setGcashPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const service = SERVICES.find(s => s.id === selectedService)!
  const totalPrice = service.pricePerKg * weight

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (paymentMethod === 'GCASH' && !gcashFile) {
      setShowRequirementsModal(true)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('payment_method', paymentMethod)
      formData.set('total_price', String(totalPrice))

      const result = await createOrder(formData)
      if (result?.error) {
        setError(result.error)
        return
      }

      // Upload GCash proof if provided
      if (paymentMethod === 'GCASH' && gcashFile && result.orderId) {
        const uploadResult = await uploadGcashProof(result.orderId, gcashFile)
        if (uploadResult?.error) {
          setError(uploadResult.error)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/orders'), 1500)
    })
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Requirements Bubble Modal */}
      {showRequirementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={() => setShowRequirementsModal(false)} 
          />
          <div className="relative bg-white/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Proof Required</h3>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              To process your GCash transaction, we need to verify your payment screenshot. Please upload it before placing the order.
            </p>
            <button
              onClick={() => setShowRequirementsModal(false)}
              className="w-full py-4 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95"
            >
              Got it, I'll upload
            </button>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Laundry Order</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to place your order.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shirt className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Select Service</h2>
          </div>
          <div className="grid gap-3">
            {SERVICES.map((svc) => (
              <label
                key={svc.id}
                className={clsx(
                  'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all',
                  selectedService === svc.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="service"
                    value={svc.id}
                    checked={selectedService === svc.id}
                    onChange={() => setSelectedService(svc.id)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">{svc.label}</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">₱{svc.pricePerKg}/kg</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Estimated Weight</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setWeight(Math.max(1, weight - 1))}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg"
            >
              −
            </button>
            <div className="text-center flex-1">
              <span className="text-3xl font-bold text-gray-900">{weight}</span>
              <span className="text-gray-500 text-sm ml-1">kg</span>
            </div>
            <button
              type="button"
              onClick={() => setWeight(weight + 1)}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg"
            >
              +
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-lg font-bold text-blue-700">₱{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Payment Method</h2>
          </div>
          <div className="grid gap-3">
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.id}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                  paymentMethod === pm.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={pm.id}
                  checked={paymentMethod === pm.id}
                  onChange={() => setPaymentMethod(pm.id)}
                  className="accent-blue-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{pm.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* GCash Details / Proof Upload */}
          <div className="mt-4 space-y-4">
            {paymentMethod === 'GCASH' && (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Scan to Pay</p>
                    <p className="text-xl font-black text-blue-900 font-mono tracking-tighter">{settings.gcash_number}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">LaundryPro Account</p>
                  </div>
                  
                  {/* QR Code Container */}
                  <div className="bg-white p-3 rounded-2xl shadow-xl shadow-blue-100/50 border border-blue-100">
                    <img 
                      src={settings.gcash_qr_url} 
                      alt="GCash QR Code" 
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Please screenshot the success page</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot 
                {paymentMethod === 'GCASH' ? (
                  <span className="text-red-500 ml-1">(Required)</span>
                ) : (
                  <span className="text-gray-400 ml-1">(Optional)</span>
                )}
              </label>
              <label className={clsx(
                'flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                gcashFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              )}>
                {gcashPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gcashPreview} alt="Proof preview" className="h-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center px-4">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload proof</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {paymentMethod === 'GCASH' ? 'Please upload your GCash receipt' : 'Optional proof of payment'}
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setGcashFile(file)
                      setGcashPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm shadow-sm shadow-blue-200"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
          ) : (
            `Place Order — ₱${totalPrice.toLocaleString()}`
          )}
        </button>
      </form>
    </div>
  )
}
