'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVariant(data: {
  concept_id: string
  hook_type: string
  hook_line: string
  hook_text_overlay: string
  format: string
  platform: string
  duration_seconds: number | null
  language: string
  notes: string
}) {
  const supabase = createServerClient()
  const { error } = await supabase.from('creative_variants').insert(data)
  if (error) return { error: error.message }
  revalidatePath(`/planning/${data.concept_id}`)
  revalidatePath(`/production/${data.concept_id}`)
  return {}
}

export async function updateVariant(
  id: string,
  conceptId: string,
  data: Partial<{
    hook_type: string
    hook_line: string
    hook_text_overlay: string
    format: string
    platform: string
    duration_seconds: number | null
    language: string
    notes: string
  }>,
) {
  const supabase = createServerClient()
  const { error } = await supabase.from('creative_variants').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/planning/${conceptId}`)
  revalidatePath(`/production/${conceptId}`)
  return {}
}

export async function deleteVariant(id: string, conceptId: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('creative_variants').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/planning/${conceptId}`)
  revalidatePath(`/production/${conceptId}`)
  return {}
}
