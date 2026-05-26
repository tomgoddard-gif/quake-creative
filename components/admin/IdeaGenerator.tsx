'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateIdeaList,
  generateAngles,
  generateHooks,
} from '@/app/actions/ai'
import { createConcept } from '@/app/actions/ideas'
import type { AIOption, FunnelStage, IdeaSummary, Persona } from '@/lib/types'
import { ANGLE_TYPES, HOOK_TYPES, CAMPAIGN_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, ChevronRight, Sparkles, Loader2, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5 | 6

const FUNNEL_STAGES: { key: FunnelStage; label: string; name: string; desc: string }[] = [
  {
    key: 'tof',
    label: 'TOF',
    name: 'Top of Funnel',
    desc: 'Awareness — cold audiences who don\'t know Quake yet',
  },
  {
    key: 'mof',
    label: 'MOF',
    name: 'Middle of Funnel',
    desc: 'Consideration — warm audiences who\'ve seen us before',
  },
  {
    key: 'bof',
    label: 'BOF',
    name: 'Bottom of Funnel',
    desc: 'Conversion — hot leads ready to book',
  },
]

const FUNNEL_CONTEXT: Record<FunnelStage, string> = {
  tof: 'Top of Funnel (awareness, cold audiences)',
  mof: 'Middle of Funnel (consideration, warm retargeting)',
  bof: 'Bottom of Funnel (conversion, hot leads)',
}

const TEST_AXES = ['Emotional', 'Social Proof', 'Problem-Solution', 'Revelation', 'Identity']

const STEPS: { num: Step; label: string }[] = [
  { num: 1, label: 'Persona' },
  { num: 2, label: 'Funnel' },
  { num: 3, label: 'Ideas' },
  { num: 4, label: 'Angle' },
  { num: 5, label: 'Hook' },
  { num: 6, label: 'Save' },
]

interface Props {
  personas: Persona[]
  onBack: () => void
}

export function IdeaGenerator({ personas, onBack }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<Step>(1)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // Steps 1-2
  const [personaId, setPersonaId] = useState('')
  const [funnelStage, setFunnelStage] = useState<FunnelStage | ''>('')

  // Step 3 — idea list
  const [ideaList, setIdeaList] = useState<IdeaSummary[] | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<IdeaSummary | null>(null)

  // Step 4 — angle
  const [angleOptions, setAngleOptions] = useState<AIOption[] | null>(null)
  const [selectedAngle, setSelectedAngle] = useState('')
  const [customAngle, setCustomAngle] = useState('')
  const [angleType, setAngleType] = useState('')

  // Step 5 — hook
  const [hookOptions, setHookOptions] = useState<AIOption[] | null>(null)
  const [selectedHook, setSelectedHook] = useState('')
  const [customHook, setCustomHook] = useState('')
  const [hookType, setHookType] = useState('')

  // Step 6 — save
  const [title, setTitle] = useState('')
  const [testAxis, setTestAxis] = useState('')

  const selectedPersona = personas.find(p => p.id === personaId)

  async function handleGenerateIdeas() {
    if (!selectedPersona || !funnelStage) return
    setGenerating(true)
    setGenError('')
    const result = await generateIdeaList(selectedPersona, funnelStage)
    setGenerating(false)
    if (result) {
      setIdeaList(result)
    } else {
      setGenError('AI generation unavailable — add your ANTHROPIC_API_KEY to .env.local.')
    }
  }

  async function handleGenerateAngles() {
    if (!selectedPersona || !funnelStage || !selectedIdea) return
    setGenerating(true)
    setGenError('')
    const result = await generateAngles(
      selectedPersona,
      FUNNEL_CONTEXT[funnelStage],
      selectedIdea.description,
    )
    setGenerating(false)
    if (result) {
      setAngleOptions(result)
    } else {
      setGenError('AI generation unavailable — enter your angle manually.')
    }
  }

  async function handleGenerateHooks() {
    if (!selectedPersona || !funnelStage) return
    const angle = selectedAngle || customAngle
    const insight = selectedIdea?.description ?? ''
    setGenerating(true)
    setGenError('')
    const result = await generateHooks(
      selectedPersona,
      FUNNEL_CONTEXT[funnelStage],
      insight,
      angle,
    )
    setGenerating(false)
    if (result) {
      setHookOptions(result)
    } else {
      setGenError('AI generation unavailable — enter your hook manually.')
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return !!personaId
      case 2: return !!funnelStage
      case 3: return !!selectedIdea
      case 4: return !!(selectedAngle || customAngle.trim())
      case 5: return !!(selectedHook || customHook.trim())
      case 6: return !!title.trim()
    }
  }

  function handleNext() {
    if (!canAdvance()) return
    const next = (step + 1) as Step
    setStep(next)
    setGenError('')

    if (next === 3 && !ideaList) {
      setTimeout(handleGenerateIdeas, 50)
    }
    if (next === 4 && !angleOptions) {
      setTimeout(handleGenerateAngles, 50)
    }
    if (next === 5 && !hookOptions) {
      setTimeout(handleGenerateHooks, 50)
    }
    if (next === 6 && selectedIdea && !title) {
      setTitle(selectedIdea.title)
    }
  }

  function handleBack() {
    if (step > 1) setStep(s => (s - 1) as Step)
    else onBack()
  }

  function handleSave() {
    if (!title.trim()) return
    startTransition(async () => {
      const r = await createConcept({
        title: title.trim(),
        persona_id: personaId || null,
        campaign: null,
        funnel_stage: funnelStage || null,
        hook_type: hookType || null,
        angle_type: angleType || selectedIdea?.angle_type || null,
        test_axis: testAxis || null,
        insight: selectedIdea?.description ?? null,
        angle: selectedAngle || customAngle || null,
        hook: selectedHook || customHook || null,
      })
      if ('id' in r) router.push(`/planning/${r.id}`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'New idea' : 'Back'}
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-sm font-medium">Generate ideas</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1">
            <button
              onClick={() => step > s.num && setStep(s.num)}
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-colors',
                step === s.num
                  ? 'bg-[var(--quake)] text-white'
                  : step > s.num
                  ? 'bg-[var(--quake)]/20 text-[var(--quake)] cursor-pointer hover:bg-[var(--quake)]/30'
                  : 'bg-muted text-muted-foreground cursor-default',
              )}
            >
              {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-5', step > s.num ? 'bg-[var(--quake)]/40' : 'bg-border')} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-muted-foreground">{STEPS[step - 1].label}</span>
      </div>

      {/* Step content */}
      <div className="space-y-4">

        {/* Step 1: Persona */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Who are we talking to?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {personas.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersonaId(p.id)}
                  className={cn(
                    'text-left rounded-xl border p-4 transition-all',
                    personaId === p.id
                      ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                      : 'border-border bg-card hover:border-border/60 hover:bg-card/80',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--quake)]">{p.id}</span>
                    {personaId === p.id && <Check className="h-4 w-4 text-[var(--quake)]" />}
                  </div>
                  <p className="mt-1 text-sm font-medium">{p.name}</p>
                  {p.who_they_are && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.who_they_are}</p>
                  )}
                  {p.campaign_fit?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.campaign_fit.map(c => (
                        <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {CAMPAIGN_LABELS[c] ?? c}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Funnel stage */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Where in the funnel?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FUNNEL_STAGES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setFunnelStage(s.key)}
                  className={cn(
                    'text-left rounded-xl border p-4 transition-all',
                    funnelStage === s.key
                      ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                      : 'border-border bg-card hover:border-border/60 hover:bg-card/80',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--quake)]">{s.label}</span>
                    {funnelStage === s.key && <Check className="h-4 w-4 text-[var(--quake)]" />}
                  </div>
                  <p className="mt-1 text-sm font-medium">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ideas list */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pick a concept to develop</h2>
            <p className="text-sm text-muted-foreground">
              Generated for <strong className="text-foreground">{selectedPersona?.name}</strong> ·{' '}
              <strong className="text-foreground">
                {FUNNEL_STAGES.find(s => s.key === funnelStage)?.name}
              </strong>
            </p>

            {generating && !ideaList && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating ideas…
              </div>
            )}

            {!ideaList && !generating && (
              <button
                onClick={handleGenerateIdeas}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] hover:bg-[var(--quake)]/15"
              >
                <Sparkles className="h-4 w-4" />
                Generate ideas
              </button>
            )}

            {ideaList && (
              <div className="space-y-2">
                {ideaList.map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdea(idea)}
                    className={cn(
                      'w-full text-left rounded-xl border p-4 transition-all',
                      selectedIdea?.title === idea.title
                        ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                        : 'border-border bg-card hover:border-border/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{idea.title}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{idea.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {idea.angle_type && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            {idea.angle_type}
                          </span>
                        )}
                        {selectedIdea?.title === idea.title && (
                          <Check className="h-4 w-4 text-[var(--quake)]" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleGenerateIdeas}
                  disabled={generating}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Regenerate
                </button>
              </div>
            )}

            {genError && <p className="text-xs text-destructive">{genError}</p>}
          </div>
        )}

        {/* Step 4: Angle */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What narrative lens?</h2>
            <p className="text-sm text-muted-foreground">
              The angle is the story frame that expresses the concept.
            </p>

            {selectedIdea && (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Concept:</span> {selectedIdea.title} — {selectedIdea.description}
              </div>
            )}

            {generating && !angleOptions && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating angles…
              </div>
            )}

            {!angleOptions && !generating && (
              <button
                onClick={handleGenerateAngles}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] hover:bg-[var(--quake)]/15"
              >
                <Sparkles className="h-4 w-4" />
                Generate angles with AI
              </button>
            )}

            {angleOptions && (
              <div className="space-y-2">
                {angleOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedAngle(opt.content); setCustomAngle('') }}
                    className={cn(
                      'w-full text-left rounded-xl border p-4 transition-all',
                      selectedAngle === opt.content
                        ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                        : 'border-border bg-card hover:border-border/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{opt.content}</p>
                      {selectedAngle === opt.content && (
                        <Check className="h-4 w-4 text-[var(--quake)] shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{opt.rationale}</p>
                  </button>
                ))}
                <button
                  onClick={handleGenerateAngles}
                  disabled={generating}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Regenerate
                </button>
              </div>
            )}

            {genError && <p className="text-xs text-destructive">{genError}</p>}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {angleOptions ? 'Or write your own' : 'Write manually'}
              </label>
              <textarea
                value={customAngle}
                onChange={e => { setCustomAngle(e.target.value); setSelectedAngle('') }}
                placeholder="e.g. Problem-Solution: You've run out of interesting things to do in Lisbon. Here's one that isn't."
                rows={2}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Angle type
              </label>
              <div className="flex flex-wrap gap-2">
                {ANGLE_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setAngleType(prev => prev === t ? '' : t)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      angleType === t
                        ? 'border-[var(--quake)]/50 bg-[var(--quake)]/10 text-[var(--quake)]'
                        : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Hook */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">How do we open the first 3 seconds?</h2>
            <p className="text-sm text-muted-foreground">
              The hook stops the scroll. Raw and specific beats polished and vague.
            </p>

            {generating && !hookOptions && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating hooks…
              </div>
            )}

            {!hookOptions && !generating && (
              <button
                onClick={handleGenerateHooks}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] hover:bg-[var(--quake)]/15"
              >
                <Sparkles className="h-4 w-4" />
                Generate hooks with AI
              </button>
            )}

            {hookOptions && (
              <div className="space-y-2">
                {hookOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedHook(opt.content); setCustomHook('') }}
                    className={cn(
                      'w-full text-left rounded-xl border p-4 transition-all',
                      selectedHook === opt.content
                        ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                        : 'border-border bg-card hover:border-border/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug whitespace-pre-line">{opt.content}</p>
                      {selectedHook === opt.content && (
                        <Check className="h-4 w-4 text-[var(--quake)] shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{opt.rationale}</p>
                  </button>
                ))}
                <button
                  onClick={handleGenerateHooks}
                  disabled={generating}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Regenerate
                </button>
              </div>
            )}

            {genError && <p className="text-xs text-destructive">{genError}</p>}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {hookOptions ? 'Or write your own' : 'Write manually'}
              </label>
              <textarea
                value={customHook}
                onChange={e => { setCustomHook(e.target.value); setSelectedHook('') }}
                placeholder="e.g. Audio: You've been walking past the most important building in Lisbon for three days. Text: You've walked past it every day."
                rows={3}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hook type
              </label>
              <div className="flex flex-wrap gap-2">
                {HOOK_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setHookType(prev => prev === t ? '' : t)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      hookType === t
                        ? 'border-[var(--quake)]/50 bg-[var(--quake)]/10 text-[var(--quake)]'
                        : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Save */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Name this concept</h2>

            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3 text-sm">
              <SummaryRow label="Persona" value={selectedPersona?.name} />
              <SummaryRow
                label="Funnel"
                value={FUNNEL_STAGES.find(s => s.key === funnelStage)?.name}
              />
              <SummaryRow label="Concept" value={selectedIdea?.title} />
              <SummaryRow label="Insight" value={selectedIdea?.description} />
              <SummaryRow label="Angle" value={selectedAngle || customAngle} />
              <SummaryRow label="Hook" value={selectedHook || customHook} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Concept title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. You've Been Walking Past It"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <p className="text-xs text-muted-foreground">
                Use a title that captures the hook or angle, not the brand name.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Test axis
              </label>
              <div className="flex flex-wrap gap-2">
                {TEST_AXES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTestAxis(prev => prev === t ? '' : t)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      testAxis === t
                        ? 'border-[var(--quake)]/50 bg-[var(--quake)]/10 text-[var(--quake)]'
                        : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 6 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance() || generating}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!title.trim() || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save & continue to planning
          </button>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-20 shrink-0 text-xs pt-0.5 uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-foreground text-xs leading-snug">{value}</span>
    </div>
  )
}
