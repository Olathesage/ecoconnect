
import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

validateConfig()

export const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  },
)
