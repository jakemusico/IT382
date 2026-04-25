import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Clock, Loader2, CheckCircle, Package, ArrowRight, Bell, Truck } from 'lucide-react'
import { OrderStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck },
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
      <div className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-10 lg:p-12 text-white shadow-2xl shadow-blue-200/50 group">
        {/* Technical Notification HUD - Pushed further right */}
        <div className="absolute top-8 right-10 z-20">
          <button className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xl transition-all active:scale-90 group/hud relative shadow-inner">
            <div className="relative">
              <Bell className="w-6 h-6 text-white/90 group-hover/hud:text-white transition-colors" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1 flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400 border-2 border-blue-600"></span>
              </div>
            </div>
            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br-lg" />
          </button>
        </div>

        <div className="relative z-10 pr-24"> {/* Added padding-right to protect the HUD area */}
          <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-4 opacity-80">Welcome Back to LaundryPro</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Hello, {profile?.full_name?.split(' ')[0] ?? 'there'} <span className="animate-pulse">_</span>
          </h1>
          <p className="text-blue-100/90 max-w-md text-sm lg:text-base font-medium leading-relaxed mb-10">
            Everything is set for your fresh experience today. <br className="hidden lg:block" />
            <span className="text-white font-bold">READY TO SERVE</span> // You have {pendingOrders} order{pendingOrders !== 1 ? 's' : ''} in progress.
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
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing
              const Icon = config.icon
              return (
                <div key={order.id} className="px-6 py-4 flex items-center group hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 font-mono tracking-tight">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-28 flex justify-end">
                      <div className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                        config.bg, config.color
                      )}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </div>
                    
                    <div className="w-20 text-right">
                      <p className="text-sm font-black text-gray-900 tracking-tighter">
                        ₱{order.total_price.toLocaleString()}
                      </p>
                    </div>

                    <div className="w-16 text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {order.payment_method}
                      </p>
                    </div>
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
