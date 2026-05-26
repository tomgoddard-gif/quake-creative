export type UserRole = 'admin' | 'client'

export type ConceptStatus = 'idea' | 'briefed' | 'in_production' | 'live' | 'paused' | 'retired'
export type BriefStatus = 'draft' | 'awaiting_approval' | 'approved' | 'rejected'

export interface AIOption {
  content: string
  rationale: string
}

export interface Persona {
  id: string
  name: string
  who_they_are: string | null
  where_they_are: string | null
  core_frustration: string | null
  core_desire: string | null
  core_fear: string | null
  objection: string | null
  trigger: string | null
  cpa_benchmark: string | null
  campaign_fit: string[]
  language: string[]
  notes: string | null
  created_at: string
}

export interface CreativeVariant {
  id: string
  concept_id: string
  hook_type: string | null
  hook_line: string | null
  hook_text_overlay: string | null
  format: string | null
  platform: string | null
  duration_seconds: number | null
  language: string
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ConceptIdea {
  selected_insight?: string | null
  selected_angle?: string | null
  selected_hook?: string | null
}

export interface Concept {
  id: string
  title: string
  persona_id: string | null
  campaign: string | null
  platforms: string[] | null
  hook_type: string | null
  angle_type: string | null
  test_axis: string | null
  status: ConceptStatus
  funnel_stage?: FunnelStage | null
  notes: string | null
  created_at: string
  updated_at: string
  persona?: Persona | null
  meta_performance?: MetaPerformance | null
  variants?: CreativeVariant[]
  idea?: ConceptIdea | null
}

export interface Idea {
  id: string
  concept_id: string
  selected_insight: string | null
  selected_angle: string | null
  selected_hook: string | null
  insight_options: AIOption[] | null
  angle_options: AIOption[] | null
  hook_options: AIOption[] | null
  current_step: number
  created_at: string
  updated_at: string
}

export interface Brief {
  id: string
  concept_id: string
  persona_id: string | null
  insight: string | null
  angle: string | null
  hook: string | null
  hook_type: string | null
  angle_type: string | null
  key_message: string | null
  call_to_action: string | null
  visual_direction: string | null
  copy_notes: string | null
  format: string | null
  duration_seconds: number | null
  platform: string | null
  shot_list: unknown | null
  audio_strategy: string | null
  talent_notes: string | null
  language_variants: unknown | null
  why_it_works: string | null
  production_notes: string | null
  status: BriefStatus
  client_comment: string | null
  approved_by: string | null
  approved_at: string | null
  ad_id: string | null
  live_date: string | null
  created_at: string
  updated_at: string
  concept?: Concept
}

export interface MetaPerformance {
  id: string
  ad_id: string
  ad_name: string
  ad_status: string | null
  concept_id: string | null
  ctr: number | null
  frequency: number | null
  spend: number | null
  cpa: number | null
  impressions: number | null
  clicks: number | null
  last_synced: string
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export type FunnelStage = 'tof' | 'mof' | 'bof'

export interface IdeaSummary {
  title: string
  description: string
  angle_type?: string
}
