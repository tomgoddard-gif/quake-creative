'use server'

import Anthropic from '@anthropic-ai/sdk'
import { getConceptById, saveConceptFields } from '@/lib/data/plans'
import { getHooks } from '@/lib/data/hooks-data'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'

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

async function buildStage3Context(conceptId: string) {
  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const hooks = await getHooks(conceptId)
  const angle = concept.angle

  return {
    concept,
    icp,
    angle,
    hooks,
    hooksContext: hooks.map(h => ({
      hookType: h.hook_type ?? '',
      writtenHook: h.written_hook ?? '',
      textOverlay: h.text_overlay ?? '',
    })),
  }
}

export async function generateConceptOverviewAction(conceptId: string): Promise<string> {
  const client = getAnthropicClient()
  const { concept, icp, angle, hooksContext } = await buildStage3Context(conceptId)
  const settingsOverrides = await getSettingsOverrides()

  const systemPrompt = assembleSystemPrompt(
    3,
    {
      icp,
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? null,
      hooks: hooksContext,
    },
    settingsOverrides,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Write the creative concept overview.' }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse concept overview response')

  const parsed = JSON.parse(match[0]) as { overview: string }

  await saveConceptFields(conceptId, { concept_overview: parsed.overview })

  return parsed.overview
}

export async function refineConceptOverviewAction(
  conceptId: string,
  feedback: string,
): Promise<string> {
  const client = getAnthropicClient()
  const { concept, icp, angle, hooksContext } = await buildStage3Context(conceptId)
  const settingsOverrides = await getSettingsOverrides()

  const systemPrompt = assembleSystemPrompt(
    3,
    {
      icp,
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? null,
      hooks: hooksContext,
    },
    settingsOverrides,
  )

  const currentOverview = concept.concept_overview ?? ''

  const refineRequest = `Refine this creative concept overview based on the feedback below.

Current overview:
${currentOverview}

Feedback: "${feedback}"

Return ONLY the updated JSON:
{ "overview": "..." }`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: refineRequest }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse refine response')

  const parsed = JSON.parse(match[0]) as { overview: string }

  await saveConceptFields(conceptId, { concept_overview: parsed.overview })

  return parsed.overview
}

export async function confirmConceptOverviewAction(
  conceptId: string,
  complexity: 'ugc' | 'mid' | 'professional',
): Promise<void> {
  await saveConceptFields(conceptId, {
    production_complexity: complexity,
    plan_stage: 4,
  })
}
