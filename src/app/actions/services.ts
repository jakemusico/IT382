'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const unit = formData.get('unit') as string
  const turnaround = formData.get('turnaround') as string
  const category = formData.get('category') as string

  const { error } = await supabase
    .from('services')
    .insert({
      name,
      description,
      price,
      unit,
      turnaround,
      category,
    })

  if (error) return { error: error.message }
  
  revalidatePath('/admin/services')
  return { success: true }
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const unit = formData.get('unit') as string
  const turnaround = formData.get('turnaround') as string
  const category = formData.get('category') as string

  const { error } = await supabase
    .from('services')
    .update({
      name,
      description,
      price,
      unit,
      turnaround,
      category,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/services')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/services')
  return { success: true }
}
