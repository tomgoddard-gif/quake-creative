import { createServerClient } from '@/lib/supabase/server'
import type { AppSettings } from '@/lib/types'

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'quake')
    .single()
  if (error) throw error
  return data as AppSettings
}

export async function updateAppSettings(
  fields: Partial<Pick<AppSettings, 'product_knowledge' | 'guardrails'>>,
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('app_settings')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', 'quake')
  if (error) throw error
}
