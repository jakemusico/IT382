'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { CreditCard, Eye, Trash2, Loader2, Sparkles } from 'lucide-react'
import { PaymentDetailsModal } from '@/components/admin/PaymentDetailsModal'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { deletePayment } from '@/app/actions/orders'
import { clsx } from 'clsx'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*, orders(id, total_price, payment_method, payment_status, users(full_name, email))')
      .order('created_at', { ascending: false })
    
    if (data) setPayments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  async function handleDelete() {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    setIsDeleting(id)
    const result = await deletePayment(id)
    if (result?.error) alert(result.error)
    else fetchPayments()
    setIsDeleting(null)
  }

  const pendingPayments = payments?.filter(p => p.status === 'pending' && p.gcash_proof_url) ?? []
  const verifiedPayments = payments?.filter(p => p.status === 'verified') ?? []

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-gray-400 font-medium animate-pulse">Loading Registry...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Command</h1>
        <p className="text-gray-500 font-medium mt-1">Review, audit, and verify all incoming transactions.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Volume', value: payments.length, color: 'text-blue-600', bg: 'bg-white', sub: 'Total Records' },
          { label: 'Awaiting Verification', value: pendingPayments.length, color: 'text-amber-600', bg: 'bg-amber-50/50', sub: 'GCash Submissions' },
          { label: 'Settled', value: verifiedPayments.length, color: 'text-emerald-600', bg: 'bg-emerald-50/50', sub: 'Verified Payments' },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group", s.bg)}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <p className={clsx('text-4xl font-black', s.color)}>{s.value}</p>
              <p className="text-xs font-bold text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All Payments Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="px-10 py-7 border-b border-gray-50 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Transaction Registry</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Click any row for details</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <tr 
                  key={payment.id} 
                  onClick={() => setSelectedPayment(payment)}
                  className="group hover:bg-blue-50/40 transition-all cursor-pointer"
                >
                  <td className="px-10 py-6">
                    <span className="font-mono text-sm font-black text-gray-300 group-hover:text-blue-500 transition-colors">
                      #{payment.orders?.id?.slice(0, 8).toUpperCase() ?? '—'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{payment.orders?.users?.full_name ?? '—'}</p>
                    <p className="text-[11px] text-gray-400 font-bold">{payment.orders?.users?.email}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-gray-200">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-base font-black text-gray-900 tracking-tight">₱{payment.orders?.total_price?.toLocaleString() ?? '—'}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={clsx(
                      'inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider',
                      payment.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    )}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="p-2.5 text-gray-300 group-hover:text-blue-600 bg-gray-50 group-hover:bg-blue-100 rounded-2xl transition-all">
                        <Eye className="w-5 h-5" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(payment.id)
                        }}
                        className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        {isDeleting === payment.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailsModal 
          payment={selectedPayment}
          isOpen={!!selectedPayment}
          onClose={() => {
            setSelectedPayment(null)
            fetchPayments()
          }}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Record?"
        message="This will permanently remove the payment log. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  )
}
