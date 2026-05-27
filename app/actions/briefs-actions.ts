'use server'

import Anthropic from '@anthropic-ai/sdk'
import { getConceptById } from '@/lib/data/plans'
import { getHooks } from '@/lib/data/hooks-data'
import { getBriefs, insertBrief } from '@/lib/data/briefs-data'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import type { Brief, FunnelStage } from '@/lib/types'

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

export async function generateProductionBriefAction(
  conceptId: string,
  params: {
    format: string      // '15s_video' | 'static' | 'ugc'
    platform: string    // 'meta_feed' | 'meta_stories' | 'tiktok' | 'google_display'
    funnelStage: FunnelStage
  },
): Promise<Brief> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const hooks = await getHooks(conceptId)
  const angle = concept.angle
  const settingsOverrides = await getSettingsOverrides()

  const formatLabels: Record<string, string> = {
    '15s_video': '15-second video',
    static: 'static ad',
    ugc: 'UGC creator brief',
  }

  const platformLabels: Record<string, string> = {
    meta_feed: 'Meta Feed (4:5)',
    meta_stories: 'Meta Stories / Reels (9:16)',
    tiktok: 'TikTok (9:16)',
    google_display: 'Google Display',
  }

  const systemPrompt = assembleSystemPrompt(
    4,
    {
      icp,
      angleNarrative: angle?.angle_narrative ?? null,
      coreMessage: angle?.core_message ?? concept.core_message ?? null,
      painPoint: angle?.pain_point ?? concept.angle_pain ?? null,
      benefit: angle?.benefit ?? concept.angle_desire ?? null,
      desiredResponse: angle?.desired_response ?? null,
      testAxis: angle?.test_axis ?? null,
      hooks: hooks.map(h => ({
        hookType: h.hook_type ?? '',
        writtenHook: h.written_hook ?? '',
        textOverlay: h.text_overlay ?? '',
      })),
      conceptOverview: concept.concept_overview,
      productionComplexity: concept.production_complexity,
      format: formatLabels[params.format] ?? params.format,
      platform: platformLabels[params.platform] ?? params.platform,
      funnelStage: params.funnelStage.toUpperCase(),
    },
    settingsOverrides,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Write the ${formatLabels[params.format] ?? params.format} production brief.` }],
  })

  const briefText = response.content.find(b => b.type === 'text')?.text ?? ''

  // Save to briefs table
  const brief = await insertBrief({
    concept_id: conceptId,
    hook_id: null,
    format: params.format,
    platform: params.platform,
    funnel_stage: params.funnelStage,
    creative_idea: briefText,
    status: 'draft',
    // legacy fields
    persona_id: null,
    insight: null,
    angle: null,
    hook: null,
    hook_type: null,
    key_message: null,
    primary_text: null,
    headline: null,
    cta_text: null,
    talent_notes: null,
    audio_direction: null,
    placement_specs: null,
  })

  return brief
}

export async function getBriefsAction(conceptId: string): Promise<Brief[]> {
  return getBriefs(conceptId)
}
