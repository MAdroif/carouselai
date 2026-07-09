import { supabase } from './supabase'

// Helper untuk menampilkan error di UI
const handleError = (error: any) => {
  const message = error?.message || "Terjadi kesalahan yang tidak diketahui"
  alert(`Error: ${message}`) // Debugging langsung ke layar
  throw error
}

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) return handleError(error)
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) {
    alert("Google Auth Error: " + error.message)
    return null
  }
  return data
}

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user ?? null
  } catch (error) {
    console.error("Gagal mendapatkan session:", error)
    return null
  }
}

export async function onAuthStateChange(callback: (user: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return subscription
}
