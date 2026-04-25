'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, verifyPayment, unverifyPayment } from '@/app/actions/orders'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { X, Package, User, CreditCard, Hash, Calendar, Loader2, CheckCircle, CheckCircle2, Clock, Truck, Shirt, ExternalLink, Image as ImageIcon, RefreshCcw, Sparkles, MapPin, Phone, ShieldCheck, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { OrderStatus } from '@/types'

interface OrderDetailsModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
  readOnly?: boolean
}

const STATUSES_PICKUP: OrderStatus[] = ['pending', 'processing', 'ready', 'completed']
const STATUSES_DELIVERY: OrderStatus[] = ['pending', 'processing', 'ready', 'out_for_delivery', 'completed']

export function OrderDetailsModal({ order, isOpen, onClose, readOnly = false }: OrderDetailsModalProps) {
  const [isPending, startTransition] = useTransition()

  const isDeliveryOrder = order.delivery_type === 'delivery'
  const currentStatuses = isDeliveryOrder ? STATUSES_DELIVERY : STATUSES_PICKUP
  const isGcashOrder = order.payment_method === 'GCASH'
  const isPaid = order.payment_status === 'paid'

  // Local state for staged status
  const [stagedStatus, setStagedStatus] = useState<OrderStatus>(order.status)
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false)
  if (!isOpen) return null

  const user = order.users
  const payment = order.payments?.[0]
  const hasChanges = stagedStatus !== order.status

  async function handleUpdateStatus() {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, stagedStatus)
      if (result?.error) {
        alert(result.error)
        return
      }
      onClose()
    })
  }

  async function handleVerifyPayment() {
    startTransition(async () => {
      const result = await verifyPayment(order.id)
      if (result?.error) {
        alert(result.error)
        return
      }
      setShowVerifyConfirm(false)
      onClose()
    })
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-2xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Operation Command</h3>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                      isDeliveryOrder ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>{order.delivery_type}</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-300 mt-0.5 uppercase tracking-wider">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.created_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-300 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-10 custom-scrollbar">
          <div className="space-y-10">

            {/* 1. Status Lifecycle (Main Focus) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Laundry Cycle Progress</p>
                {hasChanges && <span className="text-[9px] font-black text-blue-600 uppercase animate-pulse">Changes Pending</span>}
              </div>
              <div className={clsx("grid gap-2", isDeliveryOrder ? "grid-cols-5" : "grid-cols-4")}>
                {currentStatuses.map((status) => {
                  const currentIndex = currentStatuses.indexOf(order.status)
                  const targetIndex = currentStatuses.indexOf(status)

                  const isClickable = !readOnly && order.status !== 'completed' && (targetIndex === currentIndex || targetIndex === currentIndex + 1)
                  const isCompleted = targetIndex < currentIndex

                  return (
                    <button
                      key={status}
                      disabled={!isClickable}
                      onClick={() => setStagedStatus(status)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-300 group relative overflow-hidden',
                        stagedStatus === status
                          ? 'bg-white border-gray-900 shadow-xl shadow-gray-100 scale-[1.02]'
                          : isCompleted
                            ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-600/40 cursor-not-allowed'
                            : isClickable
                              ? 'bg-gray-50/50 border-transparent text-gray-400 hover:border-gray-200 hover:bg-white'
                              : 'bg-gray-50/30 border-transparent text-gray-200 cursor-not-allowed'
                      )}
                    >
                      {isCompleted && <div className="absolute top-2 right-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /></div>}

                      {status === 'pending' && <Clock className={clsx('w-4 h-4', stagedStatus === status ? 'text-amber-500' : isCompleted ? 'text-emerald-500/30' : 'text-gray-300')} />}
                      {status === 'processing' && <RefreshCcw className={clsx('w-4 h-4', stagedStatus === status ? 'text-blue-500' : isCompleted ? 'text-emerald-500/30' : 'text-gray-300')} />}
                      {status === 'ready' && <Shirt className={clsx('w-4 h-4', stagedStatus === status ? 'text-emerald-500' : isCompleted ? 'text-emerald-500/30' : 'text-gray-300')} />}
                      {status === 'out_for_delivery' && <Truck className={clsx('w-4 h-4', stagedStatus === status ? 'text-emerald-600' : isCompleted ? 'text-emerald-500/30' : 'text-gray-300')} />}
                      {status === 'completed' && <CheckCircle className={clsx('w-4 h-4', stagedStatus === status ? 'text-gray-900' : 'text-gray-300')} />}

                      <span className={clsx(
                        'text-[8px] font-black uppercase tracking-tighter transition-colors text-center leading-tight',
                        stagedStatus === status ? 'text-gray-900' : isCompleted ? 'text-emerald-600/30' : 'text-gray-300'
                      )}>{status.split('_').join(' ')}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Customer & Logistics details */}
            <div className="grid grid-cols-2 gap-10 py-10 border-y border-gray-50">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl"><User className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                    <p className="text-sm font-black text-gray-900 leading-tight">{user?.full_name || 'Walk-In Customer'}</p>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <p className="text-[11px] font-medium text-gray-400">{user?.email || 'Counter Transaction'}</p>
                      <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {order.delivery_contact || user?.contact_number || 'No contact provided'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl"><Shirt className="w-4 h-4 text-blue-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Handover Info</p>
                    <p className="text-sm font-black text-gray-900 leading-tight capitalize">{order.delivery_type.replace('_', ' ')}</p>
                    {isDeliveryOrder && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-gray-600 leading-tight">{order.delivery_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-bold text-gray-600">{order.delivery_contact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl"><Hash className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Service Reference</p>
                    <p className="text-sm font-black text-gray-900 font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
                    <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-widest">Method: {order.payment_method}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl"><Calendar className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Registered On</p>
                    <p className="text-sm font-black text-gray-900 leading-tight">
                      {new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* 3. GCash Verification Section */}
            {isGcashOrder && !isPaid && !readOnly && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Payment Verification Required</h4>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-8 space-y-6">
                  {payment?.gcash_proof_url ? (
                    <div className="space-y-6">
                      <div className="relative group rounded-3xl overflow-hidden border-2 border-white shadow-xl aspect-auto min-h-[200px] bg-white flex items-center justify-center">
                        <img src={payment.gcash_proof_url} alt="Proof" className="w-full h-auto max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <a href={payment.gcash_proof_url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                            <ExternalLink className="w-4 h-4" /> View Full Receipt
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowVerifyConfirm(true)}
                          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve Payment
                        </button>
                        <button className="flex-1 py-4 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Reject Proof
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white border border-blue-50 rounded-3xl">
                      <ImageIcon className="w-10 h-10 text-blue-100 mx-auto mb-3" />
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Awaiting Customer Upload</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show simple paid status if already verified */}
            {isGcashOrder && isPaid && (
              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Financial Status</p>
                    <p className="text-sm font-black text-gray-900">Payment Verified via GCash</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>
        </div>

        {/* Footer: Dedicated Status Update */}
        <div className="p-10 border-t border-gray-50 bg-gray-50/30 shrink-0">
          {!readOnly ? (
            <button
              onClick={handleUpdateStatus}
              disabled={isPending || !hasChanges}
              className="w-full py-5 rounded-full bg-gray-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Update Laundry Cycle
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-5 rounded-full bg-white border border-gray-100 text-gray-900 text-[11px] font-black uppercase tracking-[0.3em] shadow-sm transition-all active:scale-95"
            >
              Dismiss Command
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showVerifyConfirm}
        title="Approve Settlement?"
        message="You are about to verify this GCash payment. This will mark the order as PAID and finalize the financial record."
        onConfirm={handleVerifyPayment}
        onCancel={() => setShowVerifyConfirm(false)}
        confirmText="Yes, Approve"
      />
    </div>
  )
}
