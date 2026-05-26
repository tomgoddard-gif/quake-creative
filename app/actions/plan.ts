'use server'

import Anthropic from '@anthropic-ai/sdk'
import { redirect } from 'next/navigation'
import { createConcept as dbCreateConcept, saveConceptFields, getConceptById } from '@/lib/data/plans'
import { getMessages, addMessage } from '@/lib/data/messages'
import { assembleSystemPrompt } from '@/lib/system-prompt'
import { quakeConfig } from '@/lib/client-config/quake'
import { getAppSettings } from '@/lib/data/settings'
import type { EntryPoint } from '@/lib/types'

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function createConceptAction(params: {
  icp_id: string
  entry_point: EntryPoint
  idea_seed?: string
}): Promise<never> {
  const id = await dbCreateConcept(params)
  redirect(`/plan/${id}`)
}

export async function sendMessageAction(
  conceptId: string,
  userMessage: string,
): Promise<{ role: 'assistant'; content: string }> {
  const client = getAnthropicClient()

  const concept = await getConceptById(conceptId)
  if (!concept) throw new Error('Concept not found')

  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)
  if (!icp) throw new Error(`ICP not found: ${concept.icp_id}`)

  // Load settings overrides
  let settingsOverrides: { productKnowledge?: string; guardrails?: string[] } | undefined
  try {
    const settings = await getAppSettings()
    settingsOverrides = {
      productKnowledge: settings.product_knowledge ?? undefined,
      guardrails: settings.guardrails
        ? settings.guardrails
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    }
  } catch {
    // settings table may not exist yet in dev — fall back to static config
  }

  const systemPrompt = assembleSystemPrompt(
    1,
    {
      icp,
      entryPoint: concept.entry_point ?? 'guided',
      ideaSeed: concept.idea_seed,
    },
    settingsOverrides,
  )

  // Store user message
  await addMessage(conceptId, 'user', userMessage)

  // Load full history for context
  const history = await getMessages(conceptId)

  // Build messages array for Anthropic (user message already included via history)
  const messages = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })

  const assistantText = response.content.find(b => b.type === 'text')?.text ?? ''

  // Store assistant response
  await addMessage(conceptId, 'assistant', assistantText)

  return { role: 'assistant', content: assistantText }
}

export async function sendInitialMessageAction(
  conceptId: string,
): Promise<{ role: 'assistant'; content: string }> {
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
        ? settings.guardrails
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    }
  } catch {
    // fall back to static config
  }

  const systemPrompt = assembleSystemPrompt(
    1,
    {
      icp,
      entryPoint: concept.entry_point ?? 'guided',
      ideaSeed: concept.idea_seed,
    },
    settingsOverrides,
  )

  const entryPoint = concept.entry_point ?? 'guided'
  let initialUserMessage: string

  if (entryPoint === 'idea_first' && concept.idea_seed) {
    initialUserMessage = `I have a rough idea I want to build on: "${concept.idea_seed}"`
  } else if (entryPoint === 'icp_first') {
    initialUserMessage = `Let's build a concept for ${icp.name}. Start by suggesting 2–3 angles we could explore.`
  } else {
    initialUserMessage = `Let's build a concept for ${icp.name}. Start by asking me questions to develop the insight.`
  }

  // Store as user message then get AI response
  await addMessage(conceptId, 'user', initialUserMessage)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: initialUserMessage }],
  })

  const assistantText = response.content.find(b => b.type === 'text')?.text ?? ''
  await addMessage(conceptId, 'assistant', assistantText)

  return { role: 'assistant', content: assistantText }
}

export async function confirmConceptAction(
  conceptId: string,
  fields: {
    insight: string
    angle_pain: string
    angle_desire: string
    core_message: string
  },
): Promise<void> {
  // Derive a title from the core message
  const title = fields.core_message.slice(0, 60)
  await saveConceptFields(conceptId, {
    ...fields,
    title,
    status: 'concept_confirmed',
    plan_stage: 2,
  })
}
