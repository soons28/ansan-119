
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqbubmrsgiixnyroqsys.supabase.co'
const supabaseKey = 'sb_publishable_CVPwjFmjPNAEMIGrbZfQ_g_bzD5DlIO'
const supabase = createClient(supabaseUrl, supabaseKey)

async function tryAlterTable() {
  const { data, error } = await supabase.rpc('alter_table_add_column', {
    table_name: 'complaints',
    column_name: 'author',
    column_type: 'text'
  })
  if (error) {
    console.error('RPC Error (likely not allowed):', error)
    // Try raw SQL if possible (rarely enabled)
    const { error: sqlError } = await supabase.from('_sql').select('*').eq('query', 'ALTER TABLE complaints ADD COLUMN author TEXT;')
    if (sqlError) console.error('SQL Error:', sqlError)
  } else {
    console.log('Successfully added column via RPC')
  }
}

tryAlterTable()
