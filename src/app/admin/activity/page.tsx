'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Clock, Activity, Loader2, Package, RefreshCcw, Truck, CheckCircle2, ChevronRight, Bell } from 'lucide-react'
import { clsx } from 'clsx'

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAllLogs() {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setLogs(data)
      setLoading(false)
    }
    fetchAllLogs()
  }, [])

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'create': return <Package className="w-5 h-5 text-blue-500" />
      case 'update': return <RefreshCcw className="w-5 h-5 text-amber-500" />
      case 'delivery': return <Truck className="w-5 h-5 text-indigo-500" />
      case 'delete': return <CheckCircle2 className="w-5 h-5 text-red-500" />
      case 'complete': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Loading Activity...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Activity</h1>
          <p className="text-gray-500 font-medium mt-1">A comprehensive audit trail of all administrative actions.</p>
        </div>
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <Activity className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Activity Found</h3>
            <p className="text-sm font-bold text-gray-400">There are no administrative logs to display yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="p-8 hover:bg-blue-50/20 transition-colors group">
                <div className="flex gap-6 items-start">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm group-hover:border-blue-200 group-hover:shadow-blue-200/50 transition-all">
                    {getIcon(log.action_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        {log.action_type}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        {new Date(log.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="opacity-50">•</span>
                        {new Date(log.created_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                    <p className="text-base font-bold text-gray-800 leading-relaxed">
                      {log.message}
                    </p>
                    {log.order_id && (
                      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-wider">
                        <span className="px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100">
                          Reference ID: #{log.order_id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
