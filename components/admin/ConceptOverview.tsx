'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateConceptOverviewAction,
  refineConceptOverviewAction,
  confirmConceptOverviewAction,
} from '@/app/actions/concept-actions'
import { RefreshCw, ChevronRight, Smartphone, Layers, Clapperboard } from 'lucide-react'
import type { Concept } from '@/lib/types'

type Complexity = 'ugc' | 'mid' | 'professional'

const COMPLEXITY_OPTIONS: {
  id: Complexity
  label: string
  description: string
  details: string
  icon: React.ReactNode
}[] = [
  {
    id: 'ugc',
    label: 'UGC',
    description: 'Creator-shot',
    details: 'Shot on phone by a single creator. No crew, no equipment. Raw, authentic feel.',
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: 'mid',
    label: 'Mid-production',
    description: 'Small crew',
    details: 'Small crew, 1–2 day shoot, basic lighting rig. Semi-professional look.',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: 'professional',
    label: 'Full production',
    description: 'DP + crew',
    details: 'Director of photography, lighting, professional talent, multi-day shoot.',
    icon: <Clapperboard className="h-4 w-4" />,
  },
]

export function ConceptOverview({ concept }: { concept: Concept }) {
  const router = useRouter()
  const [overview, setOverview] = useState<string>(concept.concept_overview ?? '')
  const [generating, setGenerating] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [complexity, setComplexity] = useState<Complexity | null>(
    (concept.production_complexity as Complexity | null) ?? null,
  )
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!overview) {
      handleGenerate()
    }
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const generated = await generateConceptOverviewAction(concept.id)
      setOverview(generated)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleRefine() {
    if (!refineInput.trim()) return
    setRefining(true)
    try {
      const updated = await refineConceptOverviewAction(concept.id, refineInput)
      setOverview(updated)
      setRefineInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setRefining(false)
    }
  }

  async function handleConfirm() {
    if (!complexity) return
    setConfirming(true)
    try {
      await confirmConceptOverviewAction(concept.id, complexity)
      router.refresh()
    } catch (err) {
      console.error(err)
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 3 — Creative Concept</p>
          <p className="text-sm font-semibold mt-0.5">Define the creative idea</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || refining}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-2xl">

        {/* Hooks recap */}
        {concept.angle && (
          <div className="rounded-xl border border-border bg-card/40 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Angle</p>
            <p className="text-sm font-medium">{concept.angle.title}</p>
            {concept.angle.core_message && (
              <p className="text-xs text-muted-foreground mt-0.5">{concept.angle.core_message}</p>
            )}
          </div>
        )}

        {/* Concept overview */}
        {generating ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Writing creative concept…</p>
            </div>
          </div>
        ) : overview ? (
          <>
            {/* Overview block */}
            <div className="rounded-xl border border-[var(--quake)]/20 bg-[var(--quake)]/5 px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--quake)]/60 mb-2">
                Creative overview
              </p>
              <p className="text-sm leading-relaxed text-foreground">{overview}</p>
            </div>

            {/* Refine */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 block">
                Refine this concept
              </label>
              <div className="flex gap-2">
                <input
                  value={refineInput}
                  onChange={e => setRefineInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRefine()}
                  placeholder="Give direction… e.g. 'lean harder into the family angle' or 'make it more visceral'"
                  disabled={refining}
                  className="flex-1 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40 disabled:opacity-50"
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineInput.trim() || refining}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                >
                  {refining ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Refine
                </button>
              </div>
            </div>

            {/* Production complexity */}
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 block">
                Production complexity
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {COMPLEXITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setComplexity(opt.id)}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                      complexity === opt.id
                        ? 'border-[var(--quake)]/40 bg-[var(--quake)]/8 ring-1 ring-[var(--quake)]/20'
                        : 'border-border bg-card/50 hover:border-[var(--quake)]/20'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${complexity === opt.id ? 'text-[var(--quake)]' : 'text-muted-foreground'}`}>
                      {opt.icon}
                      <span className="text-xs font-semibold uppercase tracking-wider">{opt.label}</span>
                    </div>
                    <p className="text-xs font-medium">{opt.description}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.details}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!complexity || confirming}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {confirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Moving to production…
                </>
              ) : (
                <>
                  Confirm concept — create brief
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
