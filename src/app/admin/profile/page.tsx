import { createClient } from '@/utils/supabase/server'
import { Shield, Mail, Calendar, UserCheck } from 'lucide-react'
import { getSettings } from '@/app/actions/settings'
import { AdminProfileForm } from '@/components/admin/AdminProfileForm'

export default async function AdminProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const settings = await getSettings()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your administrative account details.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-950">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-gray-800 shadow-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{profile?.full_name || 'Administrator'}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Role</label>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-blue-700 uppercase">Administrator</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Created</label>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(profile?.created_at || '').toLocaleDateString('en-PH', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic GCash Form */}
        <AdminProfileForm initialSettings={settings} />

        {/* Admin Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Admin Privileges Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You have full access to manage orders, verify payments, and oversee user accounts. Handle this power with care!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
