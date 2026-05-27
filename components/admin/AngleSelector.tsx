'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateAngleOptionsAction,
  refineAngleOptionAction,
  confirmAngleAction,
  type AngleOption,
} from '@/app/actions/angles'
import { Sparkles, ChevronRight, RefreshCw, ArrowLeft, Check } from 'lucide-react'
import type { Concept } from '@/lib/types'

const TEST_AXIS_COLOURS: Record<string, string> = {
  Emotional: 'bg-purple-500/10 text-purple-600 border-purple-200',
  Revelation: 'bg-blue-500/10 text-blue-600 border-blue-200',
  Identity: 'bg-amber-500/10 text-amber-600 border-amber-200',
  'Problem-Solution': 'bg-green-500/10 text-green-600 border-green-200',
  'Social Proof': 'bg-pink-500/10 text-pink-600 border-pink-200',
}

export function AngleSelector({ concept }: { concept: Concept }) {
  const router = useRouter()
  const [direction, setDirection] = useState(concept.idea_seed ?? '')
  const [options, setOptions] = useState<AngleOption[]>([])
  const [selected, setSelected] = useState<AngleOption | null>(null)
  const [refineInput, setRefineInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    setSelected(null)
    setOptions([])
    try {
      const result = await generateAngleOptionsAction(concept.id, direction || undefined)
      setOptions(result)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleRefine() {
    if (!selected || !refineInput.trim()) return
    setRefining(true)
    try {
      const updated = await refineAngleOptionAction(concept.id, selected, refineInput)
      setSelected(updated)
      setRefineInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setRefining(false)
    }
  }

  async function handleConfirm() {
    if (!selected || !concept.angle_id) return
    setConfirming(true)
    try {
      await confirmAngleAction(concept.angle_id, concept.id, selected)
      router.refresh()
    } catch (err) {
      console.error(err)
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 1 — Angle</p>
        <p className="text-sm font-semibold mt-0.5">Choose a creative angle</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Generation controls */}
        {options.length === 0 && !generating && (
          <div className="max-w-2xl space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 block mb-1.5">
                Direction hint (optional)
              </label>
              <textarea
                value={direction}
                onChange={e => setDirection(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                placeholder="Any rough idea or direction to explore? Leave blank to generate from ICP alone…"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-xl bg-[var(--quake)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Generate angles
            </button>
          </div>
        )}

        {/* Loading */}
        {generating && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generating 3 angles…</p>
            </div>
          </div>
        )}

        {/* Angle options — grid view */}
        {options.length > 0 && !selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Choose the angle that best fits your brief</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {options.map((option, idx) => (
                <AngleCard
                  key={idx}
                  option={option}
                  index={idx}
                  onSelect={() => setSelected(option)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Selected angle — detail view */}
        {selected && (
          <div className="max-w-2xl space-y-5">
            {/* Back to options */}
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to options
            </button>

            {/* Full angle detail */}
            <div className="rounded-xl border border-[var(--quake)]/30 bg-[var(--quake)]/5 p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold flex-1">{selected.title}</p>
                <TestAxisBadge axis={selected.test_axis} />
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1.5">Narrative</p>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2 border-l-2 border-[var(--quake)]/20 pl-3">
                  {selected.angle_narrative.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[var(--quake)]/10 border border-[var(--quake)]/20 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--quake)]/70 mb-1">Core message</p>
                <p className="text-sm font-semibold">{selected.core_message}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DetailField label="Pain point" value={selected.pain_point} />
                <DetailField label="Benefit" value={selected.benefit} />
                <DetailField label="Desired response" value={selected.desired_response} />
              </div>
            </div>

            {/* Refine */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 block">
                Refine this angle
              </label>
              <div className="flex gap-2">
                <input
                  value={refineInput}
                  onChange={e => setRefineInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRefine()}
                  placeholder="Give direction… e.g. 'make the pain point sharper' or 'focus more on kids'"
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

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {confirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Confirming…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirm angle — generate hooks
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AngleCard({
  option,
  index,
  onSelect,
}: {
  option: AngleOption
  index: number
  onSelect: () => void
}) {
  const firstPara = option.angle_narrative.split('\n\n')[0] ?? option.angle_narrative
  const preview = firstPara.length > 120 ? firstPara.slice(0, 120) + '…' : firstPara

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/50 p-4 space-y-3 hover:border-[var(--quake)]/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Option {index + 1}
        </span>
        <TestAxisBadge axis={option.test_axis} />
      </div>

      <p className="text-sm font-semibold leading-snug">{option.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{preview}</p>

      <div className="rounded-lg bg-muted/40 px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">Core message</p>
        <p className="text-xs font-medium leading-snug">{option.core_message}</p>
      </div>

      <button
        onClick={onSelect}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[var(--quake)]/10 border border-[var(--quake)]/20 px-3 py-2 text-xs font-medium text-[var(--quake)] hover:bg-[var(--quake)]/20 transition-colors"
      >
        Select this angle <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  )
}

function TestAxisBadge({ axis }: { axis: string }) {
  const cls = TEST_AXIS_COLOURS[axis] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shrink-0 ${cls}`}>
      {axis}
    </span>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">{value}</p>
    </div>
  )
}
