'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createJSClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { isValidPHMobile } from '@/utils/validation'

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

export async function updateUserDetails(userId: string, data: { email: string, full_name: string, contact_number?: string, address?: string, role: string, status: string }) {
  const supabase = await createClient()
  const { isAdmin, user: adminUser } = await isAdminUser(supabase)
  
  if (!adminUser || !isAdmin) return { error: 'Unauthorized' }

  // Strict privacy: Admin can only modify Role and Status
  const updates: any = {}

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
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/')
  return { success: true }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  const { isAdmin, user: adminUser } = await isAdminUser(supabase)
  
  if (!adminUser || !isAdmin) return { error: 'Unauthorized' }

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const address = formData.get('address') as string
  const contactNumber = formData.get('contact_number') as string
  
  if (contactNumber && !isValidPHMobile(contactNumber)) {
    return { error: 'Invalid 11-digit Philippine mobile number required (09XXXXXXXXX)' }
  }

  // Use a stateless client so it doesn't modify the admin's session cookies
  const statelessSupabase = createJSClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await statelessSupabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, contact_number: contactNumber, address: address, role: 'client' },
    }
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/')
  return { success: true }
}

export async function updateUserProfile(data: { full_name?: string, contact_number?: string, address?: string, email?: string, password?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const updates: any = {}
  if (data.full_name) updates.full_name = data.full_name
  if (data.address) updates.address = data.address
  if (data.email) updates.email = data.email

  if (data.contact_number) {
    if (!isValidPHMobile(data.contact_number)) {
      return { error: 'Invalid 11-digit Philippine mobile number required' }
    }
    updates.contact_number = data.contact_number
  }

  if (Object.keys(updates).length > 0) {
    const { error: dbError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    
    if (dbError) return { error: dbError.message }
  }

  const authUpdates: any = {}
  if (data.password) authUpdates.password = data.password
  if (data.email) authUpdates.email = data.email

  let emailRequiresConfirmation = false
  if (Object.keys(authUpdates).length > 0) {
    const { data: authData, error: authError } = await supabase.auth.updateUser(authUpdates)
    if (authError) return { error: authError.message }
    
    // If Supabase flags a new email as pending, we need to tell the user
    if (data.email && authData?.user?.new_email) {
      emailRequiresConfirmation = true
    }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/dashboard/profile')
  revalidatePath('/')
  
  if (emailRequiresConfirmation) {
    return { 
      success: true, 
      message: 'Profile saved! Please check your new email inbox for a confirmation link. You must click it before you can log in with the new email.' 
    }
  }

  return { success: true }
}
