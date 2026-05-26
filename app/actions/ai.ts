'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { AIOption, FunnelStage, IdeaSummary, Persona } from '@/lib/types'

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const BRAND_CONTEXT = `
You are generating paid ad creative content for Quake, an immersive earthquake museum in Belém, Lisbon. Entry: €26.
Quake recreates the 1755 Lisbon earthquake — history × science × experience.
Brand: "Culture Shaker" — Recordar é Proteger (Remembering is Protecting).

TONE: Direct and confident. Specific over generic. Emotionally grounded. Never cheesy superlatives or exclamation marks.
Never sensationalise the earthquake or use fear. Never push purchase to cold audiences.

Return exactly 3 options as a JSON array. No markdown. No explanatory text. Only the JSON array:
[{"content": "...", "rationale": "..."}]
`.trim()

function personaSummary(persona: Persona): string {
  return [
    `Persona: ${persona.name}`,
    persona.who_they_are && `Who they are: ${persona.who_they_are}`,
    persona.core_frustration && `Core frustration: ${persona.core_frustration}`,
    persona.core_desire && `Core desire: ${persona.core_desire}`,
    persona.core_fear && `Core fear: ${persona.core_fear}`,
    persona.objection && `Objection: ${persona.objection}`,
  ]
    .filter(Boolean)
    .join('\n')
}

async function generateRaw<T>(prompt: string): Promise<T | null> {
  const client = getClient()
  if (!client) return null
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (!match) return null
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}

async function generate(prompt: string): Promise<AIOption[] | null> {
  const client = getClient()
  if (!client) return null

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return null
    const parsed = JSON.parse(match[0]) as AIOption[]
    return Array.isArray(parsed) ? parsed.slice(0, 3) : null
  } catch {
    return null
  }
}

export async function generateInsights(
  persona: Persona,
  campaign: string,
  goal?: string,
): Promise<AIOption[] | null> {
  const prompt = `${BRAND_CONTEXT}

${personaSummary(persona)}
Campaign: ${campaign}
${goal ? `Creative goal: ${goal}` : ''}

Generate 3 insights. An insight is a human truth: "[Persona] [do/believe/feel X], but what they really [want/fear/need] is [Y]"
Each insight should be 1–2 sentences, specific, emotionally resonant, not a product feature.`
  return generate(prompt)
}

export async function generateAngles(
  persona: Persona,
  campaign: string,
  insight: string,
): Promise<AIOption[] | null> {
  const prompt = `${BRAND_CONTEXT}

${personaSummary(persona)}
Campaign: ${campaign}
Selected insight: "${insight}"

Generate 3 different angle types (narrative lenses) for this insight. Angle types: Problem-Solution, Social Proof, Revelation/Contrast, FOMO/Urgency, Insider, Story/Narrative, Identity Challenge, Education.
Each angle: one sentence describing the story frame + why it fits this persona. Do not repeat the same angle type.`
  return generate(prompt)
}

export async function generateHooks(
  persona: Persona,
  campaign: string,
  insight: string,
  angle: string,
): Promise<AIOption[] | null> {
  const prompt = `${BRAND_CONTEXT}

${personaSummary(persona)}
Campaign: ${campaign}
Insight: "${insight}"
Angle: "${angle}"

Generate 3 hooks. A hook is the first 2–3 seconds of the ad that stops the scroll.
Hook types (ranked by Quake performance): Result-First, Open Loop, Identity Challenge, 60-Second Contract, Before/During/After, Three Levels/Tiered, Insider/Authority, Value Stack.
Rules: Never open with "Quake". First word creates tension, curiosity, or recognition. Write both audio and text overlay versions.
Format each content as: "[HOOK TYPE] Audio: ... / Text overlay: ..."`
  return generate(prompt)
}

const QUAKE_CONTEXT = `
Quake is an immersive earthquake museum in Belém, Lisbon. Entry: €26.
It recreates the 1755 Lisbon earthquake — the worst natural disaster in European history.
Strategic triangle: History (authentic 1755 recreation) × Science (seismological rigour) × Experience (sensory immersion).
Brand: "Culture Shaker" — Recordar é Proteger (Remembering is Protecting).
Two positioning modes:
- Tourists: "Where the city begins" — essential prerequisite for understanding Lisbon
- Locals: "The preparation experience" — invaluable family investment in safety
Existing concepts to avoid duplicating: C1 "What Just Happened?", C2 "Did You Know You're Standing On...", C3 "You Walk Through Baixa Every Day", C4 "Zero Got It Right", C5 "The Uninterested Employee", C6 "The Kids Won't Stop Talking About It", C7 "Three Levels of Museums", C8 "Better Than Dinner and a Movie", C9 "If He Suggests Dinner and a Movie Again", C10 "I Filmed My Boyfriend During an Earthquake", C11 "The Receipt", C12 "What Would You Do?", C13 "Six Minutes", C14 "Traveling to Lisbon With Kids?", C15 "I Surprised My Girlfriend This Weekend", C16 "She Sent Me This Link Last Night", C17 "Living in Lisbon and Never Been?"
Tone: Direct and specific. Never sensationalise death or use fear. Never cheesy superlatives. Human dignity always.
`.trim()

export async function refineFreeformIdea(
  rawIdea: string,
): Promise<{ reflection: string; questions: string[] } | null> {
  const prompt = `${QUAKE_CONTEXT}

A creative strategist has a rough idea for a Quake paid ad:
"${rawIdea}"

Your job is to:
1. Interpret what they're getting at — what persona, insight, or angle is implicit in this idea?
2. Ask 2–3 focused questions that will sharpen it into a workable ad concept.

Return ONLY this JSON (no markdown, no explanatory text):
{
  "reflection": "1–2 sentences interpreting the idea in Quake's brand context",
  "questions": ["Question 1?", "Question 2?", "Question 3?"]
}`
  return generateRaw<{ reflection: string; questions: string[] }>(prompt)
}

export async function structureIdea(
  rawIdea: string,
  questionsAndAnswers: Array<{ question: string; answer: string }>,
): Promise<{
  title: string
  insight: string
  angle: string
  angle_type: string
  hooks: AIOption[]
} | null> {
  const qaText = questionsAndAnswers
    .filter(qa => qa.answer.trim())
    .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join('\n\n')

  const prompt = `${QUAKE_CONTEXT}

Original idea: "${rawIdea}"

Clarifying answers:
${qaText || '(no answers provided)'}

Build a structured paid ad concept from this. Return ONLY this JSON (no markdown, no explanatory text):
{
  "title": "Short memorable concept title (not the brand name — capture the hook or angle)",
  "insight": "Human truth this ad taps into — '[Persona] feel/believe/do X, but what they really want/fear/need is Y'",
  "angle": "One sentence narrative lens — the story frame that expresses the insight",
  "angle_type": "Exactly one of: Problem-Solution | Social Proof | Revelation/Contrast | FOMO/Urgency | Insider | Story/Narrative | Identity Challenge | Education",
  "hooks": [
    {"content": "[HOOK TYPE] Audio: ... / Text overlay: ...", "rationale": "Why this hook works for this persona and angle"},
    {"content": "[HOOK TYPE] Audio: ... / Text overlay: ...", "rationale": "..."},
    {"content": "[HOOK TYPE] Audio: ... / Text overlay: ...", "rationale": "..."}
  ]
}

Hook rules: Never open with "Quake". First word creates tension, curiosity, or recognition. Three different hook types.`
  return generateRaw<{
    title: string
    insight: string
    angle: string
    angle_type: string
    hooks: AIOption[]
  }>(prompt)
}

export async function generateIdeaList(
  persona: Persona,
  funnelStage: FunnelStage,
): Promise<IdeaSummary[] | null> {
  const stageContext: Record<FunnelStage, string> = {
    tof: 'Top of Funnel — awareness, cold audiences who have never heard of Quake. Goal: pattern interrupt and create curiosity.',
    mof: 'Middle of Funnel — consideration, warm audiences who have seen Quake before. Goal: address objections, build desire, show social proof.',
    bof: 'Bottom of Funnel — conversion, hot leads who are in Lisbon or planning to visit. Goal: urgency, specific value, remove friction to book.',
  }

  const prompt = `${QUAKE_CONTEXT}

${personaSummary(persona)}
Funnel stage: ${stageContext[funnelStage]}

Generate 5–6 distinct paid ad concept ideas for this persona at this funnel stage. Each idea should have a different angle and hook type. Do not duplicate existing concepts listed above.

Return ONLY a JSON array (no markdown, no explanatory text):
[
  {
    "title": "Short memorable title (captures the hook, not the brand)",
    "description": "One sentence: the specific premise, insight, or story frame this ad uses",
    "angle_type": "Exactly one of: Problem-Solution | Social Proof | Revelation/Contrast | FOMO/Urgency | Insider | Story/Narrative | Identity Challenge | Education"
  }
]`
  const result = await generateRaw<IdeaSummary[]>(prompt)
  return Array.isArray(result) ? result.slice(0, 6) : null
}
