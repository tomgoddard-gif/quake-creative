import { quakeConfig } from './client-config/quake'
import type { ICP } from './client-config/types'

export interface StageContext {
  icp: ICP
  entryPoint?: 'guided' | 'icp_first' | 'idea_first'
  ideaSeed?: string | null
  directionHint?: string | null
  // Stage 2+: angle fields
  angleNarrative?: string | null
  coreMessage?: string | null
  painPoint?: string | null
  benefit?: string | null
  desiredResponse?: string | null
  testAxis?: string | null
  // Stage 2: hooks
  hooks?: Array<{ hookType: string; writtenHook: string; textOverlay: string }>
  // Stage 3+
  conceptOverview?: string | null
  productionComplexity?: string | null
  // Stage 4
  format?: string
  platform?: string
  funnelStage?: string
  // Legacy (backwards compat with old concepts)
  insight?: string | null
  anglePain?: string | null
  angleDesire?: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1: Angle Generation
// ─────────────────────────────────────────────────────────────────────────────

const ANGLE_GENERATION_INSTRUCTIONS = `
## Your role — Generate 3 creative angles

You are a senior creative strategist. Based on the ICP above and the optional direction hint provided, generate exactly 3 distinct creative angles for a paid ad campaign.

Each angle must:
- Use a different test axis (choose from: Emotional, Revelation, Identity, Problem-Solution, Social Proof)
- Be grounded in the ICP's specific frustration, desire, or fear — not generic
- Have a clear, direct core message the viewer will actually feel
- Be distinct enough that the three options represent genuinely different strategic directions

Return ONLY this JSON — no markdown, no explanatory text:
{
  "angles": [
    {
      "title": "Short working title (4–7 words)",
      "angle_narrative": "Two paragraphs. First: the human tension — what this ICP feels, believes, or is stuck in. Be specific, not generic. Second: how Quake resolves it. Write as if briefing a director.",
      "core_message": "One sentence. What the viewer should think or feel after watching.",
      "pain_point": "The specific frustration or anxiety being addressed.",
      "benefit": "What the ICP actually gets — felt outcome, not feature.",
      "desired_response": "The exact thought or micro-action we want. e.g. 'That's exactly what we needed — booking now.'",
      "test_axis": "Emotional"
    },
    { ... },
    { ... }
  ]
}
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2: Hook Generation
// ─────────────────────────────────────────────────────────────────────────────

const HOOK_GENERATION_INSTRUCTIONS = `
## Your role — Generate 3 hooks

You are generating 3 distinct hooks from the confirmed angle above. A hook is the opening moment of an ad — the first 1–3 seconds that determines whether someone stops scrolling.

Each hook must use a different hook type. Hook types to draw from:
Result-First, Open Loop, Identity Challenge, 60-Second Contract, Before/During/After, Tiered/Three Levels, Insider/Authority, Value Stack, Direct Call-Out, Escalation.

Rules:
- Never open with the brand name
- The first word must create immediate tension, curiosity, or recognition
- written_hook = the spoken or on-screen opening line
- text_overlay = the silent-scroll version (may differ from spoken for readability pace)
- why_it_works = one sentence explaining why this hook works for this specific angle and ICP

Return ONLY this JSON — no markdown, no explanatory text:
{
  "hooks": [
    {
      "hook_type": "Result-First",
      "written_hook": "...",
      "text_overlay": "...",
      "why_it_works": "..."
    },
    { ... },
    { ... }
  ]
}
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3: Concept Overview
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPT_OVERVIEW_INSTRUCTIONS = `
## Your role — Write a format-agnostic creative concept overview

You are writing a creative concept overview from the confirmed angle and hooks above. This is the director's brief — it describes what the creative will show, feel, and achieve in a way that works equally as a 15-second video, a static image, or a UGC piece.

Write a single prose paragraph of 150–200 words. Structure:
1. Open on the hook moment — what we see first (specific, visual)
2. What unfolds — who we follow, what changes
3. The emotional arc — tension → resolution
4. What the viewer should feel and think
5. Why this translates across formats (what the single defining image is)

Rules:
- Be specific — name sensory details, not categories
- No marketing language. Write as if briefing a director or photographer
- The overview should make the brief obvious even before seeing the production spec
- Do not reference format, platform, or production complexity in this overview

Return ONLY a JSON object — no markdown, no explanatory text:
{
  "overview": "The full prose paragraph here..."
}
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4: Production Brief
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTION_BRIEF_INSTRUCTIONS = `
## Your role — Write a production brief

You are writing a single production-ready brief for the format, platform, and funnel stage specified. This brief must be detailed enough for a production team to execute without a briefing call.

The brief format depends on the chosen format:

### For 15-second video (format: 15s_video):
Write the brief in this exact structure:
0–3s: [Hook moment — what we see and hear, text overlay if any]
3–8s: [Build — what develops, camera movement, character behaviour]
8–13s: [Payoff — the Quake moment, emotional resolution]
13–15s: [CTA — what appears on screen]
Audio: [Score direction, voiceover notes, sound design]
Talent: [Who appears, casting direction, what they do — be specific]
Caption style: [Subtitle approach for silent-scroll viewing]

### For static ad (format: static):
Write the brief in this exact structure:
Hero image: [What the image shows — specific composition, not generic]
Headline: [Use or adapt one of the three hooks]
Sub-copy: [1–2 lines of supporting copy]
CTA button: [Text]
Format: [Aspect ratio and placement]
Design notes: [Typography, colour, visual hierarchy — specific, not generic]

### For UGC (format: ugc):
Write the brief in this exact structure:
Who: [Creator casting direction — specific, not 'an influencer']
Format: [Talking head / POV / reaction / mix — with specific notes]
What they say: [Script direction — key beats and tone, not word-for-word]
What they should NOT do: [Specific guardrails — concrete, not vague]
What they absolutely should do: [Non-negotiables — concrete]
Ending: [How to close — CTA delivery direction]

Rules:
- Stay strictly within the confirmed angle — do not introduce new messages
- Every line should be specific enough that a different person could execute it without asking questions
- Copy must be direct and specific — never generic tourism language
- Production complexity informs the ambition level (UGC = lo-fi/authentic, mid = semi-professional, professional = full crew)
- Funnel stage informs CTA aggression (TOFU = curiosity/awareness, MOFU = consideration, BOFU = conversion)
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// Assemble
// ─────────────────────────────────────────────────────────────────────────────

export function assembleSystemPrompt(
  stage: 1 | 2 | 3 | 4,
  context: StageContext,
  settingsOverrides?: { productKnowledge?: string; guardrails?: string[] },
): string {
  const config = quakeConfig
  const productKnowledge = settingsOverrides?.productKnowledge ?? config.productKnowledge
  const guardrails = settingsOverrides?.guardrails ?? config.guardrails

  const parts: string[] = []

  // 1. Client section
  parts.push(`# Client: ${config.clientName}

## Brand context
${config.brandContext}

## Product knowledge
${productKnowledge}`)

  // 2. ICP section
  parts.push(`## ICP: ${context.icp.name}
Description: ${context.icp.description}
Core frustration: ${context.icp.frustration}
Core desire: ${context.icp.desire}
Core fear: ${context.icp.fear}
Main objection: ${context.icp.objection}`)

  // 3. Optional direction hint (Stage 1)
  if (stage === 1 && context.directionHint) {
    parts.push(`## Creative direction hint\n${context.directionHint}`)
  }

  // 4. Confirmed angle (Stage 2+)
  if (stage >= 2 && (context.angleNarrative || context.coreMessage)) {
    parts.push(`## Confirmed angle
Narrative:
${context.angleNarrative ?? ''}

Core message: ${context.coreMessage ?? ''}
Pain point: ${context.painPoint ?? ''}
Benefit: ${context.benefit ?? ''}
Desired response: ${context.desiredResponse ?? ''}
Test axis: ${context.testAxis ?? ''}`)
  } else if (stage >= 2 && context.insight) {
    // Legacy fallback
    parts.push(`## Confirmed concept
Insight: ${context.insight}
Angle — pain: ${context.anglePain ?? ''}
Angle — desire: ${context.angleDesire ?? ''}
Core message: ${context.coreMessage ?? ''}`)
  }

  // 5. Confirmed hooks (Stage 3+)
  if (stage >= 3 && context.hooks?.length) {
    const hooksText = context.hooks
      .map(
        (h, i) =>
          `Hook ${i + 1} (${h.hookType})\n  Written: ${h.writtenHook}\n  Text overlay: ${h.textOverlay}`,
      )
      .join('\n\n')
    parts.push(`## Confirmed hooks\n${hooksText}`)
  }

  // 6. Concept overview + complexity (Stage 4)
  if (stage === 4) {
    if (context.conceptOverview) {
      parts.push(`## Creative concept overview\n${context.conceptOverview}`)
    }
    if (context.productionComplexity) {
      const complexityLabels: Record<string, string> = {
        ugc: 'UGC — creator-shot on phone, 1 person, no crew',
        mid: 'Mid-production — small crew, 1–2 day shoot, semi-professional',
        professional: 'Full production — DP, lighting, professional talent, multi-day',
      }
      parts.push(`## Production complexity\n${complexityLabels[context.productionComplexity] ?? context.productionComplexity}`)
    }
    if (context.format || context.platform || context.funnelStage) {
      parts.push(`## Brief specification
Format: ${context.format ?? ''}
Platform: ${context.platform ?? ''}
Funnel stage: ${context.funnelStage ?? ''}`)
    }
  }

  // 7. Stage instructions
  const instructions =
    stage === 1
      ? ANGLE_GENERATION_INSTRUCTIONS
      : stage === 2
      ? HOOK_GENERATION_INSTRUCTIONS
      : stage === 3
      ? CONCEPT_OVERVIEW_INSTRUCTIONS
      : PRODUCTION_BRIEF_INSTRUCTIONS
  parts.push(instructions)

  // 8. Guardrails
  if (guardrails.length > 0) {
    parts.push(`## Creative guardrails\n${guardrails.map(g => `- ${g}`).join('\n')}`)
  }

  return parts.join('\n\n---\n\n')
}
