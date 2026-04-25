import { createClient } from './src/utils/supabase/server'

async function check() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select('*').limit(1)
  if (error) {
    console.log('Error:', error)
  } else if (data && data[0]) {
    console.log('Columns:', Object.keys(data[0]))
  } else {
    console.log('No orders found to check columns')
  }
}

check()
