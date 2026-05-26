'use server'

import Anthropic from '@anthropic-ai/sdk'
import { getConceptById } from '@/lib/data/plans'
import { getHooks } from '@/lib/data/hooks-data'
import { insertBriefs, getBriefs } from '@/lib/data/briefs-data'
import { saveConceptFields } from '@/lib/data/plans'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import type { Brief, FunnelStage } from '@/lib/types'

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured')
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function generateBriefsAction(
  conceptId: string,
  params: {
    formats: string[]
    platforms: string[]
    funnelStage: FunnelStage
  },
): Promise<Brief[]> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const confirmedHooks = await getHooks(conceptId)
  const hooks = confirmedHooks.map(h => ({
    hookType: h.hook_type ?? '',
    writtenHook: h.written_hook ?? '',
    visualHook: h.visual_hook ?? '',
    audioHook: h.audio_hook ?? '',
  }))

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
    3,
    {
      icp,
      insight: concept.insight,
      anglePain: concept.angle_pain,
      angleDesire: concept.angle_desire,
      coreMessage: concept.core_message,
      hooks,
    },
    settingsOverrides,
  )

  // Build the combinations request
  const icpSlug = concept.icp_id ?? 'icp'
  const combinations: Array<{ format: string; platform: string; hookIndex: number }> = []
  for (const format of params.formats) {
    for (let i = 0; i < hooks.length; i++) {
      combinations.push({ format, platform: params.platforms.join('+'), hookIndex: i })
    }
  }

  const combinationsText = combinations
    .map(
      (c, idx) =>
        `${idx + 1}. creative_id: ${icpSlug}-${c.format.toLowerCase().replace(/[^a-z0-9]/g, '-')}-hook${c.hookIndex + 1} | format: ${c.format} | platform: ${c.platform} | funnel_stage: ${params.funnelStage} | hook: Hook ${c.hookIndex + 1}`,
    )
    .join('\n')

  const userMessage = `Generate briefs for these combinations. Use the confirmed concept and hooks exactly.\n\n${combinationsText}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Failed to parse briefs response')

  const parsedBriefs = JSON.parse(match[0]) as Array<{
    creative_id?: string
    icp?: string
    funnel_stage?: string
    platforms?: string[]
    format?: string
    hook?: string
    concept?: string
    creative_idea?: string
    copy_primary_text?: string
    copy_headline?: string
    copy_cta?: string
    talent_notes?: string
    audio_direction?: string
    placement_specs?: string
  }>

  // Map AI output to DB schema
  const hookLookup = confirmedHooks.reduce(
    (acc, h, i) => {
      acc[i] = h.id
      return acc
    },
    {} as Record<number, string>,
  )

  const briefRows = parsedBriefs.map((b, idx) => {
    const combo = combinations[idx]
    return {
      concept_id: conceptId,
      hook_id: combo ? hookLookup[combo.hookIndex] ?? null : null,
      funnel_stage: params.funnelStage,
      format: b.format ?? (combo?.format ?? null),
      platform: b.platforms?.join(', ') ?? (combo?.platform ?? null),
      primary_text: b.copy_primary_text ?? null,
      headline: b.copy_headline ?? null,
      cta_text: b.copy_cta ?? null,
      creative_idea: b.creative_idea ?? null,
      talent_notes: b.talent_notes ?? null,
      audio_direction: b.audio_direction ?? null,
      placement_specs: b.placement_specs ?? null,
      // legacy fields
      persona_id: concept.icp_id ?? null,
      insight: concept.insight ?? null,
      angle: concept.angle_pain ?? null,
      hook: null as string | null,
      hook_type: null as string | null,
      key_message: concept.core_message ?? null,
      status: 'draft' as const,
    }
  })

  const saved = await insertBriefs(briefRows)

  // Mark concept as having briefs
  await saveConceptFields(conceptId, { status: 'complete' })

  return saved
}

export async function getBriefsAction(conceptId: string): Promise<Brief[]> {
  return getBriefs(conceptId)
}
