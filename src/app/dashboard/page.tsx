import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Clock, Loader2, CheckCircle, Package, ArrowRight } from 'lucide-react'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: Package },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const totalOrders = orders?.length ?? 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0
  const completedOrders = orders?.filter(o => o.status === 'completed').length ?? 0
  const totalSpent = orders?.reduce((sum, o) => sum + o.total_price, 0) ?? 0

  return (
    <div className="p-8">
      {/* Welcome Banner */}
      <div className="mb-8 relative overflow-hidden rounded-3xl gradient-primary p-8 text-white shadow-xl shadow-blue-100">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Hello, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-blue-100 max-w-md text-sm leading-relaxed mb-6">
            Welcome back to LaundryPro. Your laundry is our priority. Place a new order or track your existing ones below.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center gap-2 bg-white text-blue-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              New Order
            </Link>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 bg-blue-500/30 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500/40 border border-white/20 transition-all"
            >
              <Package className="w-4 h-4" />
              My History
            </Link>
          </div>
        </div>
        {/* Background blobs for visual interest */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: totalOrders, color: 'text-blue-600' },
          { label: 'Pending', value: pendingOrders, color: 'text-amber-600' },
          { label: 'Completed', value: completedOrders, color: 'text-emerald-600' },
          { label: 'Total Spent', value: `₱${totalSpent.toLocaleString()}`, color: 'text-violet-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No orders yet</p>
            <p className="text-gray-400 text-xs mt-1">Place your first order to get started</p>
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Create Order
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status as OrderStatus]
              const Icon = config.icon
              return (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', config.bg, config.color)}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">₱{order.total_price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 font-medium">{order.payment_method}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
