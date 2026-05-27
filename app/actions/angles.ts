'use server'

import Anthropic from '@anthropic-ai/sdk'
import { redirect } from 'next/navigation'
import { createAngle, saveAngleFields } from '@/lib/data/angles-data'
import { createConcept as dbCreateConcept, saveConceptFields, getConceptById } from '@/lib/data/plans'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import type { EntryPoint } from '@/lib/types'

export interface AngleOption {
  title: string
  angle_narrative: string
  core_message: string
  pain_point: string
  benefit: string
  desired_response: string
  test_axis: string
}

export type AngleDraftFields = AngleOption

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

export async function createAngleAction(params: {
  icp_id: string
  entry_point: EntryPoint
  idea_seed?: string
}): Promise<never> {
  const angleId = await createAngle({ icp_id: params.icp_id })
  const conceptId = await dbCreateConcept({
    icp_id: params.icp_id,
    entry_point: params.entry_point,
    idea_seed: params.idea_seed,
  })
  await saveConceptFields(conceptId, { angle_id: angleId })
  redirect(`/plan/${conceptId}`)
}

export async function generateAngleOptionsAction(
  conceptId: string,
  directionHint?: string,
): Promise<AngleOption[]> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const settingsOverrides = await getSettingsOverrides()

  const systemPrompt = assembleSystemPrompt(
    1,
    {
      icp,
      directionHint: directionHint ?? concept.idea_seed ?? null,
    },
    settingsOverrides,
  )

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Generate 3 creative angles for this ICP.' }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse angles response')

  const parsed = JSON.parse(match[0]) as { angles: AngleOption[] }
  return parsed.angles
}

export async function refineAngleOptionAction(
  conceptId: string,
  option: AngleOption,
  feedback: string,
): Promise<AngleOption> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  const settingsOverrides = await getSettingsOverrides()

  const systemPrompt = assembleSystemPrompt(
    1,
    { icp },
    settingsOverrides,
  )

  const refineRequest = `Refine this angle based on the feedback below.

Current angle:
Title: ${option.title}
Narrative: ${option.angle_narrative}
Core message: ${option.core_message}
Pain point: ${option.pain_point}
Benefit: ${option.benefit}
Desired response: ${option.desired_response}
Test axis: ${option.test_axis}

Feedback: "${feedback}"

Return ONLY a JSON object for the updated angle (same structure, no other text):
{
  "title": "...",
  "angle_narrative": "...",
  "core_message": "...",
  "pain_point": "...",
  "benefit": "...",
  "desired_response": "...",
  "test_axis": "..."
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: refineRequest }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse refine response')

  return JSON.parse(match[0]) as AngleOption
}

export async function confirmAngleAction(
  angleId: string,
  conceptId: string,
  fields: AngleDraftFields,
): Promise<void> {
  await saveAngleFields(angleId, {
    title: fields.title,
    angle_narrative: fields.angle_narrative,
    core_message: fields.core_message,
    pain_point: fields.pain_point,
    benefit: fields.benefit,
    desired_response: fields.desired_response,
    test_axis: fields.test_axis,
    status: 'confirmed',
  })

  await saveConceptFields(conceptId, {
    title: fields.title,
    status: 'concept_confirmed',
    plan_stage: 2,
  })
}
