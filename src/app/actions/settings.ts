'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function isAdminUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'global')
    .single()

  if (error || !data) {
    // Return defaults if table doesn't exist or record missing
    return {
      gcash_number: '0909-203-9693',
      gcash_qr_url: '/images/gcash-qr.png'
    }
  }

  return data
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  if (!(await isAdminUser(supabase))) return { error: 'Unauthorized' }

  const gcashNumber = formData.get('gcash_number') as string
  const qrFile = formData.get('gcash_qr') as File | null

  const updates: any = { gcash_number: gcashNumber }

  if (qrFile && qrFile.size > 0) {
    const fileName = `settings/gcash-qr-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('gcash-proofs') // Reusing the existing bucket for simplicity
      .upload(fileName, qrFile)

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('gcash-proofs')
      .getPublicUrl(fileName)

    updates.gcash_qr_url = publicUrl
  }

  const { error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 'global')

  if (error) {
    // If update fails (e.g. table doesn't exist), we might want to tell the user
    return { error: 'Failed to update settings. Make sure the "settings" table exists.' }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/dashboard/orders/new')
  return { success: true }
}
