const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  console.log('Testing admin_logs table...')
  
  // 1. Try to fetch
  const { data: fetchRes, error: fetchErr } = await supabase.from('admin_logs').select('*').limit(1)
  console.log('Fetch Result:', { data: fetchRes, error: fetchErr })

  // 2. Try to insert
  const { data: insRes, error: insErr } = await supabase.from('admin_logs').insert({
    action_type: 'system',
    message: 'System test log'
  }).select()
  console.log('Insert Result:', { data: insRes, error: insErr })
}

test()
