'use client'

import { useState, useTransition } from 'react'
import { verifyPayment, unverifyPayment } from '@/app/actions/orders'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { X, CheckCircle, RotateCcw, User, CreditCard, Hash, Calendar, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface PaymentDetailsModalProps {
  payment: any
  isOpen: boolean
  onClose: () => void
}

export function PaymentDetailsModal({ payment, isOpen, onClose }: PaymentDetailsModalProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isOpen) return null

  const order = payment.orders
  const user = order?.users
  const isVerified = payment.status === 'verified'

  async function handleVerify() {
    startTransition(async () => {
      const result = await verifyPayment(payment.order_id)
      if (result?.error) alert(result.error)
      else onClose()
    })
  }

  async function handleUnverify() {
    setShowConfirm(false)
    startTransition(async () => {
      const result = await unverifyPayment(payment.order_id)
      if (result?.error) alert(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content - "Bubble Effect" */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 fill-mode-both">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-600" />
            Transaction Details
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {/* Main Info Card */}
          <div className="space-y-6">
            {/* Amount & Method */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-4xl font-black text-gray-900">₱{order?.total_price?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  <CreditCard className="w-4 h-4" />
                  {payment.method}
                </span>
              </div>
            </div>

            {/* Status Bar */}
            <div className={clsx(
              "p-4 rounded-2xl flex items-center justify-between border",
              isVerified ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-amber-50 border-amber-100 text-amber-800"
            )}>
              <div className="flex items-center gap-3">
                {isVerified ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />}
                <div>
                  <p className="text-sm font-bold capitalize">{payment.status}</p>
                  <p className="text-xs opacity-70">{isVerified ? 'Payment confirmed' : 'Awaiting verification'}</p>
                </div>
              </div>
            </div>

            {/* Financial Audit Grid */}
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-gray-300 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</p>
                    <p className="text-sm font-black text-gray-900 font-mono tracking-tight">{payment.id.slice(0, 12).toUpperCase()}</p>
                    <p className="text-[10px] font-medium text-gray-400 italic">Audit Log: {payment.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-blue-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel</p>
                    <p className="text-sm font-black text-gray-900">{payment.method}</p>
                    <p className="text-[11px] font-medium text-gray-400">Merchant Account: Primary</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-300 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement Date</p>
                    <p className="text-sm font-black text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                      UTC Offset: +08:00
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-emerald-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payer Account</p>
                    <p className="text-sm font-black text-gray-900">{user?.full_name}</p>
                    <p className="text-[11px] font-medium text-gray-400">Verified Identity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Section */}
            {payment.gcash_proof_url ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Proof</p>
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200">
                  <img 
                    src={payment.gcash_proof_url} 
                    alt="Proof" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={payment.gcash_proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Size
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">
                  {payment.method === 'GCASH' ? 'Awaiting GCash Proof' : 'No proof provided'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {payment.method === 'GCASH' ? 'Customer needs to upload receipt' : 'Proof is optional for this method'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          {isVerified ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
              Un-verify Payment
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Confirm Verification
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-2xl transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Un-verify Payment?"
        message="This will return the transaction to Pending status and mark the order as Unpaid. Are you sure?"
        onConfirm={handleUnverify}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Un-verify"
        isDestructive={false}
      />
    </div>
  )
}
