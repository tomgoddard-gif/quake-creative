export const HOOK_TYPES = [
  'Result-First',
  'Open Loop',
  'Identity Challenge',
  '60-Second Contract',
  'Before/During/After',
  'Three Levels/Tiered',
  'Insider/Authority',
  'Value Stack',
  'Direct Call-Out',
  'Anti-Ad / Deadpan',
  'Escalation',
] as const

export const ANGLE_TYPES = [
  'Problem-Solution',
  'Social Proof',
  'Revelation/Contrast',
  'FOMO/Urgency',
  'Insider',
  'Story/Narrative',
  'Identity Challenge',
  'Education',
  'Identity',
  'Revelation',
] as const

export const CONCEPT_STATUSES = [
  'idea',
  'briefed',
  'in_production',
  'live',
  'paused',
  'retired',
] as const

export const STATUS_COLORS: Record<string, string> = {
  idea:              'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  concept_confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  hooks_confirmed:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  briefed:           'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_production:     'bg-amber-500/15 text-amber-400 border-amber-500/30',
  live:              'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  complete:          'bg-[var(--quake)]/15 text-[var(--quake)] border-[var(--quake)]/30',
  paused:            'bg-orange-500/15 text-orange-400 border-orange-500/30',
  retired:           'bg-zinc-800/40 text-zinc-600 border-zinc-700/30',
}

export const STATUS_LABELS: Record<string, string> = {
  idea:              'Draft',
  concept_confirmed: 'Concept',
  hooks_confirmed:   'Hooks done',
  briefed:           'Briefed',
  in_production:     'In Production',
  live:              'Live',
  complete:          'Complete',
  paused:            'Paused',
  retired:           'Retired',
}

export const CAMPAIGN_LABELS: Record<string, string> = {
  tourist_in:  'Tourist IN',
  tourist_out: 'Tourist OUT',
  local_pt:    'Local PT',
  all:         'All',
}

export const TEST_AXIS_COLORS: Record<string, string> = {
  'Emotional':        'bg-purple-500/15 text-purple-400',
  'Social Proof':     'bg-blue-500/15 text-blue-400',
  'Problem-Solution': 'bg-green-500/15 text-green-400',
  'Revelation':       'bg-amber-500/15 text-amber-400',
  'Identity':         'bg-rose-500/15 text-rose-400',
}

export const META_FATIGUE_THRESHOLD = 3.5
export const META_CACHE_TTL_MS = 60 * 60 * 1000
