'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Define admin emails in one place
const ADMIN_EMAILS = ['manager@laundry.com', 'admin@laundrypro.com']

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed' }

  // Check role from database first
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || isAdminEmail(user.email ?? '')

  // Auto-fix: if the email is an admin email but the DB says client, update it
  if (isAdmin && profile?.role !== 'admin') {
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
  }

  if (isAdmin) {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const contactNumber = formData.get('contact_number') as string
  const address = formData.get('address') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName,
        contact_number: contactNumber,
        address: address,
        role: 'client' 
      },
    }
  })

  if (error) return { error: error.message }

  // Wait for the database trigger to create the profile
  let profile = null
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (data) {
      profile = data
      break
    }
    await new Promise(resolve => setTimeout(resolve, 400))
  }

  const isAdmin = profile?.role === 'admin' || isAdminEmail(email)

  // Auto-fix role if needed
  if (isAdmin && profile?.role !== 'admin') {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id)
    }
  }

  if (isAdmin) {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
