import { createServerClient } from '@/lib/supabase/server'
import type { Persona } from '@/lib/types'

export async function getPersonas(): Promise<Persona[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('id')
  if (error) throw error
  return (data ?? []) as Persona[]
}

export async function getPersonaById(id: string): Promise<Persona | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .single()
  return data as Persona | null
}
