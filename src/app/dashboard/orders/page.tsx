import { createClient } from '@/utils/supabase/server'
import { Clock, Loader2, CheckCircle, Package } from 'lucide-react'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Package },
}

const PAYMENT_LABELS: Record<string, string> = {
  COP: 'Cash on Pickup',
  COD: 'Cash on Delivery',
  GCASH: 'GCash',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, payments(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your laundry orders and payment status.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Your orders will appear here once created.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status as OrderStatus]
            const Icon = config.icon
            const payment = order.payments?.[0]

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-blue-200 transition-colors">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 font-mono text-sm">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed {new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', config.bg, config.color)}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-4 flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Amount</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">₱{order.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{PAYMENT_LABELS[order.payment_method]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment Status</p>
                    <span className={clsx(
                      'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                      order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                      order.payment_status === 'verifying' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-50 text-gray-600'
                    )}>
                      {order.payment_status === 'paid' ? '✓ Paid' :
                       order.payment_status === 'verifying' ? '⏳ Verifying' :
                       'Unpaid'}
                    </span>
                  </div>
                  {payment?.gcash_proof_url && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">GCash Proof</p>
                      <a
                        href={payment.gcash_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-0.5 block"
                      >
                        View Screenshot
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
