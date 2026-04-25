import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your personal information and account security.</p>
      </div>

      <ProfileForm profile={profile} userEmail={user.email!} />

      {/* Security Notice */}
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 flex gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Enterprise Security</p>
          <p className="text-[11px] text-blue-700 mt-1 font-medium leading-relaxed">
            Your account data is encrypted and protected by Supabase Auth. To change your password, please use the &quot;Forgot Password&quot; flow during login for maximum security.
          </p>
        </div>
      </div>
    </div>
  )
}
