import { supabase } from './supabaseClient'

export interface AuthUser {
  id: string
  email: string
}

export const authHelpers = {
  // Sign up new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  // Get current user
  async getUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (!data.user) return null
    
    return {
      id: data.user.id,
      email: data.user.email || '',
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
        })
      } else {
        callback(null)
      }
    })
  },
}
