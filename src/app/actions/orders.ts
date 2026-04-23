'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentMethod } from '@/types'
import { sendStatusEmail } from './email'

// Must match the list in auth.ts and proxy.ts
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

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const paymentMethod = formData.get('payment_method') as PaymentMethod
  const totalPrice = parseFloat(formData.get('total_price') as string)

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'GCASH' ? 'verifying' : 'unpaid',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    method: paymentMethod,
    status: 'pending',
  })

  revalidatePath('/dashboard')
  return { success: true, orderId: order.id }
}

export async function uploadGcashProof(orderId: string, file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const fileName = `${user.id}/${orderId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('gcash-proofs')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('gcash-proofs')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('payments')
    .update({ gcash_proof_url: publicUrl, status: 'pending' })
    .eq('order_id', orderId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  return { success: true, url: publicUrl }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user) return { error: 'Unauthorized' }
  if (!isAdmin) return { error: 'Forbidden' }

  const updates: any = { status, updated_at: new Date().toISOString() }
  
  // If status is completed, automatically mark as paid to settle the transaction
  if (status === 'completed') {
    updates.payment_status = 'paid'
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('*, users(email, full_name)')
    .single()

  if (error) return { error: error.message }

  // Send email notification (don't block if it fails)
  if (order?.users) {
    try {
      await sendStatusEmail({
        to: order.users.email,
        customerName: order.users.full_name || 'Customer',
        orderId: order.id,
        status,
      })
    } catch (e) {
      console.error('Failed to send status email:', e)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function verifyPayment(orderId: string, method?: string) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user) return { error: 'Unauthorized' }
  if (!isAdmin) return { error: 'Forbidden' }

  const payUpdates: any = { status: 'verified' }
  const orderUpdates: any = { payment_status: 'paid' }

  if (method) {
    payUpdates.method = method
    orderUpdates.payment_method = method
  }

  await supabase
    .from('payments')
    .update(payUpdates)
    .eq('order_id', orderId)

  await supabase
    .from('orders')
    .update(orderUpdates)
    .eq('id', orderId)

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function deletePayment(paymentId: string) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user || !isAdmin) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)

  if (error) return { error: error.message }

  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function unverifyPayment(orderId: string) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user || !isAdmin) return { error: 'Unauthorized' }

  await supabase
    .from('payments')
    .update({ status: 'pending' })
    .eq('order_id', orderId)

  await supabase
    .from('orders')
    .update({ payment_status: 'verifying' })
    .eq('id', orderId)

  revalidatePath('/admin/orders')
  revalidatePath('/admin/payments')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
export async function createAdminOrder(formData: FormData) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user || !isAdmin) return { error: 'Unauthorized' }

  let userId = formData.get('user_id') as string
  const isWalkIn = formData.get('is_walk_in') === 'true'

  if (isWalkIn) {
    // Look for a "Walk-In Customer" user record
    const { data: walkInUser } = await supabase
      .from('users')
      .select('id')
      .ilike('full_name', '%Walk-In%')
      .limit(1)
      .single()
    
    if (!walkInUser) {
      // Fallback: Use the admin's own ID
      userId = user.id
    } else {
      userId = walkInUser.id
    }
  }

  if (!userId) return { error: 'No customer selected.' }

  const paymentMethod = formData.get('payment_method') as PaymentMethod
  const totalPrice = parseFloat(formData.get('total_price') as string)
  const status = (formData.get('status') as OrderStatus) || 'pending'

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: status,
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: status === 'completed' ? 'paid' : (paymentMethod === 'GCASH' ? 'verifying' : 'unpaid'),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    method: paymentMethod,
    status: paymentMethod === 'GCASH' ? 'pending' : 'verified',
  })

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
  return { success: true, orderId: order.id }
}

