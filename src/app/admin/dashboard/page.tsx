import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, Users, Clock, TrendingUp, ArrowUpRight, Package } from 'lucide-react'
import { clsx } from 'clsx'
import { OrderStatus } from '@/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-blue-700 bg-blue-50 border-blue-200',
  ready: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  completed: 'text-gray-600 bg-gray-50 border-gray-200',
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalOrders, error: ordersErr },
    { count: totalUsers, error: usersErr },
    { count: pendingOrders, error: pendingErr },
    { data: recentOrders, error: recentErr },
    { data: revenue, error: revenueErr },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('orders')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('orders').select('total_price'),
  ])

  if (ordersErr || usersErr || pendingErr || recentErr || revenueErr) {
    console.error('Dashboard Fetch Error:', { ordersErr, usersErr, pendingErr, recentErr, revenueErr })
  }

  const totalRevenue = revenue?.reduce((sum, o) => sum + o.total_price, 0) ?? 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your laundry business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Clients', value: totalUsers ?? 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Pending Orders', value: pendingOrders ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={clsx('w-4 h-4', stat.color)} />
                </div>
              </div>
              <p className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.users?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{order.users?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-semibold text-gray-900">₱{order.total_price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{order.payment_method}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize', STATUS_COLORS[order.status as OrderStatus])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
