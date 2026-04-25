
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqbubmrsgiixnyroqsys.supabase.co'
const supabaseKey = 'sb_publishable_CVPwjFmjPNAEMIGrbZfQ_g_bzD5DlIO'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { data, error } = await supabase.from('complaints').select('title, description').limit(20)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Current Data in DB:')
    data.forEach((p, i) => {
      console.log(`[${i}] Title: ${p.title} | Desc: ${p.description?.substring(0, 30)}...`)
    });
  }
}

checkData()
