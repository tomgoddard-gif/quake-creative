export type UserRole = 'admin' | 'client'

export type ConceptStatus =
  | 'idea'
  | 'concept_confirmed'
  | 'hooks_confirmed'
  | 'briefed'
  | 'in_production'
  | 'live'
  | 'paused'
  | 'retired'
  | 'complete'

export type BriefStatus = 'draft' | 'awaiting_approval' | 'approved' | 'rejected'
export type FunnelStage = 'tofu' | 'mofu' | 'bofu'
export type EntryPoint = 'guided' | 'icp_first' | 'idea_first'

// ─── AI helpers ────────────────────────────────────────────────────────────
export interface AIOption {
  content: string
  rationale: string
}

// ─── ICP / Persona ─────────────────────────────────────────────────────────
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

// ─── Angle ─────────────────────────────────────────────────────────────────
export interface Angle {
  id: string
  icp_id: string | null
  title: string
  angle_narrative: string | null
  core_message: string | null
  pain_point: string | null
  benefit: string | null
  desired_response: string | null
  test_axis: string | null
  angle_type: string | null
  status: 'draft' | 'confirmed'
  created_at: string
  updated_at: string
  // joins
  icp?: Persona | null
  concepts?: Concept[]
}

// ─── Chat messages (Stage 1) ────────────────────────────────────────────────
export interface Message {
  id: string
  concept_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ─── Hook (Stage 2) ────────────────────────────────────────────────────────
export interface Hook {
  id: string
  concept_id: string
  hook_type: string | null
  written_hook: string | null
  text_overlay: string | null
  why_it_works: string | null
  visual_hook: string | null
  audio_hook: string | null
  confirmed: boolean
  sort_order: number
  created_at: string
}

// ─── Concept ────────────────────────────────────────────────────────────────
export interface Concept {
  id: string
  title: string
  persona_id: string | null
  icp_id: string | null
  entry_point: EntryPoint | null
  insight: string | null
  angle_pain: string | null
  angle_desire: string | null
  core_message: string | null
  angle_id: string | null
  plan_stage: number
  idea_seed: string | null
  campaign: string | null
  funnel_stage: FunnelStage | null
  platforms: string[] | null
  hook_type: string | null
  angle_type: string | null
  test_axis: string | null
  status: ConceptStatus
  notes: string | null
  created_at: string
  updated_at: string
  // joins
  persona?: Persona | null
  meta_performance?: MetaPerformance | null
  hooks?: Hook[]
  angle?: Angle | null
}

// ─── Brief (V2) ────────────────────────────────────────────────────────────
export interface Brief {
  id: string
  concept_id: string
  hook_id: string | null
  funnel_stage: FunnelStage | null
  format: string | null
  platform: string | null
  primary_text: string | null
  headline: string | null
  cta_text: string | null
  creative_idea: string | null
  talent_notes: string | null
  audio_direction: string | null
  placement_specs: string | null
  // legacy fields kept for compatibility
  persona_id: string | null
  insight: string | null
  angle: string | null
  hook: string | null
  hook_type: string | null
  key_message: string | null
  status: BriefStatus
  created_at: string
  updated_at: string
  // joins
  hook_data?: Hook | null
  concept?: Concept | null
}

// ─── App settings ───────────────────────────────────────────────────────────
export interface AppSettings {
  id: string
  product_knowledge: string | null
  guardrails: string | null
  updated_at: string
}

// ─── Meta performance ───────────────────────────────────────────────────────
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

// ─── Legacy (kept for old components still in codebase) ─────────────────────
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

export interface IdeaSummary {
  title: string
  description: string
  angle_type?: string
}
