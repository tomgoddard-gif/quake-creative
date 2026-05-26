import { createServerClient } from '@/lib/supabase/server'
import type { Brief } from '@/lib/types'

export async function getBriefs(conceptId: string): Promise<Brief[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('briefs')
    .select('*, hook_data:hooks(*)')
    .eq('concept_id', conceptId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Brief[]
}

export async function insertBrief(brief: Omit<Brief, 'id' | 'created_at' | 'updated_at' | 'hook_data' | 'concept'>): Promise<Brief> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('briefs').insert(brief).select().single()
  if (error) throw error
  return data as Brief
}

export async function insertBriefs(briefs: Array<Omit<Brief, 'id' | 'created_at' | 'updated_at' | 'hook_data' | 'concept'>>): Promise<Brief[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('briefs').insert(briefs).select()
  if (error) throw error
  return (data ?? []) as Brief[]
}
