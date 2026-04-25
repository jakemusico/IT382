'use client'

import { useState, useTransition, useEffect } from 'react'
import { createAdminOrder } from '@/app/actions/orders'
import { createClient } from '@/utils/supabase/client'
import { isValidPHMobile } from '@/utils/validation'
import { X, Package, Clock, Shirt, Truck, Plus, Trash2, CheckCircle, User, Users, Search, ChevronDown, CreditCard, Wallet, MapPin, Phone, Loader2, Layers, Sparkles, Hash, Mail } from 'lucide-react'
import { clsx } from 'clsx'
import type { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'CASH', label: 'Cash' },
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
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Customer Selection States
  const [customerMode, setCustomerMode] = useState<'walkin' | 'member'>('walkin')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [guestName, setGuestName] = useState('Walk-In Customer')

  // Logistics States
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryContact, setDeliveryContact] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(0)

  // Selection States
  const [selectedKiloId, setSelectedKiloId] = useState<string | null>(null)
  const [kiloWeight, setKiloWeight] = useState(5)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({})

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COP')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!isOpen) return
      
      // Services
      setLoadingServices(true)
      const { data: svcData } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })
      if (svcData) {
        setServices(svcData)
        const firstKilo = svcData.find(s => s.category?.toLowerCase().includes('kilo'))
        if (firstKilo) setSelectedKiloId(firstKilo.id)
      }
      setLoadingServices(false)

      // Users
      setLoadingUsers(true)
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'client')
        .order('full_name', { ascending: true })
      if (userData) setAvailableUsers(userData)
      setLoadingUsers(false)
    }
    fetchData()
  }, [isOpen])

  if (!isOpen) return null

  // Categorized Services
  const kiloServices = services.filter(s => s.category?.toLowerCase().includes('kilo'))
  const itemServices = services.filter(s => s.category?.toLowerCase().includes('item'))
  const addonServices = services.filter(s => s.category?.toLowerCase().includes('add'))

  // Price Calculation
  const kiloPrice = (services.find(s => s.id === selectedKiloId)?.price || 0) * kiloWeight
  const itemsPrice = selectedItemIds.reduce((sum, id) => {
    const svc = services.find(s => s.id === id)
    return sum + (svc?.price || 0) * (itemQuantities[id] || 1)
  }, 0)
  const addonsPrice = selectedAddonIds.reduce((sum, id) => {
    const svc = services.find(s => s.id === id)
    return sum + (svc?.price || 0) * (addonQuantities[id] || 1)
  }, 0)

  const totalPrice = kiloPrice + itemsPrice + addonsPrice + (deliveryType === 'delivery' ? deliveryFee : 0)

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(i => i !== id)
        const nextQuants = { ...itemQuantities }
        delete nextQuants[id]
        setItemQuantities(nextQuants)
        return next
      }
      setItemQuantities(curr => ({ ...curr, [id]: 1 }))
      return [...prev, id]
    })
  }

  const toggleAddon = (id: string) => {
    setSelectedAddonIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(i => i !== id)
        const nextQuants = { ...addonQuantities }
        delete nextQuants[id]
        setAddonQuantities(nextQuants)
        return next
      }
      setAddonQuantities(curr => ({ ...curr, [id]: 1 }))
      return [...prev, id]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedKiloId) {
      setError('Please select a base kilo service')
      return
    }

    if (kiloWeight < 5) {
      setError('Minimum weight for kilo services is 5 KG')
      return
    }

    if (deliveryType === 'delivery') {
      if (!deliveryAddress || !deliveryContact) {
        setError('Delivery details are required')
        return
      }
      if (!isValidPHMobile(deliveryContact)) {
        setError('Valid 11-digit mobile number required (09XXXXXXXXX)')
        return
      }
      if (paymentMethod === 'COP') { setError('Cash on Pickup is not available for Delivery orders'); return; }
    } else if (customerMode === 'walkin') {
      // For Store Pickup, still require contact for notifications if it's a guest
      if (!deliveryContact) {
        setError('Contact number is required for records')
        return
      }
      if (!isValidPHMobile(deliveryContact)) {
        setError('Valid 11-digit mobile number required (09XXXXXXXXX)')
        return
      }
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('is_walk_in', String(customerMode === 'walkin'))
      formData.set('selected_user_id', selectedUserId)
      formData.set('guest_name', guestName)
      formData.set('guest_email', guestEmail)
      formData.set('payment_method', paymentMethod)
      formData.set('total_price', String(totalPrice))
      formData.set('status', 'pending')
      formData.set('delivery_type', deliveryType)
      formData.set('delivery_address', deliveryAddress)
      formData.set('delivery_contact', deliveryContact)
      formData.set('delivery_fee', String(deliveryFee))

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
      <div
        className="absolute inset-0 bg-blue-900/30 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-[3.5rem] border border-white shadow-2xl shadow-blue-900/20 overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-12 pt-10 pb-6 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create Walk-In Transaction
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 ml-14">Standard Administrative Protocol</p>
          </div>
          <button
            onClick={onClose}
            className="p-4 rounded-full hover:bg-gray-50 transition-all active:scale-90 text-gray-300 hover:text-gray-900 border border-transparent hover:border-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="p-20 text-center animate-in zoom-in-90 duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Transaction Registered</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing with system archives...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-12 pb-10 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-12">
                {error && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-sm font-bold text-red-600 flex items-center gap-4 animate-in slide-in-from-top-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                    {error}
                  </div>
                )}

                {/* Customer Selection HUD */}
                <div className="p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100/50 space-y-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Identity Selection</p>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Customer Profile</h3>
                      </div>
                    </div>
                    
                    <div className="flex bg-white/50 p-1.5 rounded-2xl border border-white">
                      {[
                        { id: 'walkin', label: 'Guest Entry', icon: Plus },
                        { id: 'member', label: 'Member Lookup', icon: Users }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCustomerMode(mode.id as any)}
                          className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            customerMode === mode.id 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                              : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          <mode.icon className="w-3.5 h-3.5" />
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    {customerMode === 'walkin' ? (
                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guest Identification</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input 
                              type="text" 
                              placeholder="Enter guest name..." 
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input 
                              type="text" 
                              maxLength={11}
                              placeholder="09XXXXXXXXX" 
                              value={deliveryContact}
                              onChange={(e) => setDeliveryContact(e.target.value.replace(/\D/g, '').slice(0, 11))}
                              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-3 col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input 
                              type="email" 
                              placeholder="customer@email.com" 
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member Registry</label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <select
                            required={customerMode === 'member'}
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all cursor-pointer"
                          >
                            <option value="">Search for registered member...</option>
                            {availableUsers.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.full_name} ({u.email})
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10" />
                </div>

                {/* Delivery Logistics Selection */}
                <div className="bg-gray-50/50 rounded-[3rem] p-8 border border-gray-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Handover Method</p>
                    </div>
                    <div className="flex p-1 bg-white border border-gray-100 rounded-2xl">
                      {[
                        { id: 'pickup', label: 'Store Pickup', icon: Package },
                        { id: 'delivery', label: 'Home Delivery', icon: MapPin }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setDeliveryType(type.id as any)
                            if (type.id === 'delivery' && paymentMethod === 'COP') {
                              setPaymentMethod('COD')
                            }
                          }}
                          className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            deliveryType === type.id
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                              : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          <type.icon className="w-3.5 h-3.5" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="text"
                            placeholder="Complete address..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="text"
                            maxLength={11}
                            placeholder="09XXXXXXXXX"
                            disabled={customerMode === 'walkin'}
                            value={deliveryContact}
                            onChange={(e) => setDeliveryContact(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            className={clsx(
                              "w-full pl-12 pr-6 py-4 border rounded-2xl text-xs font-bold focus:outline-none transition-all",
                              customerMode === 'walkin' ? "bg-gray-50 border-gray-100 text-gray-400" : "bg-white border-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Fee (Optional)</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="number"
                            placeholder="0"
                            value={deliveryFee || ''}
                            onChange={(e) => setDeliveryFee(Number(e.target.value))}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                  {/* Left Column: Kilo and Items */}
                  <div className="space-y-12">
                    {/* Per Kilo Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Per Kilo Services</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {kiloServices.map((svc) => (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => setSelectedKiloId(svc.id)}
                            className={clsx(
                              'flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 relative group overflow-hidden',
                              selectedKiloId === svc.id
                                ? 'border-blue-600 bg-white shadow-xl shadow-blue-100'
                                : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-blue-200 hover:bg-white'
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={clsx(
                                'w-10 h-10 rounded-2xl flex items-center justify-center transition-colors',
                                selectedKiloId === svc.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-500 shadow-sm'
                              )}>
                                <Shirt className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-black text-gray-900 block leading-tight">{svc.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">₱{svc.price} / {svc.unit}</span>
                              </div>
                            </div>
                            {selectedKiloId === svc.id && (
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Weight Controller for Selected Kilo */}
                      {selectedKiloId && (
                        <div className="mt-4 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-center justify-between animate-in slide-in-from-top-2">
                          <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Processing Weight</p>
                            <p className="text-sm font-black text-gray-900">Total KG for {kiloServices.find(s => s.id === selectedKiloId)?.name}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setKiloWeight(Math.max(5, kiloWeight - 1))}
                              className={clsx(
                                "w-10 h-10 rounded-2xl shadow-md flex items-center justify-center font-black text-xl transition-all",
                                kiloWeight <= 5 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white text-gray-900 hover:scale-110 active:scale-95"
                              )}
                            >
                              −
                            </button>
                            <span className="text-2xl font-black text-gray-900 w-8 text-center">{kiloWeight}</span>
                            <button
                              type="button"
                              onClick={() => setKiloWeight(kiloWeight + 1)}
                              className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center font-black text-xl hover:scale-110 active:scale-95 transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Per Item Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-violet-600" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Per Item Services</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {itemServices.map((svc) => {
                          const isSelected = selectedItemIds.includes(svc.id)
                          return (
                            <div key={svc.id} className="space-y-2">
                              <button
                                type="button"
                                onClick={() => toggleItem(svc.id)}
                                className={clsx(
                                  'w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 relative group overflow-hidden',
                                  isSelected
                                    ? 'border-violet-600 bg-white shadow-xl shadow-violet-100'
                                    : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-violet-200 hover:bg-white'
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={clsx(
                                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-colors',
                                    isSelected ? 'bg-violet-600 text-white' : 'bg-white text-violet-500 shadow-sm'
                                  )}>
                                    <Hash className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <span className="text-sm font-black text-gray-900 block leading-tight">{svc.name}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">₱{svc.price} / {svc.unit}</span>
                                  </div>
                                </div>
                                <div className={clsx(
                                  'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                                  isSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-200 bg-white'
                                )}>
                                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                              </button>

                              {isSelected && (
                                <div className="mx-6 p-4 bg-violet-50/30 border-x border-b border-violet-100 rounded-b-3xl flex items-center justify-between animate-in slide-in-from-top-2">
                                  <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Quantity</span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setItemQuantities(p => ({ ...p, [svc.id]: Math.max(1, (p[svc.id] || 1) - 1) }))}
                                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-gray-400 hover:text-violet-600 transition-colors"
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-black text-gray-900 w-4 text-center">{itemQuantities[svc.id] || 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => setItemQuantities(p => ({ ...p, [svc.id]: (p[svc.id] || 1) + 1 }))}
                                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-gray-400 hover:text-violet-600 transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Addons and Summary */}
                  <div className="space-y-12">
                    {/* Add-ons Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Value Add-ons</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {addonServices.map((svc) => {
                          const isSelected = selectedAddonIds.includes(svc.id)
                          return (
                            <div key={svc.id} className="space-y-2">
                              <button
                                type="button"
                                onClick={() => toggleAddon(svc.id)}
                                className={clsx(
                                  'w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 relative group overflow-hidden',
                                  isSelected
                                    ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-100'
                                    : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-emerald-200 hover:bg-white'
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={clsx(
                                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-colors',
                                    isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-500 shadow-sm'
                                  )}>
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <span className="text-sm font-black text-gray-900 block leading-tight">{svc.name}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">₱{svc.price} / {svc.unit}</span>
                                  </div>
                                </div>
                                <div className={clsx(
                                  'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                                  isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 bg-white'
                                )}>
                                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Valuation Panel */}
                    <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10 space-y-8">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Order Valuation</p>
                          <h5 className="text-5xl font-black tracking-tighter italic">₱{totalPrice.toLocaleString()}</h5>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-6">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Base Service</span>
                            <span>₱{kiloPrice.toLocaleString()}</span>
                          </div>
                          {(selectedItemIds.length > 0 || selectedAddonIds.length > 0) && (
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400">
                              <span>Extras & Items</span>
                              <span>₱{(itemsPrice + addonsPrice).toLocaleString()}</span>
                            </div>
                          )}
                          {deliveryType === 'delivery' && (
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              <span>Delivery Fee</span>
                              <span>₱{deliveryFee.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Settlement */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Settlement Channel</p>
                          <div className="relative group">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                              className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all cursor-pointer"
                            >
                              {PAYMENT_METHODS.filter(pm => {
                                if (deliveryType === 'delivery' && pm.id === 'COP') return false
                                return true
                              }).map((pm) => (
                                <option key={pm.id} value={pm.id} className="bg-gray-900 text-white">
                                  {pm.label.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Premium decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-colors" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="px-12 py-8 bg-white border-t border-gray-50 shrink-0">
              <button
                onClick={handleSubmit}
                disabled={isPending || !selectedKiloId}
                className="w-full py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 transition-all active:scale-[0.98] group relative overflow-hidden"
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Save Transaction
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
