import { createServerClient } from '@/lib/supabase/server'
import type { Concept, ConceptStatus } from '@/lib/types'

export async function getConcepts(): Promise<Concept[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('concepts')
    .select('*, persona:personas(*), meta_performance(*)')
    .order('id')
  if (error) throw error
  return (data ?? []) as Concept[]
}

export async function getConceptById(id: string): Promise<Concept | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('concepts')
    .select('*, persona:personas(*), meta_performance(*), idea:ideas(*)')
    .eq('id', id)
    .single()
  return data as Concept | null
}

export async function updateConceptStatus(id: string, status: ConceptStatus): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('concepts')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
