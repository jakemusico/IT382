'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, verifyPayment, unverifyPayment } from '@/app/actions/orders'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { X, Package, User, CreditCard, Hash, Calendar, Loader2, CheckCircle, Clock, Truck, Shirt, ExternalLink, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { OrderStatus } from '@/types'

interface OrderDetailsModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
}

const STATUSES: OrderStatus[] = ['pending', 'processing', 'ready', 'completed']

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  ready: Shirt,
  completed: CheckCircle,
}

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  processing: 'bg-blue-50 text-blue-700 border-blue-100',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  completed: 'bg-gray-50 text-gray-700 border-gray-100',
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [isPending, startTransition] = useTransition()
  
  // Local state for staged changes
  const [stagedStatus, setStagedStatus] = useState<OrderStatus>(order.status)
  const [stagedPaid, setStagedPaid] = useState<boolean>(order.payment_status === 'paid')
  const [stagedMethod, setStagedMethod] = useState<string>(order.payment_method)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isOpen) return null

  const user = order.users
  const payment = order.payments?.[0]
  const hasChanges = 
    stagedStatus !== order.status || 
    stagedPaid !== (order.payment_status === 'paid') ||
    stagedMethod !== order.payment_method

  async function handleSaveChanges() {
    startTransition(async () => {
      // 1. Update Order Status if changed
      if (stagedStatus !== order.status) {
        await updateOrderStatus(order.id, stagedStatus)
      }

      // 2. Update Payment & Method if changed
      if (stagedPaid !== (order.payment_status === 'paid') || stagedMethod !== order.payment_method) {
        const payResult = stagedPaid 
          ? await verifyPayment(order.id, stagedMethod)
          : await unverifyPayment(order.id)
        
        if (payResult?.error) {
          alert(payResult.error)
          return
        }
      }

      onClose()
    })
  }

  async function handleUnverify() {
    setShowConfirm(false)
    setStagedPaid(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-2xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Operation Command</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-10">
          <div className="space-y-10">
            {/* Operational Status */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Laundry Cycle</p>
                {stagedStatus !== order.status && <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">Unsaved Change</span>}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {STATUSES.map((s) => {
                  const Icon = STATUS_ICONS[s]
                  const isActive = stagedStatus === s
                  return (
                    <button
                      key={s}
                      onClick={() => setStagedStatus(s)}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 text-[10px] font-black uppercase tracking-tighter",
                        isActive 
                          ? STATUS_COLORS[s] + " border-current shadow-lg shadow-current/5" 
                          : "bg-white border-gray-100 text-gray-300 hover:border-gray-200"
                      )}
                    >
                      <Icon className={clsx("w-5 h-5", isActive && s === 'processing' && "animate-spin")} />
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Combined Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 py-10 border-y border-gray-50">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl"><User className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                    <p className="text-sm font-black text-gray-900 leading-tight">{user?.full_name}</p>
                    <p className="text-[11px] font-medium text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl"><Shirt className="w-4 h-4 text-blue-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Logistics</p>
                    <p className="text-sm font-black text-gray-900 leading-tight">Wash & Fold — 5kg</p>
                    <p className="text-[11px] font-medium text-gray-400">{order.payment_method}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-50 rounded-xl"><CreditCard className="w-4 h-4 text-emerald-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Financial</p>
                    <p className="text-sm font-black text-gray-900 tracking-tight">₱{order.total_price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                        stagedPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {stagedPaid ? 'PAID' : 'UNPAID'}
                      </span>
                      {stagedPaid !== (order.payment_status === 'paid') && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl"><Hash className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reference</p>
                    <p className="text-sm font-black text-gray-900 font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Section */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Payment Proof</p>
              {payment?.gcash_proof_url ? (
                <div className="relative group rounded-3xl overflow-hidden border-2 border-gray-100 aspect-video">
                  <img src={payment.gcash_proof_url} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a href={payment.gcash_proof_url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                      <ExternalLink className="w-4 h-4" /> View HD Proof
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {order.payment_method === 'GCASH' ? 'Awaiting Upload' : 'No Proof Required'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Action Footer */}
        <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-6 shrink-0">
          {!stagedPaid ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Receive Payment via:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStagedMethod('GCASH')
                    setStagedPaid(true)
                  }}
                  className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-100 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex flex-col items-center gap-1 active:scale-95 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  GCash
                </button>
                <button
                  onClick={() => {
                    setStagedMethod('COD')
                    setStagedPaid(true)
                  }}
                  className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-100 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex flex-col items-center gap-1 active:scale-95 shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  COD / Pickup
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex-1 flex items-center gap-3 px-4">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Staged as Paid</p>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">via {stagedMethod}</p>
                </div>
              </div>
              <button
                onClick={() => setStagedPaid(false)}
                className="p-3 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors active:scale-90"
                title="Reset Payment"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="flex gap-3">
            {hasChanges ? (
              <button
                onClick={handleSaveChanges}
                disabled={isPending}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.1em] rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Confirm & Save Everything
              </button>
            ) : (
              <button onClick={onClose} className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.1em] rounded-2xl transition-all active:scale-95">
                Close Command
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Revoke Verification?"
        message="This will return the transaction to Pending status and mark the order as Unpaid. Are you sure?"
        onConfirm={handleUnverify}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Revoke"
      />
    </div>
  )
}
