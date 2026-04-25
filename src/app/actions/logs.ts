'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAdminLog(actionType: string, message: string, orderId?: string) {
  const supabase = await createClient()

  // Proceed without strict user check to guarantee log is created
  const { error } = await supabase
    .from('admin_logs')
    .insert({
      action_type: actionType,
      message,
      order_id: orderId,
    })

  if (error) {
    console.error('CRITICAL LOGGING ERROR:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getAdminLogs() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to fetch logs:', error)
    return { error: error.message, data: [] }
  }
  return { data }
}
