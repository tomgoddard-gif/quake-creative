import { createServerClient } from '@/lib/supabase/server'
import type { Message } from '@/lib/types'

export async function getMessages(conceptId: string): Promise<Message[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('concept_id', conceptId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Message[]
}

export async function addMessage(
  conceptId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<Message> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ concept_id: conceptId, role, content })
    .select()
    .single()
  if (error) throw error
  return data as Message
}
