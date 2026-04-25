
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqbubmrsgiixnyroqsys.supabase.co'
const supabaseKey = 'sb_publishable_CVPwjFmjPNAEMIGrbZfQ_g_bzD5DlIO'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('complaints').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns:', Object.keys(data[0] || {}))
  }
}

checkColumns()
