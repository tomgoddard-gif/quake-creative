import { createServerClient } from '@/lib/supabase/server'
import type { MetaPerformance } from '@/lib/types'
import { META_FATIGUE_THRESHOLD } from '@/lib/constants'

export async function getTopPerformers(limit = 5): Promise<MetaPerformance[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('meta_performance')
    .select('*')
    .order('ctr', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as MetaPerformance[]
}

export async function getFatigueAlerts(): Promise<MetaPerformance[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('meta_performance')
    .select('*')
    .gte('frequency', META_FATIGUE_THRESHOLD)
    .order('frequency', { ascending: false })
  if (error) throw error
  return (data ?? []) as MetaPerformance[]
}

export async function getAdPerformance(adId: string): Promise<MetaPerformance | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('meta_performance')
    .select('*')
    .eq('ad_id', adId)
    .single()
  return data as MetaPerformance | null
}
