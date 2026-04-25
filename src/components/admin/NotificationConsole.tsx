'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Package, RefreshCcw, Truck, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { getAdminLogs } from '@/app/actions/logs'
import { clsx } from 'clsx'

import { createClient } from '@/utils/supabase/client'

export function NotificationConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await getAdminLogs()
    if (data) {
      setLogs(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    // Initial fetch on load
    fetchLogs()

    // Subscribe to new logs via Supabase Realtime
    const channel = supabase
      .channel('admin-logs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev].slice(0, 20))
        setUnreadCount((prev) => prev + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0) // Clear badge when opened
      fetchLogs() // Refresh just to be safe
    }
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'create': return <Package className="w-3.5 h-3.5 text-blue-500" />
      case 'update': return <RefreshCcw className="w-3.5 h-3.5 text-amber-500" />
      case 'delivery': return <Truck className="w-3.5 h-3.5 text-indigo-500" />
      case 'complete': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      default: return <Bell className="w-3.5 h-3.5 text-gray-500" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button 
        onClick={handleToggle}
        className="relative p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/30 transition-all active:scale-95 group shadow-sm"
      >
        <Bell className={clsx("w-5 h-5 transition-colors", isOpen ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-blue-600 border-2 border-white rounded-full text-[9px] font-black text-white animate-in zoom-in duration-300">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-8 py-6 border-b border-gray-50 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Admin Action Logs</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Real-time audit stream</p>
              </div>
              <button 
                onClick={fetchLogs}
                disabled={loading}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <RefreshCcw className="w-4 h-4 text-gray-400" />}
              </button>
            </div>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 && !loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No recent actions</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-blue-50/20 transition-colors group cursor-default">
                      <div className="flex gap-4">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-xl border border-gray-50 shadow-sm group-hover:border-blue-100 group-hover:shadow-blue-100/50 transition-all">
                          {getIcon(log.action_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                              {log.action_type}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                          <p className="text-xs font-bold text-gray-700 leading-relaxed">
                            {log.message}
                          </p>
                          {log.order_id && (
                            <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                              <span>Ref: #{log.order_id.slice(0, 8).toUpperCase()}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 py-4 bg-gray-50/50 text-center">
              <a 
                href="/admin/activity"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors inline-block"
              >
                View All Activity
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
