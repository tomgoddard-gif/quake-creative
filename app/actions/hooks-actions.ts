'use server'

import Anthropic from '@anthropic-ai/sdk'
import { getConceptById } from '@/lib/data/plans'
import { upsertHooks, updateHook, confirmHook, getHooks } from '@/lib/data/hooks-data'
import { saveConceptFields } from '@/lib/data/plans'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import type { Hook } from '@/lib/types'

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured')
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function generateHooksAction(conceptId: string): Promise<Hook[]> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  let settingsOverrides: { productKnowledge?: string; guardrails?: string[] } | undefined
  try {
    const settings = await getAppSettings()
    settingsOverrides = {
      productKnowledge: settings.product_knowledge ?? undefined,
      guardrails: settings.guardrails
        ? settings.guardrails.split('\n').map(s => s.trim()).filter(Boolean)
        : [],
    }
  } catch { /* fall back */ }

  const systemPrompt = assembleSystemPrompt(
    2,
    {
      icp,
      insight: concept.insight,
      anglePain: concept.angle_pain,
      angleDesire: concept.angle_desire,
      coreMessage: concept.core_message,
    },
    settingsOverrides,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Generate the 3 hooks now.' }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse hooks response')

  const parsed = JSON.parse(match[0]) as {
    hooks: Array<{
      hook_type: string
      written_hook: string
      visual_hook: string
      audio_hook: string
    }>
  }

  const hooks = await upsertHooks(conceptId, parsed.hooks)
  return hooks
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

  let settingsOverrides: { productKnowledge?: string; guardrails?: string[] } | undefined
  try {
    const settings = await getAppSettings()
    settingsOverrides = {
      productKnowledge: settings.product_knowledge ?? undefined,
      guardrails: settings.guardrails
        ? settings.guardrails.split('\n').map(s => s.trim()).filter(Boolean)
        : [],
    }
  } catch { /* fall back */ }

  const systemPrompt = assembleSystemPrompt(
    2,
    {
      icp,
      insight: concept.insight,
      anglePain: concept.angle_pain,
      angleDesire: concept.angle_desire,
      coreMessage: concept.core_message,
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
Visual: ${currentHook.visual_hook}
Audio: ${currentHook.audio_hook}

Return ONLY a JSON object for the refined single hook:
{
  "hook_type": "...",
  "written_hook": "...",
  "visual_hook": "...",
  "audio_hook": "..."
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
    visual_hook: string
    audio_hook: string
  }

  return updateHook(hookId, refined)
}

export async function confirmHookAction(hookId: string): Promise<void> {
  await confirmHook(hookId)
}

export async function confirmAllHooksAction(conceptId: string): Promise<void> {
  await saveConceptFields(conceptId, { status: 'hooks_confirmed', plan_stage: 3 })
}
