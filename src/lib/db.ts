import { supabase } from './supabase'

export async function saveCarousel(topic: string, content: any) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!authData?.user) throw new Error("User tidak ditemukan")

  const { data, error } = await supabase
    .from('history_carousels')
    .insert([
      {
        user_id: authData.user.id,
        topic,
        content
      }
    ])

  if (error) throw error
  return data
}

export async function getHistory() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!authData?.user) throw new Error("User tidak ditemukan")

  const { data, error } = await supabase
    .from('history_carousels')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteCarousel(id: string) {
  const { error } = await supabase
    .from('history_carousels')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function clearAllHistory() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!authData?.user) throw new Error("User tidak ditemukan")

  const { error } = await supabase
    .from('history_carousels')
    .delete()
    .eq('user_id', authData.user.id)

  if (error) throw error
}