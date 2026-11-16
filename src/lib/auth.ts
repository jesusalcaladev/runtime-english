import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AuthUser = User

const NATIVE_REDIRECT = 'com.runtimeenglish.core://login-callback'

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session ?? null
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  // Emit the current state asynchronously
  void getUser().then(callback)
  return () => data.subscription.unsubscribe()
}

function redirectTo(): string {
  if (typeof window === 'undefined') return ''
  if (Capacitor.isNativePlatform()) return NATIVE_REDIRECT
  return window.location.origin + window.location.pathname
}

export async function signInWithProvider(
  provider: 'google' | 'github',
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase no está configurado.' }

  const redirect = redirectTo()

  if (Capacitor.isNativePlatform()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirect, skipBrowserRedirect: true },
    })
    if (error) return { error: error.message }
    if (data?.url) {
      await Browser.open({ url: data.url })
    }
    return {}
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirect },
  })
  if (error) return { error: error.message }
  return {}
}

export async function signOut(): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase no está configurado.' }
  const { error } = await supabase.auth.signOut()
  if (error) return { error: error.message }
  return {}
}
