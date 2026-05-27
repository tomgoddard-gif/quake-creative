import { createServerClient } from '@/lib/supabase/server'
import type { Hook } from '@/lib/types'

export async function getHooks(conceptId: string): Promise<Hook[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('hooks')
    .select('*')
    .eq('concept_id', conceptId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Hook[]
}

export async function upsertHooks(
  conceptId: string,
  hooks: Array<{
    hook_type: string
    written_hook: string
    text_overlay?: string
    why_it_works?: string
    visual_hook?: string
    audio_hook?: string
  }>,
): Promise<Hook[]> {
  const supabase = createServerClient()
  // Delete existing hooks for this concept and re-insert
  await supabase.from('hooks').delete().eq('concept_id', conceptId)
  const rows = hooks.map((h, i) => ({
    concept_id: conceptId,
    hook_type: h.hook_type,
    written_hook: h.written_hook,
    text_overlay: h.text_overlay ?? null,
    why_it_works: h.why_it_works ?? null,
    visual_hook: h.visual_hook ?? null,
    audio_hook: h.audio_hook ?? null,
    confirmed: false,
    sort_order: i,
  }))
  const { data, error } = await supabase.from('hooks').insert(rows).select()
  if (error) throw error
  return (data ?? []) as Hook[]
}

export async function updateHook(
  hookId: string,
  fields: Partial<Pick<Hook, 'hook_type' | 'written_hook' | 'text_overlay' | 'why_it_works' | 'visual_hook' | 'audio_hook' | 'confirmed'>>,
): Promise<Hook> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('hooks')
    .update(fields)
    .eq('id', hookId)
    .select()
    .single()
  if (error) throw error
  return data as Hook
}

export async function confirmHook(hookId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('hooks').update({ confirmed: true }).eq('id', hookId)
  if (error) throw error
}
