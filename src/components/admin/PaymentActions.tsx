'use client'

import { useTransition } from 'react'
import { deletePayment, unverifyPayment } from '@/app/actions/orders'
import { Trash2, Loader2, RotateCcw } from 'lucide-react'

export function PaymentActions({ paymentId, orderId, isVerified }: { paymentId: string; orderId: string; isVerified: boolean }) {
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this payment record? This will not delete the order.')) return

    startTransition(async () => {
      const result = await deletePayment(paymentId)
      if (result?.error) alert(result.error)
    })
  }

  async function handleUnverify() {
    if (!confirm('Are you sure you want to un-verify this payment? It will return to Pending status.')) return

    startTransition(async () => {
      const result = await unverifyPayment(orderId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {isVerified && (
        <button
          onClick={handleUnverify}
          disabled={isPending}
          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
          title="Un-verify Payment"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Delete Payment Record"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
