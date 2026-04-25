'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentMethod } from '@/types'
import { sendStatusEmail } from './email'
import { isValidPHMobile } from '@/utils/validation'
import { createAdminLog } from './logs'

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

export async function createOrder(input: FormData | any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const isFormData = input instanceof FormData
  const getField = (key: string) => isFormData ? input.get(key) : input[key]

  const paymentMethod = getField('payment_method') as PaymentMethod
  const totalPrice = parseFloat(String(getField('total_price')))

  const deliveryType = (getField('delivery_type') as string) || 'pickup'
  const deliveryAddress = (getField('delivery_address') as string) || ''
  const deliveryContact = (getField('delivery_contact') as string) || ''
  const deliveryFee = parseFloat(String(getField('delivery_fee') || '0'))

  if (deliveryType === 'delivery' && !isValidPHMobile(deliveryContact)) {
    return { error: 'Invalid 11-digit Philippine mobile number required' }
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'GCASH' ? 'verifying' : (paymentMethod === 'CASH' ? 'paid' : 'unpaid'),
      delivery_type: deliveryType,
      delivery_address: deliveryAddress,
      delivery_contact: deliveryContact,
      delivery_fee: deliveryFee,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    method: paymentMethod,
    status: paymentMethod === 'GCASH' ? 'pending' : 'verified',
    gcash_proof_url: getField('gcash_proof_url') || null,
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

  // If status is completed, automatically mark as paid to settle the transaction (for COP/COD)
  if (status === 'completed') {
    updates.payment_status = 'paid'
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('*, users(email, full_name, contact_number)')
    .single()

  if (error) return { error: error.message }

  // Send Notifications (don't block if they fail)
  if (order) {
    // 1. Email Notification
    if (order.users?.email) {
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
  }

  // Create Admin Log
  await createAdminLog(
    'update',
    `Updated Order #${orderId.slice(0, 8).toUpperCase()} to ${status.split('_').join(' ')}`,
    orderId
  )

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

  const paymentMethod = formData.get('payment_method') as PaymentMethod
  const totalPrice = parseFloat(formData.get('total_price') as string)
  const status = (formData.get('status') as OrderStatus) || 'pending'
  const deliveryType = formData.get('delivery_type') as string
  const deliveryAddress = formData.get('delivery_address') as string
  const deliveryContact = formData.get('delivery_contact') as string
  const deliveryFee = parseFloat(formData.get('delivery_fee') as string || '0')

  // New Customer Selection Fields
  const isWalkIn = formData.get('is_walk_in') === 'true'
  const selectedUserId = formData.get('selected_user_id') as string | null
  const guestName = formData.get('guest_name') as string || 'Walk-In Customer'
  const guestEmail = formData.get('guest_email') as string || null

  // Backend Validation: Delivery + COP is illegal
  if (deliveryType === 'delivery') {
    if (paymentMethod === 'COP') return { error: 'Cash on Pickup is not available for Delivery orders' }
    if (!isValidPHMobile(deliveryContact)) return { error: 'Invalid 11-digit Philippine mobile number required' }
  }

  const orderData: any = {
    user_id: isWalkIn ? null : selectedUserId,
    is_walk_in: isWalkIn,
    customer_name: isWalkIn ? guestName : null,
    status: status,
    total_price: totalPrice,
    payment_method: paymentMethod,
    payment_status: (paymentMethod === 'CASH' || paymentMethod === 'GCASH') ? 'paid' : 'unpaid',
    delivery_type: deliveryType,
    delivery_address: deliveryAddress,
    delivery_contact: deliveryContact,
    delivery_fee: deliveryFee,
  }

  // Only add customer_email if provided (to avoid schema errors if column missing)
  if (isWalkIn && guestEmail) {
    orderData.customer_email = guestEmail
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) return { error: error.message }

  // Create payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    method: paymentMethod,
    status: (paymentMethod === 'GCASH' || paymentMethod === 'COD' || paymentMethod === 'COP') ? 'pending' : 'verified',
  })

  // Create Admin Log
  await createAdminLog(
    'create',
    `Placed new ${isWalkIn ? 'walk-in' : ''} order #${order.id.slice(0, 8).toUpperCase()}`,
    order.id
  )

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
  return { success: true, orderId: order.id }
}

export async function deleteOrders(orderIds: string[]) {
  const supabase = await createClient()
  const { isAdmin, user } = await isAdminUser(supabase)
  if (!user || !isAdmin) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('orders')
    .delete()
    .in('id', orderIds)

  if (error) return { error: error.message }

  // Create Admin Log
  await createAdminLog(
    'delete',
    `Permanently erased ${orderIds.length} historical record(s)`
  )

  revalidatePath('/admin/history')
  revalidatePath('/admin/dashboard')
  return { success: true }
}


