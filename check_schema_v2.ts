import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('orders').select('*').limit(1)
  if (error) {
    console.log('Error:', error)
  } else if (data && data[0]) {
    console.log('Available Columns:', Object.keys(data[0]))
  } else {
    console.log('No orders found to check columns')
  }
}

check()
