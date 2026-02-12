import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rfkkwjtekbnscuhwpdaq.supabase.co'
const supabaseKey = 'sb_publishable_8IAfAdoOHzOr_V1DcSJArw_buAO4kjA'
export const supabase = createClient(supabaseUrl, supabaseKey)