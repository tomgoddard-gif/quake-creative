'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateInsights, generateAngles, generateHooks } from '@/app/actions/ai'
import { createConcept } from '@/app/actions/ideas'
import type { Persona, AIOption } from '@/lib/types'
import { CAMPAIGN_LABELS, ANGLE_TYPES, HOOK_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check, ChevronRight } from 'lucide-react'

interface Props {
  personas: Persona[]
}

const CAMPAIGNS = [
  { key: 'tourist_in', label: 'Tourist IN', desc: 'Tourists currently in Lisbon' },
  { key: 'tourist_out', label: 'Tourist OUT', desc: 'Reach tourists before they travel' },
  { key: 'local_pt', label: 'Local PT', desc: 'Lisbon residents' },
]

const TEST_AXES = ['Emotional', 'Social Proof', 'Problem-Solution', 'Revelation', 'Identity']

type Step = 1 | 2 | 3 | 4 | 5 | 6

export function IdeaWizard({ personas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<Step>(1)
  const [personaId, setPersonaId] = useState<string>('')
  const [campaign, setCampaign] = useState<string>('')
  const [goal, setGoal] = useState('')

  const [insightOptions, setInsightOptions] = useState<AIOption[] | null>(null)
  const [selectedInsight, setSelectedInsight] = useState('')
  const [customInsight, setCustomInsight] = useState('')

  const [angleOptions, setAngleOptions] = useState<AIOption[] | null>(null)
  const [selectedAngle, setSelectedAngle] = useState('')
  const [customAngle, setCustomAngle] = useState('')
  const [angleType, setAngleType] = useState('')

  const [hookOptions, setHookOptions] = useState<AIOption[] | null>(null)
  const [selectedHook, setSelectedHook] = useState('')
  const [customHook, setCustomHook] = useState('')
  const [hookType, setHookType] = useState('')

  const [title, setTitle] = useState('')
  const [testAxis, setTestAxis] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const selectedPersona = personas.find(p => p.id === personaId)

  async function handleGenerateInsights() {
    if (!selectedPersona) return
    setGenerating(true)
    setGenError('')
    const result = await generateInsights(selectedPersona, campaign, goal || undefined)
    setGenerating(false)
    if (result) {
      setInsightOptions(result)
    } else {
      setGenError('AI generation unavailable — enter your insight manually below.')
    }
  }

  async function handleGenerateAngles() {
    if (!selectedPersona) return
    const insight = selectedInsight || customInsight
    setGenerating(true)
    setGenError('')
    const result = await generateAngles(selectedPersona, campaign, insight)
    setGenerating(false)
    if (result) {
      setAngleOptions(result)
    } else {
      setGenError('AI generation unavailable — enter your angle manually below.')
    }
  }

  async function handleGenerateHooks() {
    if (!selectedPersona) return
    const insight = selectedInsight || customInsight
    const angle = selectedAngle || customAngle
    setGenerating(true)
    setGenError('')
    const result = await generateHooks(selectedPersona, campaign, insight, angle)
    setGenerating(false)
    if (result) {
      setHookOptions(result)
    } else {
      setGenError('AI generation unavailable — enter your hook manually below.')
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return !!personaId
      case 2: return !!campaign
      case 3: return !!(selectedInsight || customInsight.trim())
      case 4: return !!(selectedAngle || customAngle.trim())
      case 5: return !!(selectedHook || customHook.trim())
      case 6: return !!title.trim()
    }
  }

  function handleNext() {
    if (!canAdvance()) return
    if (step === 3 && !insightOptions && !customInsight.trim()) {
      handleGenerateInsights()
      return
    }
    const next = (step + 1) as Step
    setStep(next)
    setGenError('')
    if (next === 4 && !angleOptions) {
      setTimeout(handleGenerateAngles, 100)
    }
    if (next === 5 && !hookOptions) {
      setTimeout(handleGenerateHooks, 100)
    }
  }

  function handleSave() {
    if (!title.trim()) return
    startTransition(async () => {
      const result = await createConcept({
        title: title.trim(),
        persona_id: personaId || null,
        campaign: campaign || null,
        hook_type: hookType || null,
        angle_type: angleType || null,
        test_axis: testAxis || null,
        insight: selectedInsight || customInsight || null,
        angle: selectedAngle || customAngle || null,
        hook: selectedHook || customHook || null,
      })
      if ('id' in result) {
        router.push(`/planning/${result.id}`)
      }
    })
  }

  const steps: { num: Step; label: string }[] = [
    { num: 1, label: 'Persona' },
    { num: 2, label: 'Campaign' },
    { num: 3, label: 'Insight' },
    { num: 4, label: 'Angle' },
    { num: 5, label: 'Hook' },
    { num: 6, label: 'Save' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/ideas')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ideas
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-sm font-medium">New idea</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
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
            {i < steps.length - 1 && (
              <div className={cn('h-px w-6', step > s.num ? 'bg-[var(--quake)]/40' : 'bg-border')} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-muted-foreground">{steps[step - 1].label}</span>
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

        {/* Step 2: Campaign */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Which campaign?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CAMPAIGNS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCampaign(c.key)}
                  className={cn(
                    'text-left rounded-xl border p-4 transition-all',
                    campaign === c.key
                      ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                      : 'border-border bg-card hover:border-border/60 hover:bg-card/80',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.label}</span>
                    {campaign === c.key && <Check className="h-4 w-4 text-[var(--quake)]" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Creative goal <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Drive €5 CPA conversions for couples, capture date-night consideration traffic"
                rows={2}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        {/* Step 3: Insight */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What human truth drives this ad?</h2>
            <p className="text-sm text-muted-foreground">
              An insight is not a product feature — it's the emotional tension the ad taps into.
            </p>

            {!insightOptions && (
              <button
                onClick={handleGenerateInsights}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] transition-colors hover:bg-[var(--quake)]/15 disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate insights with AI
              </button>
            )}

            {insightOptions && (
              <div className="space-y-2">
                {insightOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedInsight(opt.content); setCustomInsight('') }}
                    className={cn(
                      'w-full text-left rounded-xl border p-4 transition-all',
                      selectedInsight === opt.content
                        ? 'border-[var(--quake)] bg-[var(--quake)]/8'
                        : 'border-border bg-card hover:border-border/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{opt.content}</p>
                      {selectedInsight === opt.content && (
                        <Check className="h-4 w-4 text-[var(--quake)] shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{opt.rationale}</p>
                  </button>
                ))}
                <button
                  onClick={handleGenerateInsights}
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
                {insightOptions ? 'Or write your own' : 'Write manually'}
              </label>
              <textarea
                value={customInsight}
                onChange={e => { setCustomInsight(e.target.value); setSelectedInsight('') }}
                placeholder='"[Persona] feel/believe/do X, but what they really want/fear/need is Y"'
                rows={2}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        {/* Step 4: Angle */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What narrative lens?</h2>
            <p className="text-sm text-muted-foreground">
              The angle is the story frame that expresses the insight.
            </p>

            {generating && !angleOptions && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating angles…
              </div>
            )}

            {!angleOptions && !generating && (
              <button
                onClick={handleGenerateAngles}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] transition-colors hover:bg-[var(--quake)]/15 disabled:opacity-60"
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
                placeholder="e.g. Problem-Solution: You've run out of interesting things to do. Here's one that isn't."
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
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-4 py-2.5 text-sm font-medium text-[var(--quake)] transition-colors hover:bg-[var(--quake)]/15 disabled:opacity-60"
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
              <Row label="Persona" value={selectedPersona?.name} />
              <Row label="Campaign" value={campaign ? (CAMPAIGN_LABELS[campaign] ?? campaign) : undefined} />
              <Row label="Insight" value={selectedInsight || customInsight} />
              <Row label="Angle" value={selectedAngle || customAngle} />
              <Row label="Hook" value={selectedHook || customHook} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Concept title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. You've Been Walking Past It"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <p className="text-xs text-muted-foreground">Use a title that captures the hook or angle, not the brand name.</p>
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

      {/* Nav buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={() => {
            if (step > 1) setStep(s => (s - 1) as Step)
            else router.push('/ideas')
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 6 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance() || generating}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!title.trim() || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save & continue to planning
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-20 shrink-0 text-xs pt-0.5 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-foreground text-xs leading-snug">{value}</span>
    </div>
  )
}
