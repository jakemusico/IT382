'use client'

import { useState, useEffect } from 'react'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  ready: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  out_for_delivery: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  completed: 'text-gray-600 bg-gray-50 border-gray-200',
}

export function StatusUpdater({ 
  currentStatus, 
}: { 
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)

  // Sync local state with prop updates (e.g. from modal changes)
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  return (
    <div className="flex items-center">
      <div className={clsx(
        'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 shadow-sm',
        STATUS_COLORS[status]
      )}>
        {status.split('_').join(' ')}
      </div>
    </div>
  )
}
