import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export type UserRole = 'user' | 'orga'

export interface Profile {
  id: string
  role: UserRole
  name: string
  email: string
  company_name?: string
}

interface AuthState {
  profile: Profile | null
  loading: boolean
  setProfile: (profile: Profile | null) => void
  loadProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signUpUser: (params: { name: string; prenom: string; email: string; password: string }) => Promise<{ error: string | null }>
  signUpOrga: (params: { email: string; password: string; company_name: string; siret: string }) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile }),

  loadProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        set({ profile: null, loading: false })
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ profile: data ? { ...data, email: session.user.email! } : null, loading: false })
    } catch {
      set({ profile: null, loading: false })
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null })
  },

  signUpUser: async ({ name, prenom, email, password }) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name: `${prenom} ${name}`, role: 'user' }
      }
    })
    if (error) return { error: error.message }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return { error: signInError.message }
    return { error: null }
  },

  signUpOrga: async ({ email, password, company_name, siret }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Erreur lors de la création du compte' }
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, role: 'orga', name: company_name, company_name, siret })
    if (profileError) return { error: profileError.message }
    return { error: null }
  },
}))