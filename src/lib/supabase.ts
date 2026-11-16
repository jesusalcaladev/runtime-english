import { Capacitor } from '@capacitor/core'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined

const native = Capacitor.isNativePlatform()

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          flowType: native ? 'pkce' : 'implicit',
          detectSessionInUrl: !native,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
