import { createServerClient } from '@/lib/supabase/server'
import type { Angle } from '@/lib/types'

export async function getAngles(): Promise<Angle[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('angles')
    .select('*, icp:personas(*), concepts(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Angle[]
}

export async function getAngleById(id: string): Promise<Angle | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('angles')
    .select('*, icp:personas(*), concepts(*)')
    .eq('id', id)
    .single()
  return data as Angle | null
}

export async function createAngle(params: {
  icp_id: string
  title?: string
}): Promise<string> {
  const supabase = createServerClient()
  const id = `v2a-${Date.now().toString(36)}`
  const { error } = await supabase.from('angles').insert({
    id,
    icp_id: params.icp_id,
    title: params.title ?? 'New angle',
    status: 'draft',
  })
  if (error) throw error
  return id
}

export async function saveAngleFields(
  id: string,
  fields: Partial<Pick<
    Angle,
    'title' | 'angle_narrative' | 'core_message' | 'pain_point' | 'benefit' |
    'desired_response' | 'test_axis' | 'angle_type' | 'status'
  >>,
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('angles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
