import { createServerClient } from '@/lib/supabase/server'
import type { Concept, ConceptStatus, EntryPoint } from '@/lib/types'

export async function getConcepts(): Promise<Concept[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('concepts')
    .select('*, meta_performance(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Concept[]
}

export async function getConceptById(id: string): Promise<Concept | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('concepts')
    .select('*, meta_performance(*), hooks(*)')
    .eq('id', id)
    .single()
  return data as Concept | null
}

export async function createConcept(params: {
  icp_id: string
  entry_point: EntryPoint
  idea_seed?: string
}): Promise<string> {
  const supabase = createServerClient()
  // Use a short timestamp-based ID that's easy to read in URLs
  const id = `v2-${Date.now().toString(36)}`
  const { error } = await supabase.from('concepts').insert({
    id,
    title: 'New concept',
    icp_id: params.icp_id,
    entry_point: params.entry_point,
    idea_seed: params.idea_seed ?? null,
    status: 'idea',
    plan_stage: 1,
  })
  if (error) throw error
  return id
}

export async function updateConceptPlanStage(id: string, stage: number): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('concepts').update({ plan_stage: stage }).eq('id', id)
  if (error) throw error
}

export async function updateConceptStatus(id: string, status: ConceptStatus): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('concepts').update({ status }).eq('id', id)
  if (error) throw error
}

export async function saveConceptFields(
  id: string,
  fields: {
    insight?: string
    angle_pain?: string
    angle_desire?: string
    core_message?: string
    title?: string
    status?: ConceptStatus
    plan_stage?: number
  },
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('concepts').update(fields).eq('id', id)
  if (error) throw error
}
