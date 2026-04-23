'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Package, Search, Sparkles, CheckCircle2 } from 'lucide-react'
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal'
import { clsx } from 'clsx'

export default function AdminHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  async function fetchHistory() {
    // Filter: (status == completed) AND (payment_status == paid)
    const { data } = await supabase
      .from('orders')
      .select('*, users(full_name, email, role), payments(*)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const filteredOrders = orders.filter(o => 
    o.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Retrieving Archives...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Archived History</h1>
          <p className="text-gray-500 font-medium mt-1">Registry of all settled transactions and completed services.</p>
        </div>
        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="px-10 py-7 border-b border-gray-50 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-900 rounded-2xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Closed Accounts</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{filteredOrders.length} records found</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Value</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Outcome</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Closed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="group hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <td className="px-10 py-6">
                    <span className="font-mono text-sm font-black text-gray-300 group-hover:text-gray-900 transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">
                      {order.users?.role === 'admin' ? 'Walk-In Customer' : (order.users?.full_name ?? '—')}
                    </p>
                    <p className="text-[11px] text-gray-400 font-bold">
                      {order.users?.role === 'admin' ? 'Counter Transaction' : order.users?.email}
                    </p>
                  </td>
                  <td className="px-10 py-6 font-black text-gray-900 text-sm">
                    ₱{order.total_price.toLocaleString()}
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-[11px] font-black text-gray-300">
                      {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            fetchHistory()
          }}
        />
      )}
    </div>
  )
}
