'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createConcept(data: {
  title: string
  persona_id: string | null
  campaign?: string | null
  funnel_stage?: string | null
  hook_type: string | null
  angle_type: string | null
  test_axis: string | null
  insight: string | null
  angle: string | null
  hook: string | null
}): Promise<{ id: string } | { error: string }> {
  const supabase = createServerClient()

  // Auto-increment concept ID
  const { data: existing } = await supabase
    .from('concepts')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(100)

  const allIds = (existing ?? []).map(r => r.id as string)
  const maxNum = allIds
    .filter(id => /^C\d+$/.test(id))
    .map(id => parseInt(id.slice(1), 10))
    .reduce((a, b) => Math.max(a, b), 0)

  const newId = `C${maxNum + 1}`

  const { error: conceptError } = await supabase.from('concepts').insert({
    id: newId,
    title: data.title,
    persona_id: data.persona_id || null,
    campaign: data.campaign || null,
    funnel_stage: data.funnel_stage || null,
    hook_type: data.hook_type || null,
    angle_type: data.angle_type || null,
    test_axis: data.test_axis || null,
    status: 'idea',
  })

  if (conceptError) return { error: conceptError.message }

  await supabase.from('ideas').insert({
    concept_id: newId,
    selected_insight: data.insight || null,
    selected_angle: data.angle || null,
    selected_hook: data.hook || null,
    current_step: 6,
  })

  revalidatePath('/ideas')
  revalidatePath('/planning')
  return { id: newId }
}

export async function updateIdeaStep(
  conceptId: string,
  updates: Partial<{
    selected_insight: string
    selected_angle: string
    selected_hook: string
    current_step: number
  }>,
) {
  const supabase = createServerClient()
  await supabase.from('ideas').update(updates).eq('concept_id', conceptId)
  revalidatePath(`/planning/${conceptId}`)
}

export async function updateConcept(
  id: string,
  updates: Partial<{
    title: string
    hook_type: string
    angle_type: string
    test_axis: string
    status: string
    notes: string
    platforms: string[]
  }>,
) {
  const supabase = createServerClient()
  const { error } = await supabase.from('concepts').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/planning/${id}`)
  revalidatePath(`/production/${id}`)
  revalidatePath('/planning')
  revalidatePath('/production')
  return {}
}
