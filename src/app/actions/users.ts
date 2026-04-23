'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAILS = ['manager@laundry.com', 'admin@laundrypro.com']

async function isAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false, user: null }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')
  return { isAdmin, user }
}

export async function updateUserDetails(userId: string, data: { email: string, full_name: string, role: string, status: string }) {
  const supabase = await createClient()
  const { isAdmin, user: adminUser } = await isAdminUser(supabase)
  
  if (!adminUser || !isAdmin) return { error: 'Unauthorized' }

  // Prevent self-modification of role/status to be safe
  const updates: any = { 
    email: data.email,
    full_name: data.full_name,
  }

  if (userId !== adminUser.id) {
    updates.role = data.role
    updates.status = data.status
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
