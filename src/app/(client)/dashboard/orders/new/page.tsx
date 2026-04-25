'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder } from '@/app/actions/orders'
import { getSettings } from '@/app/actions/settings'
import { createClient } from '@/utils/supabase/client'
import { isValidPHMobile } from '@/utils/validation'
import { Shirt, Truck, CreditCard, Upload, Loader2, CheckCircle, Info, MapPin, Phone, Layers, Copy, X, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import type { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { id: string; label: string; desc: string }[] = [
  { id: 'COP', label: 'Cash on Pickup', desc: 'Pay when you pick up your laundry' },
  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when we deliver your laundry' },
  { id: 'GCASH', label: 'GCash', desc: 'Send payment to our GCash number' },
]

export default function NewOrderPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [settings, setSettings] = useState({ gcash_number: '0909-203-9693', gcash_qr_url: '/images/gcash-qr.png', delivery_fee: 50 })

  // Dynamic Services
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  // Selection States
  const [selectedKiloId, setSelectedKiloId] = useState<string>('')
  const [kiloWeight, setKiloWeight] = useState(5)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])

  // Logistics & Payment
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryContact, setDeliveryContact] = useState('')
  const [manualDeliveryFee, setManualDeliveryFee] = useState<number | string>(50)
  const [paymentMethod, setPaymentMethod] = useState<string>('COP')
  const [gcashFile, setGcashFile] = useState<File | null>(null)
  const [gcashPreview, setGcashPreview] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoadingServices(true)
      const { data: svcData } = await supabase.from('services').select('*').order('name', { ascending: true })
      if (svcData) {
        setServices(svcData)
        const firstKilo = svcData.find(s => s.category?.toLowerCase().includes('kilo'))
        if (firstKilo) setSelectedKiloId(firstKilo.id)
      }
      const s = await getSettings()
      if (s) {
        setSettings(s)
        if (s.delivery_fee) setManualDeliveryFee(s.delivery_fee)
      }
      setLoadingServices(false)
    }
    fetchData()
  }, [])

  // Categories
  const kiloServices = services.filter(s => s.category?.toLowerCase().includes('kilo'))
  const itemServices = services.filter(s => s.category?.toLowerCase().includes('item'))
  const addonServices = services.filter(s => s.category?.toLowerCase().includes('add'))

  // Pricing
  const kiloPrice = (services.find(s => s.id === selectedKiloId)?.price || 0) * kiloWeight
  const itemsPrice = selectedItemIds.reduce((sum, id) => sum + (services.find(s => s.id === id)?.price || 0) * (itemQuantities[id] || 1), 0)
  const addonsPrice = selectedAddonIds.reduce((sum, id) => sum + (services.find(s => s.id === id)?.price || 0), 0)
  const subtotal = kiloPrice + itemsPrice + addonsPrice
  const deliveryFeeValue = deliveryType === 'delivery' ? Number(manualDeliveryFee || 0) : 0
  const totalPrice = subtotal + deliveryFeeValue

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return
    setError(null)

    if (paymentMethod === 'GCASH' && !gcashFile) {
      setShowRequirementsModal(true)
      return
    }

    if (deliveryType === 'delivery') {
      if (!deliveryAddress || !deliveryContact) {
        setError('Delivery details are required')
        return
      }
      if (!isValidPHMobile(deliveryContact)) {
        setError('Please enter a valid 11-digit mobile number (e.g., 09XXXXXXXXX)')
        return
      }
    }

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Session expired. Please log in again.')
        return
      }

      let gcash_url = ''
      if (gcashFile) {
        const fileExt = gcashFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('gcash-proofs')
          .upload(fileName, gcashFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Upload failed: ${uploadError.message}`)
          return
        }
        const { data: { publicUrl } } = supabase.storage.from('gcash-proofs').getPublicUrl(fileName)
        gcash_url = publicUrl
      }

      const orderData = {
        kilo_service_id: selectedKiloId,
        weight: kiloWeight,
        item_services: selectedItemIds.map(id => ({ id, quantity: itemQuantities[id] || 1 })),
        addon_services: selectedAddonIds,
        payment_method: paymentMethod,
        total_price: totalPrice,
        delivery_fee: deliveryFeeValue,
        gcash_proof_url: gcash_url,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
        delivery_contact: deliveryType === 'delivery' ? deliveryContact : null
      }

      const result = await createOrder(orderData)
      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/orders'), 1500)
    })
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-sm font-medium">Redirecting you to the order dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Requirements Modal */}
      {showRequirementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl max-w-sm text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Proof Required</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">To process your GCash transaction, we need to verify your payment screenshot.</p>
            <button type="button" onClick={() => setShowRequirementsModal(false)} className="w-full py-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">Got it</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Create New Transaction</h1>
        <p className="text-gray-500 text-sm font-medium">Standard protocol for client-initiated service requests.</p>
      </div>

      {error && (
        <div className="fixed inset-x-0 top-10 z-[100] flex justify-center px-4 pointer-events-none">
          <div className="bg-white border border-red-100 p-2 rounded-[2rem] shadow-2xl shadow-red-200/50 flex items-center gap-4 animate-in zoom-in-95 slide-in-from-top-8 duration-500 pointer-events-auto max-w-md">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pr-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">System Alert</p>
              <p className="text-xs font-bold text-gray-900 leading-tight">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-3 hover:bg-gray-50 rounded-2xl transition-all active:scale-90 text-gray-400 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start pb-20">
        {/* Column 1: Logistics & Kilo */}
        <div className="flex flex-col gap-8">
          {/* 1. Dispatch Protocol */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-start gap-5">
              <div className="text-4xl font-black text-blue-600/10 leading-none">1</div>
              <div>
                <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Dispatch Protocol</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Fulfillment</p>
              </div>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType('pickup')
                  if (paymentMethod === 'COD') setPaymentMethod('COP')
                }}
                className={clsx(
                  "p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left",
                  deliveryType === 'pickup' ? "border-blue-600 bg-blue-50/20" : "border-gray-100 bg-white"
                )}
              >
                <p className={clsx("text-[11px] font-black uppercase tracking-widest", deliveryType === 'pickup' ? "text-blue-600" : "text-gray-900")}>Store Pickup</p>
                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">You Drop Off</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryType('delivery')
                  if (paymentMethod === 'COP') setPaymentMethod('COD')
                }}
                className={clsx(
                  "p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left",
                  deliveryType === 'delivery' ? "border-blue-600 bg-blue-50/20" : "border-gray-100 bg-white"
                )}
              >
                <p className={clsx("text-[11px] font-black uppercase tracking-widest", deliveryType === 'delivery' ? "text-blue-600" : "text-gray-900")}>Door Delivery</p>
                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">We Pick Up</p>
              </button>
            </div>

            {deliveryType === 'delivery' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 animate-in slide-in-from-top-4 duration-500">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <MapPin className="w-4 h-4 text-blue-500" /> Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm placeholder:text-gray-300"
                    placeholder="Enter complete delivery address..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Phone className="w-4 h-4 text-blue-500" /> Contact Number
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={deliveryContact}
                    onChange={(e) => setDeliveryContact(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm placeholder:text-gray-300"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Delivery Fee
                  </label>
                  <input
                    type="number"
                    value={manualDeliveryFee}
                    onChange={(e) => setManualDeliveryFee(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Item Based */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-start gap-5">
              <div className="text-4xl font-black text-emerald-600/10 leading-none">3</div>
              <div>
                <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Item-Based</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Individual</p>
              </div>
            </div>

            <div className="grid gap-3">
              {itemServices.map((svc) => {
                const isSelected = selectedItemIds.includes(svc.id)
                return (
                  <div key={svc.id} className={clsx("p-5 rounded-[1.5rem] border-2 transition-all", isSelected ? "border-emerald-600 bg-emerald-50/20" : "border-gray-100")}>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedItemIds(selectedItemIds.filter(id => id !== svc.id))
                          } else {
                            setSelectedItemIds([...selectedItemIds, svc.id])
                            setItemQuantities({ ...itemQuantities, [svc.id]: 1 })
                          }
                        }}
                        className="text-left flex-1"
                      >
                        <p className="text-xs font-black text-gray-900 uppercase">{svc.name}</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase mt-0.5">₱{svc.price}/pc</p>
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setItemQuantities({ ...itemQuantities, [svc.id]: Math.max(1, itemQuantities[svc.id] - 1) })} className="w-7 h-7 rounded-lg bg-white border border-emerald-200 flex items-center justify-center font-black text-emerald-600">-</button>
                          <span className="text-xs font-black text-gray-900 w-4 text-center">{itemQuantities[svc.id]}</span>
                          <button type="button" onClick={() => setItemQuantities({ ...itemQuantities, [svc.id]: (itemQuantities[svc.id] || 1) + 1 })} className="w-7 h-7 rounded-lg bg-white border border-emerald-200 flex items-center justify-center font-black text-emerald-600">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Item & Addons */}
        <div className="flex flex-col gap-8">
          {/* 3. Kilo Based */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-start gap-5">
              <div className="text-4xl font-black text-blue-600/10 leading-none">2</div>
              <div>
                <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Kilo-Based</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Bulk Wash</p>
              </div>
            </div>

            <div className="grid gap-3">
              {kiloServices.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedKiloId(svc.id)}
                  className={clsx(
                    "flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all",
                    selectedKiloId === svc.id ? "border-blue-600 bg-blue-50/20" : "border-gray-100"
                  )}
                >
                  <span className="text-xs font-black text-gray-900 uppercase">{svc.name}</span>
                  <span className="text-xs font-black text-blue-700">₱{svc.price}/kg</span>
                </button>
              ))}
            </div>

            <div className="bg-gray-50/50 rounded-3xl p-6 flex flex-col gap-4 border border-gray-100">
              <div className="flex items-center justify-center gap-6">
                <button type="button" onClick={() => setKiloWeight(Math.max(5, kiloWeight - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-gray-600">-</button>
                <div className="text-center min-w-[40px]">
                  <p className="text-2xl font-black text-gray-900 leading-none">{kiloWeight}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase mt-1">KG</p>
                </div>
                <button type="button" onClick={() => setKiloWeight(kiloWeight + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-gray-600">+</button>
              </div>
              <div className="text-center pt-3 border-t border-gray-200/50">
                <p className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{kiloPrice.toLocaleString()}</p>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Subtotal</p>
              </div>
            </div>
          </div>

          {/* 4. Addons */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-start gap-5">
              <div className="text-4xl font-black text-blue-600/10 leading-none">4</div>
              <div>
                <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Add-ons</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Special care</p>
              </div>
            </div>

            <div className="grid gap-3">
              {addonServices.map((svc) => {
                const isSelected = selectedAddonIds.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAddonIds(selectedAddonIds.filter(id => id !== svc.id))
                      } else {
                        setSelectedAddonIds([...selectedAddonIds, svc.id])
                      }
                    }}
                    className={clsx(
                      "flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all",
                      isSelected ? "border-blue-600 bg-blue-50/20" : "border-gray-100 bg-white"
                    )}
                  >
                    <span className="text-xs font-black text-gray-900 uppercase">{svc.name}</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase">+₱{svc.price}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Payment Hub */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0f1d] rounded-[3rem] border border-white/5 shadow-2xl p-10 space-y-10 text-white sticky top-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Order Valuation</p>
              <p className="text-5xl font-black italic tracking-tighter">₱{totalPrice.toLocaleString()}</p>
            </div>

            <div className="h-px bg-white/5 w-full" />

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Base Service</span>
                <span className="text-gray-200">₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-400">
                <span>Delivery Fee</span>
                <span>₱{deliveryFeeValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Settlement Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                >
                  {PAYMENT_METHODS.filter(m => {
                    if (deliveryType === 'delivery') return m.id !== 'COP'
                    if (deliveryType === 'pickup') return m.id !== 'COD'
                    return true
                  }).map(m => (
                    <option key={m.id} value={m.id} className="bg-[#0a0f1d]">{m.label}</option>
                  ))}
                </select>
              </div>

              {paymentMethod === 'GCASH' && (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10">
                      <img src={settings.gcash_qr_url} alt="QR" className="w-48 h-48 object-contain" />
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Settlement QR Code</p>
                      <div className="flex items-center justify-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 group hover:border-emerald-500/50 transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(settings.gcash_number); alert('Number copied to clipboard!'); }}>
                        <p className="text-base font-black tracking-widest font-mono text-gray-100">{settings.gcash_number}</p>
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Click number to copy</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5" /> Required: Payment Receipt
                    </label>
                    <label className={clsx(
                      "flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-2xl transition-all cursor-pointer p-4 relative",
                      gcashPreview ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:bg-white/5"
                    )}>
                      {gcashPreview ? (
                        <div className="text-center">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                          <p className="text-[9px] font-black text-emerald-500 uppercase">Uploaded</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                          <p className="text-[9px] font-black text-gray-400 uppercase">Upload Receipt</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setGcashFile(file)
                          setGcashPreview(URL.createObjectURL(file))
                        }
                      }} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || (paymentMethod === 'GCASH' && !gcashFile)}
              className={clsx(
                "w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all",
                paymentMethod === 'GCASH' && !gcashFile ? "bg-gray-800 text-gray-500" : "bg-emerald-600 text-white hover:bg-emerald-500"
              )}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (paymentMethod === 'GCASH' && !gcashFile ? 'Upload Receipt' : 'Confirm Order')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
