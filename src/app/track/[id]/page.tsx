import { createClient } from '@/utils/supabase/server'
import { Package, Clock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Package },
}

export default async function TrackOrderPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, users(full_name)')
    .eq('id', id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {!order ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-500 text-sm mb-6">We couldn&apos;t find an order with that ID. Please check the ID and try again.</p>
            <Link href="/" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Try Another ID
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-blue-600 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Tracking Order</p>
              <h1 className="text-xl font-bold font-mono mt-1">#{order.id.slice(0, 8).toUpperCase()}</h1>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className={clsx(
                  'w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md',
                  STATUS_CONFIG[order.status as OrderStatus].bg
                )}>
                  {(() => {
                    const Icon = STATUS_CONFIG[order.status as OrderStatus].icon
                    return <Icon className={clsx('w-10 h-10', STATUS_CONFIG[order.status as OrderStatus].color, order.status === 'processing' && 'animate-spin')} />
                  })()}
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {STATUS_CONFIG[order.status as OrderStatus].label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Customer: <span className="font-semibold text-gray-700">{order.users?.full_name || 'Guest'}</span>
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {(['pending', 'processing', 'ready', 'completed'] as OrderStatus[]).map((step, idx) => {
                  const isCurrent = order.status === step
                  const isPast = ['pending', 'processing', 'ready', 'completed'].indexOf(order.status) >= idx
                  
                  return (
                    <div key={step} className="flex items-center gap-4 relative z-10">
                      <div className={clsx(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all',
                        isPast ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-300'
                      )}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={clsx(
                          'text-sm font-semibold capitalize',
                          isCurrent ? 'text-blue-600' : isPast ? 'text-gray-900' : 'text-gray-300'
                        )}>
                          {step}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-blue-500 font-medium animate-pulse">Current Status</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Payment</p>
                  <p className="text-sm font-bold text-gray-900">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                  <p className="text-sm font-bold text-blue-700">₱{order.total_price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            LaundryPro Tracking System &bull; &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
