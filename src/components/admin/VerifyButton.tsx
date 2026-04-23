'use client'

import { useTransition } from 'react'
import { verifyPayment } from '@/app/actions/orders'
import { CheckCircle, Loader2 } from 'lucide-react'

export function VerifyButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await verifyPayment(orderId) })}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      Verify
    </button>
  )
}
