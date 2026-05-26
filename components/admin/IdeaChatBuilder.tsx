'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { refineFreeformIdea, structureIdea } from '@/app/actions/ai'
import { createConcept } from '@/app/actions/ideas'
import type { AIOption } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronRight, Sparkles, Loader2, Check } from 'lucide-react'

type Stage = 'input' | 'questions' | 'structured'

interface StructuredResult {
  title: string
  insight: string
  angle: string
  angle_type: string
  hooks: AIOption[]
}

const TEST_AXES = ['Emotional', 'Social Proof', 'Problem-Solution', 'Revelation', 'Identity']

interface Props {
  onBack: () => void
}

export function IdeaChatBuilder({ onBack }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [stage, setStage] = useState<Stage>('input')
  const [rawIdea, setRawIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [reflection, setReflection] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])

  const [result, setResult] = useState<StructuredResult | null>(null)
  const [selectedHook, setSelectedHook] = useState('')
  const [title, setTitle] = useState('')
  const [testAxis, setTestAxis] = useState('')

  async function handleRefine() {
    if (!rawIdea.trim()) return
    setLoading(true)
    setError('')
    const res = await refineFreeformIdea(rawIdea.trim())
    setLoading(false)
    if (!res) {
      setError('AI unavailable — add your ANTHROPIC_API_KEY to .env.local to use this mode.')
      return
    }
    setReflection(res.reflection)
    setQuestions(res.questions)
    setAnswers(new Array(res.questions.length).fill(''))
    setStage('questions')
  }

  async function handleStructure() {
    setLoading(true)
    setError('')
    const qAndA = questions.map((q, i) => ({ question: q, answer: answers[i] ?? '' }))
    const res = await structureIdea(rawIdea.trim(), qAndA)
    setLoading(false)
    if (!res) {
      setError('AI unavailable.')
      return
    }
    setResult(res)
    setTitle(res.title)
    setSelectedHook(res.hooks[0]?.content ?? '')
    setStage('structured')
  }

  function handleSave() {
    if (!title.trim() || !result) return
    startTransition(async () => {
      const r = await createConcept({
        title: title.trim(),
        persona_id: null,
        campaign: null,
        funnel_stage: null,
        hook_type: null,
        angle_type: result.angle_type || null,
        test_axis: testAxis || null,
        insight: result.insight || null,
        angle: result.angle || null,
        hook: selectedHook || result.hooks[0]?.content || null,
      })
      if ('id' in r) router.push(`/planning/${r.id}`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          New idea
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-sm font-medium">I have an idea</span>
      </div>

      {stage === 'input' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">What's your idea?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe it however it's formed — a feeling, a line, a scenario, a rough angle. Claude will help shape it into a concept.
            </p>
          </div>
          <textarea
            value={rawIdea}
            onChange={e => setRawIdea(e.target.value)}
            placeholder="e.g. Something about locals who've never been — they walk past it every day but have no idea what happened there."
            rows={5}
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleRefine}
              disabled={!rawIdea.trim() || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Sharpen this idea
            </button>
          </div>
        </div>
      )}

      {stage === 'questions' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Claude's read</p>
            <p className="text-sm text-foreground leading-relaxed">{reflection}</p>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-medium text-foreground">A few questions to sharpen it:</p>
            {questions.map((q, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-sm text-foreground">{q}</label>
                <textarea
                  value={answers[i] ?? ''}
                  onChange={e => {
                    const next = [...answers]
                    next[i] = e.target.value
                    setAnswers(next)
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={() => setStage('input')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleStructure}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Build concept
            </button>
          </div>
        </div>
      )}

      {stage === 'structured' && result && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Here's your concept</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review and edit before saving to planning.</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
            <ConceptField label="Insight" value={result.insight} />
            <ConceptField label="Angle" value={result.angle}>
              {result.angle_type && (
                <span className="inline-flex mt-1.5 rounded-full border border-[var(--quake)]/30 bg-[var(--quake)]/8 px-2.5 py-0.5 text-[11px] text-[var(--quake)]">
                  {result.angle_type}
                </span>
              )}
            </ConceptField>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select your hook</p>
            {result.hooks.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedHook(opt.content)}
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
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Concept title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-xs text-muted-foreground">Edit if needed — this becomes the concept ID and folder name.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Test axis</label>
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

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={() => setStage('questions')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save & continue to planning
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ConceptField({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground leading-snug">{value}</p>
      {children}
    </div>
  )
}
