'use server'

import Anthropic from '@anthropic-ai/sdk'
import { redirect } from 'next/navigation'
import { getConceptById, saveConceptFields, createConcept } from '@/lib/data/plans'
import { upsertHooks, updateHook, confirmHook, getHooks } from '@/lib/data/hooks-data'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import { createServerClient } from '@/lib/supabase/server'
import type { Hook } from '@/lib/types'

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
        ? settings.guardrails.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : [],
    }
  } catch {
    return undefined
  }
}

export async function generateHooksAction(conceptId: string): Promise<Hook[]> {
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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Generate 3 hooks for this angle.' }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse hooks response')

  const parsed = JSON.parse(match[0]) as {
    hooks: Array<{
      hook_type: string
      written_hook: string
      text_overlay: string
      why_it_works: string
    }>
  }

  return upsertHooks(conceptId, parsed.hooks)
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
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? concept.test_axis ?? null,
    },
    settingsOverrides,
  )

  const hooks = await getHooks(conceptId)
  const currentHook = hooks.find(h => h.id === hookId)
  if (!currentHook) throw new Error('Hook not found')

  const refineRequest = `Refine this hook based on this direction: "${prompt}"

Current hook:
Type: ${currentHook.hook_type}
Written: ${currentHook.written_hook}
Text overlay: ${currentHook.text_overlay}
Why it works: ${currentHook.why_it_works}

Return ONLY a JSON object:
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

export async function advanceToConceptStageAction(conceptId: string): Promise<void> {
  await saveConceptFields(conceptId, { status: 'hooks_confirmed', plan_stage: 3 })
}

export async function createConceptFromAngleAction(angleId: string): Promise<never> {
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

  await saveConceptFields(conceptId, {
    angle_id: angleId,
    status: 'concept_confirmed',
    plan_stage: 2,
  })

  redirect(`/plan/${conceptId}`)
}
