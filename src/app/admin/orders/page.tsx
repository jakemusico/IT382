'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Eye, Loader2, Sparkles, Shirt, PlusCircle } from 'lucide-react'
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal'
import { StatusUpdater } from '@/components/admin/StatusUpdater'
import { WalkInOrderModal } from '@/components/admin/WalkInOrderModal'
import { clsx } from 'clsx'
import { OrderStatus } from '@/types'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'text-gray-400 bg-gray-50 border-gray-100',
  verifying: 'text-amber-700 bg-amber-50 border-amber-100',
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-100',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function fetchOrders() {
    // Filter: (status != completed) OR (payment_status != paid)
    const { data } = await supabase
      .from('orders')
      .select('*, users(full_name, email, role, contact_number), payments(*)')
      .neq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Syncing Active Fleet...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Orders</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time oversight of ongoing laundry and payments.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsWalkInModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Walk-In Order
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Feed</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="px-10 py-7 border-b border-gray-50 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Order Lifecycle</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Click any row to manage lifecycle</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dispatch</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[180px]">Progress</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Audited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="group hover:bg-blue-50/40 transition-all cursor-pointer"
                >
                  <td className="px-6 py-6">
                    <span className="font-mono text-sm font-black text-gray-300 group-hover:text-blue-500 transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">
                      {order.is_walk_in ? (order.customer_name || 'Walk-In Customer') : (order.users?.full_name ?? '—')}
                    </p>
                    <p className="text-[11px] font-bold text-gray-400">
                      {order.is_walk_in ? (order.customer_email || 'Counter Transaction') : order.users?.email}
                    </p>
                  </td>
                  <td className="px-6 py-6 font-black text-gray-900 text-sm italic">
                    ₱{order.total_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-6">
                    <span className={clsx(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      order.delivery_type === 'delivery' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                      {order.delivery_type === 'delivery' ? 'Delivery' : 'Pick Up'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-gray-200">
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={clsx(
                      'inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider',
                      PAYMENT_STATUS_COLORS[order.payment_status]
                    )}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <StatusUpdater 
                      currentStatus={order.status as OrderStatus} 
                    />
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="text-[11px] font-black text-gray-300 group-hover:text-gray-500 transition-colors">
                      {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="mx-1 opacity-50">•</span>
                      {new Date(order.created_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => {
            setSelectedOrder(null)
            fetchOrders()
          }}
        />
      )}

      <WalkInOrderModal 
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </div>
  )
}
