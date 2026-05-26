import { createServerClient } from '@/lib/supabase/server'
import type { CreativeVariant } from '@/lib/types'

export async function getVariantsByConceptId(conceptId: string): Promise<CreativeVariant[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('creative_variants')
    .select('*')
    .eq('concept_id', conceptId)
    .order('sort_order')
    .order('created_at')
  if (error) throw error
  return (data ?? []) as CreativeVariant[]
}
