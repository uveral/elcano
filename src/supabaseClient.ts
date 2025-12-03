declare const process:
  | {
      env?: Record<string, string | undefined>
    }
  | undefined

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const env = import.meta.env as Record<string, string | undefined>
const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>).SUPABASE_URL : undefined)
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined'
    ? (process.env as Record<string, string | undefined>).SUPABASE_ANON_KEY
    : undefined)

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
