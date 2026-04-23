'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Mail, ShoppingBag, ShieldCheck, Search, Sparkles, Settings2 } from 'lucide-react'
import { UserDetailsModal } from '@/components/admin/UserDetailsModal'
import { clsx } from 'clsx'

const SYSADMIN_EMAIL = 'manager@laundry.com'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredForStats = users.filter(u => u.email !== SYSADMIN_EMAIL)
  const clientCount = filteredForStats.filter(u => u.role === 'client').length
  const adminCount = filteredForStats.filter(u => u.role === 'admin').length

  const displayUsers = filteredForStats.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Syncing Directory...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Management</h1>
          <p className="text-gray-500 font-medium mt-1">Control access and oversight of all registered personnel.</p>
        </div>
        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Network Population', value: filteredForStats.length, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Client Base', value: clientCount, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Field Admins', value: adminCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40 flex items-center gap-6">
              <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner', stat.bg)}>
                <Icon className={clsx('w-7 h-7', stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={clsx('text-3xl font-black leading-none tracking-tight', stat.color)}>{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="px-10 py-7 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-900 rounded-2xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">Access Registry</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Click any personnel to edit</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className="group hover:bg-blue-50/40 transition-all cursor-pointer"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 font-black text-gray-400 text-xs group-hover:bg-white transition-colors shadow-sm">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-black text-gray-900 tracking-tight">{user.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-medium text-gray-500 text-sm italic">
                    {user.email}
                  </td>
                  <td className="px-10 py-6">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                      user.status === 'revoked'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    )}>
                      <div className={clsx('w-1.5 h-1.5 rounded-full', user.status === 'revoked' ? 'bg-red-500' : 'bg-emerald-500')} />
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white group-hover:bg-blue-600 group-hover:text-white rounded-xl border border-gray-100 group-hover:border-blue-600 shadow-sm transition-all active:scale-95">
                        <Settings2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Modify</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => {
            setSelectedUser(null)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}
