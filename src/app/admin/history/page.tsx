'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { Package, Search, Sparkles, CheckCircle2, Settings2, Trash2, Loader2, Square, CheckSquare } from 'lucide-react'
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { deleteOrders } from '@/app/actions/orders'
import { clsx } from 'clsx'

export default function AdminHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Management States
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const supabase = createClient()

  async function fetchHistory() {
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = () => {
    if (selectedIds.length === 0) return
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    setShowDeleteConfirm(false)
    const idsToDelete = [...selectedIds] // Capture IDs before clearing

    // Optimistic Update: Remove from UI immediately
    const previousOrders = [...orders]
    setOrders(prev => prev.filter(o => !idsToDelete.includes(o.id)))
    setSelectedIds([])
    setIsManageMode(false)

    startDeleteTransition(async () => {
      const result = await deleteOrders(idsToDelete)
      if (result?.error) {
        alert("Server Error: " + result.error)
        // Revert on error
        setOrders(previousOrders)
      } else {
        // Success: already handled optimistically, just sync with DB
        fetchHistory()
      }
    })
  }

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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">History</h1>
          <p className="text-gray-500 font-medium mt-1">Registry of all settled transactions and completed services.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Management Actions */}
          <div className="flex items-center gap-2">
            {isManageMode && selectedIds.length > 0 && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Selected ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => {
                setIsManageMode(!isManageMode)
                setSelectedIds([])
              }}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border shadow-sm",
                isManageMode
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"
              )}
            >
              <Settings2 className="w-4 h-4" />
              {isManageMode ? 'Exit Management' : 'Manage Records'}
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>
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
                {isManageMode && (
                  <th className="pl-10 py-5 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {selectedIds.length === filteredOrders.length ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                  </th>
                )}
                <th className={clsx("px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]", isManageMode && "pl-4")}>Order</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Value</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dispatch</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Outcome</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Closed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.includes(order.id)
                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      if (isManageMode) {
                        toggleSelect(order.id)
                      } else {
                        setSelectedOrder(order)
                      }
                    }}
                    className={clsx(
                      "group transition-all cursor-pointer",
                      isSelected ? "bg-blue-50/50" : "hover:bg-blue-50/50"
                    )}
                  >
                    {isManageMode && (
                      <td className="pl-10 py-6" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelect(order.id)}
                          className="p-1 rounded-md transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className={clsx("px-10 py-6", isManageMode && "pl-4")}>
                      <span className={clsx(
                        "font-mono text-sm font-black transition-colors",
                        isSelected ? "text-blue-600" : "text-gray-300 group-hover:text-gray-900"
                      )}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-gray-900 leading-none mb-1">
                        {order.is_walk_in ? (order.customer_name || 'Walk-In Customer') : (order.users?.full_name ?? '—')}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">
                        {order.is_walk_in ? 'Counter Transaction' : order.users?.email}
                      </p>
                    </td>
                    <td className="px-10 py-6 font-black text-gray-900 text-sm">
                      ₱{order.total_price.toLocaleString()}
                    </td>
                    <td className="px-10 py-6">
                      <span className={clsx(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        order.delivery_type === 'delivery' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                      )}>
                        {order.delivery_type === 'delivery' ? 'Delivery' : 'Pick Up'}
                      </span>
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
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-[11px] font-black text-gray-300">
                          {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="mx-1 opacity-50">•</span>
                          {new Date(order.created_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        {!isManageMode && (
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-200 group-hover:-translate-x-1">
                            <Search className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          readOnly={true}
          onClose={() => {
            setSelectedOrder(null)
            fetchHistory()
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Destroy Archives?"
        message={`You are about to permanently erase ${selectedIds.length} historical records. This action is irreversible.`}
        confirmText="Yes, Erase Records"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
