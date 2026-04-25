import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTopNav } from '@/components/admin/AdminTopNav'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Must match the list in auth.ts and proxy.ts
const ADMIN_EMAILS = ['manager@laundry.com', 'admin@laundrypro.com']

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Check both DB role AND email for admin status
  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')

  // Auto-fix: update the DB role if it's wrong
  if (isAdmin && profile?.role !== 'admin') {
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
  }

  if (!isAdmin) redirect('/dashboard')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNav user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
