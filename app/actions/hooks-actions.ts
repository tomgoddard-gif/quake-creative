'use server'

import Anthropic from '@anthropic-ai/sdk'
import { redirect } from 'next/navigation'
import { getConceptById, saveConceptFields, createConcept } from '@/lib/data/plans'
import { upsertHooks, updateHook, confirmHook, getHooks } from '@/lib/data/hooks-data'
import { getBriefs, insertBriefs } from '@/lib/data/briefs-data'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import { createServerClient } from '@/lib/supabase/server'
import type { Hook, Brief } from '@/lib/types'

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured')
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

async function getSettingsOverrides() {
  try {
    const settings = await getAppSettings()
    return {
      productKnowledge: settings.product_knowledge ?? undefined,
      guardrails: settings.guardrails
        ? settings.guardrails.split('\n').map(s => s.trim()).filter(Boolean)
        : [],
    }
  } catch {
    return undefined
  }
}

export async function generateCreativePackageAction(
  conceptId: string,
): Promise<{ hooks: Hook[]; briefs: Brief[] }> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const settingsOverrides = await getSettingsOverrides()

  // Build context from the angle (V2) or legacy concept fields
  const angle = concept.angle
  const systemPrompt = assembleSystemPrompt(
    2,
    {
      icp,
      ideaSeed: concept.idea_seed,
      // V2 angle fields
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? concept.test_axis ?? null,
      // Legacy fallback
      insight: concept.insight,
      anglePain: concept.angle_pain,
      angleDesire: concept.angle_desire,
    },
    settingsOverrides,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Generate the full creative package now.' }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse creative package response')

  const parsed = JSON.parse(match[0]) as {
    hooks: Array<{
      hook_type: string
      written_hook: string
      text_overlay: string
      why_it_works: string
    }>
    video_15s: string
    static_ad: string
    ugc_brief: string
  }

  // Store hooks
  const hooks = await upsertHooks(conceptId, parsed.hooks)

  // Delete existing briefs and re-insert
  const supabase = createServerClient()
  await supabase.from('briefs').delete().eq('concept_id', conceptId)

  // Store 3 format briefs
  const briefRows = [
    {
      concept_id: conceptId,
      hook_id: null as string | null,
      format: '15s_video',
      platform: 'meta',
      funnel_stage: 'tofu' as const,
      creative_idea: parsed.video_15s,
      status: 'draft' as const,
      // legacy fields
      persona_id: null as string | null,
      insight: null as string | null,
      angle: null as string | null,
      hook: null as string | null,
      hook_type: null as string | null,
      key_message: null as string | null,
      primary_text: null as string | null,
      headline: null as string | null,
      cta_text: null as string | null,
      talent_notes: null as string | null,
      audio_direction: null as string | null,
      placement_specs: null as string | null,
    },
    {
      concept_id: conceptId,
      hook_id: null as string | null,
      format: 'static',
      platform: 'meta',
      funnel_stage: 'tofu' as const,
      creative_idea: parsed.static_ad,
      status: 'draft' as const,
      persona_id: null as string | null,
      insight: null as string | null,
      angle: null as string | null,
      hook: null as string | null,
      hook_type: null as string | null,
      key_message: null as string | null,
      primary_text: null as string | null,
      headline: null as string | null,
      cta_text: null as string | null,
      talent_notes: null as string | null,
      audio_direction: null as string | null,
      placement_specs: null as string | null,
    },
    {
      concept_id: conceptId,
      hook_id: null as string | null,
      format: 'ugc',
      platform: 'meta',
      funnel_stage: 'tofu' as const,
      creative_idea: parsed.ugc_brief,
      status: 'draft' as const,
      persona_id: null as string | null,
      insight: null as string | null,
      angle: null as string | null,
      hook: null as string | null,
      hook_type: null as string | null,
      key_message: null as string | null,
      primary_text: null as string | null,
      headline: null as string | null,
      cta_text: null as string | null,
      talent_notes: null as string | null,
      audio_direction: null as string | null,
      placement_specs: null as string | null,
    },
  ]

  const briefs = await insertBriefs(briefRows)

  // Update concept status
  await saveConceptFields(conceptId, { status: 'hooks_confirmed' })

  return { hooks, briefs }
}

export async function refineHookAction(
  hookId: string,
  prompt: string,
  conceptId: string,
): Promise<Hook> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const settingsOverrides = await getSettingsOverrides()
  const angle = concept.angle

  const systemPrompt = assembleSystemPrompt(
    2,
    {
      icp,
      ideaSeed: concept.idea_seed,
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? concept.test_axis ?? null,
      insight: concept.insight,
      anglePain: concept.angle_pain,
      angleDesire: concept.angle_desire,
    },
    settingsOverrides,
  )

  const hooks = await getHooks(conceptId)
  const currentHook = hooks.find(h => h.id === hookId)
  if (!currentHook) throw new Error('Hook not found')

  const refineRequest = `Refine this specific hook based on this direction: "${prompt}"

Current hook:
Type: ${currentHook.hook_type}
Written: ${currentHook.written_hook}
Text overlay: ${currentHook.text_overlay}
Why it works: ${currentHook.why_it_works}

Return ONLY a JSON object for the refined single hook:
{
  "hook_type": "...",
  "written_hook": "...",
  "text_overlay": "...",
  "why_it_works": "..."
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: refineRequest }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse refine response')

  const refined = JSON.parse(match[0]) as {
    hook_type: string
    written_hook: string
    text_overlay: string
    why_it_works: string
  }

  return updateHook(hookId, refined)
}

export async function confirmHookAction(hookId: string): Promise<void> {
  await confirmHook(hookId)
}

export async function createConceptFromAngleAction(angleId: string): Promise<never> {
  // Look up the angle to get its icp_id
  const supabase = createServerClient()
  const { data: angle } = await supabase
    .from('angles')
    .select('icp_id')
    .eq('id', angleId)
    .single()

  if (!angle) throw new Error('Angle not found')

  const conceptId = await createConcept({
    icp_id: angle.icp_id,
    entry_point: 'guided',
  })

  // Link to angle and set to stage 2 (skip angle development — angle already confirmed)
  await saveConceptFields(conceptId, {
    angle_id: angleId,
    status: 'concept_confirmed',
    plan_stage: 2,
  })

  redirect(`/plan/${conceptId}`)
}
