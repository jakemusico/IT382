'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'
import { Loader2, ChevronDown } from 'lucide-react'

const STATUSES: OrderStatus[] = ['pending', 'processing', 'ready', 'completed']

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  ready: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  completed: 'text-gray-600 bg-gray-50 border-gray-200',
}

export function StatusUpdater({ 
  orderId, 
  currentStatus, 
  onUpdate 
}: { 
  orderId: string; 
  currentStatus: OrderStatus;
  onUpdate?: () => void;
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)

  function handleUpdate(newStatus: OrderStatus) {
    setOpen(false)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus)
      if (result?.error) {
        alert('Error: ' + result.error)
      } else {
        setStatus(newStatus)
        if (onUpdate) onUpdate()
      }
    })
  }

  return (
    <div className="relative flex items-center gap-3">
      {/* Current Status Badge */}
      <div className={clsx(
        'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500',
        STATUS_COLORS[status]
      )}>
        {status}
      </div>

      {/* Action Trigger */}
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={clsx(
          'p-2 rounded-full bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 active:scale-90',
          open ? 'ring-4 ring-blue-500/10 text-blue-600 border-blue-200 bg-blue-50' : ''
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className={clsx('w-4 h-4 transition-transform duration-500', open ? 'rotate-180' : '')} />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-3 w-48 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl z-20 p-2 space-y-1 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
            <div className="px-4 py-2 mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Progress</p>
            </div>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleUpdate(s)}
                className={clsx(
                  'w-full text-left px-4 py-3 text-[11px] font-black capitalize transition-all duration-300 rounded-full flex items-center gap-3 group relative overflow-hidden',
                  s === status 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-100' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:scale-95'
                )}
              >
                <span className={clsx(
                  'w-2.5 h-2.5 rounded-full transition-all duration-500 border-2',
                  s === status ? 'bg-white border-white' : 'bg-gray-200 border-gray-100 group-hover:bg-blue-400 group-hover:border-blue-200'
                )} />
                {s}
                
                {/* Bubble reflection effect */}
                <div className="absolute top-1 left-2 w-full h-1/2 bg-white/10 rounded-full blur-[2px] pointer-events-none" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
