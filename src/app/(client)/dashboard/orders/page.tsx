'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Clock, Loader2, CheckCircle, Package, Truck } from 'lucide-react'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Package },
}

const PAYMENT_LABELS: Record<string, string> = {
  COP: 'Cash on Pickup',
  COD: 'Cash on Delivery',
  GCASH: 'GCash',
  CASH: 'Cash',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: any
    let active = true

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      // Initial Fetch
      const { data } = await supabase
        .from('orders')
        .select('*, payments(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && active) setOrders(data)
      setLoading(false)

      // Setup Realtime
      channel = supabase.channel(`client_orders_${user.id}`)
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          async () => {
            if (!active) return
            const { data: updatedData } = await supabase
              .from('orders')
              .select('*, payments(*)')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
            if (updatedData && active) setOrders(updatedData)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      active = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track your laundry in real-time.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Sync Active</span>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Your orders will appear here once created.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing
            const Icon = config.icon
            const payment = order.payments?.[0]

            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:border-blue-200 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 font-mono text-sm tracking-tight">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Placed {new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all', config.bg, config.color)}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="px-8 py-8 bg-gray-50/30 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-gray-50">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</p>
                    <p className="text-xl font-black text-gray-900 leading-none">₱{order.total_price.toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment</p>
                    <p className="text-sm font-bold text-gray-700 leading-none">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financial Status</p>
                    <div className="flex">
                      <span className={clsx(
                        'inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                        order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        order.payment_status === 'verifying' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-50 text-gray-400 border border-gray-100'
                      )}>
                        {order.payment_status === 'paid' ? '✓ Paid' :
                         order.payment_status === 'verifying' ? '⏳ Verifying' :
                         'Unpaid'}
                      </span>
                    </div>
                  </div>

                  {payment?.gcash_proof_url && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">GCash Ledger</p>
                      <a
                        href={payment.gcash_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" /> View Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
