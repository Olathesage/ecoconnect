import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  },
)
