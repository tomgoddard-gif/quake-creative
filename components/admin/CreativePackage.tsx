'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateCreativePackageAction,
  refineHookAction,
  createConceptFromAngleAction,
} from '@/app/actions/hooks-actions'
import { RefreshCw, Plus, Copy, Check, AlertCircle } from 'lucide-react'
import type { Hook, Brief, Concept, Angle } from '@/lib/types'

const FORMAT_LABELS: Record<string, string> = {
  '15s_video': '15-second video',
  static: 'Static ad',
  ugc: 'UGC brief',
}

export function CreativePackage({
  concept,
  angle,
  initialHooks,
  initialBriefs,
}: {
  concept: Concept
  angle: Angle | null
  initialHooks: Hook[]
  initialBriefs: Brief[]
}) {
  const router = useRouter()
  const [hooks, setHooks] = useState<Hook[]>(initialHooks)
  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs)
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState<string | null>(null)
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({})
  const [regenerateConfirm, setRegenerateConfirm] = useState(false)
  const [newConceptLoading, setNewConceptLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auto-generate on mount if no hooks
  useEffect(() => {
    if (hooks.length === 0 && !generating) {
      handleGenerate()
    }
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setRegenerateConfirm(false)
    try {
      const result = await generateCreativePackageAction(concept.id)
      setHooks(result.hooks)
      setBriefs(result.briefs)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleRefine(hookId: string) {
    const prompt = refineInputs[hookId]?.trim()
    if (!prompt) return
    setRefining(hookId)
    try {
      const updated = await refineHookAction(hookId, prompt, concept.id)
      setHooks(prev => prev.map(h => (h.id === hookId ? updated : h)))
      setRefineInputs(prev => ({ ...prev, [hookId]: '' }))
    } catch (err) {
      console.error(err)
    } finally {
      setRefining(null)
    }
  }

  async function handleNewConcept() {
    if (!angle) return
    setNewConceptLoading(true)
    try {
      await createConceptFromAngleAction(angle.id)
    } catch (err) {
      console.error(err)
      setNewConceptLoading(false)
    }
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const videosBrief = briefs.find(b => b.format === '15s_video')
  const staticBrief = briefs.find(b => b.format === 'static')
  const ugcBrief = briefs.find(b => b.format === 'ugc')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 2 — Creative Package</p>
          <p className="text-sm font-semibold mt-0.5">{concept.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {angle && (
            <button
              onClick={handleNewConcept}
              disabled={newConceptLoading || generating}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {newConceptLoading ? 'Creating…' : 'New concept — same angle'}
            </button>
          )}
          {regenerateConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Replace everything?</span>
              <button
                onClick={handleGenerate}
                className="rounded-lg bg-destructive/10 border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors"
              >
                Yes, regenerate
              </button>
              <button
                onClick={() => setRegenerateConfirm(false)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRegenerateConfirm(true)}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

        {generating ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generating creative package…</p>
              <p className="text-xs text-muted-foreground/60">Hooks + 3 format briefs</p>
            </div>
          </div>
        ) : (
          <>
            {/* Angle recap */}
            {angle && (
              <section>
                <SectionHeader label="Angle & Core Message" />
                <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
                  {angle.angle_narrative && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">Narrative</p>
                      <div className="text-sm text-muted-foreground leading-relaxed space-y-2 border-l-2 border-[var(--quake)]/20 pl-3">
                        {angle.angle_narrative.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {angle.core_message && (
                    <div className="rounded-lg bg-[var(--quake)]/10 border border-[var(--quake)]/20 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--quake)]/70 mb-1">Core message</p>
                      <p className="text-sm font-semibold">{angle.core_message}</p>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {angle.pain_point && <AngleField label="Pain point" value={angle.pain_point} />}
                    {angle.benefit && <AngleField label="Benefit" value={angle.benefit} />}
                    {angle.desired_response && <AngleField label="Desired response" value={angle.desired_response} />}
                  </div>
                  {angle.test_axis && (
                    <div>
                      <span className="inline-block rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {angle.test_axis}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Hooks */}
            {hooks.length > 0 && (
              <section>
                <SectionHeader label="Hooks" />
                <div className="grid gap-4 md:grid-cols-3">
                  {hooks.map((hook, idx) => (
                    <HookCard
                      key={hook.id}
                      hook={hook}
                      index={idx}
                      refineInput={refineInputs[hook.id] ?? ''}
                      onRefineInputChange={v => setRefineInputs(prev => ({ ...prev, [hook.id]: v }))}
                      onRefine={() => handleRefine(hook.id)}
                      refining={refining === hook.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Format briefs */}
            {[videosBrief, staticBrief, ugcBrief].filter(Boolean).map(brief => brief && (
              <section key={brief.id}>
                <div className="flex items-center justify-between mb-3">
                  <SectionHeader label={FORMAT_LABELS[brief.format ?? ''] ?? brief.format ?? 'Brief'} inline />
                  <button
                    onClick={() => handleCopy(brief.creative_idea ?? '', brief.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedId === brief.id ? (
                      <><Check className="h-3 w-3 text-green-500" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-card/40 px-5 py-4">
                  <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {brief.creative_idea}
                  </pre>
                </div>
              </section>
            ))}

            {hooks.length === 0 && briefs.length === 0 && !generating && (
              <div className="flex flex-col items-center gap-3 py-20">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No package yet.</p>
                <button
                  onClick={handleGenerate}
                  className="rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Generate creative package
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ label, inline }: { label: string; inline?: boolean }) {
  if (inline) return <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
  return <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">{label}</p>
}

function AngleField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">{value}</p>
    </div>
  )
}

function HookCard({
  hook,
  index,
  refineInput,
  onRefineInputChange,
  onRefine,
  refining,
}: {
  hook: Hook
  index: number
  refineInput: string
  onRefineInputChange: (v: string) => void
  onRefine: () => void
  refining: boolean
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Hook {index + 1}</span>
        {hook.hook_type && (
          <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {hook.hook_type}
          </span>
        )}
      </div>

      {hook.written_hook && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Spoken / on-screen</p>
          <p className="text-sm font-semibold leading-snug">{hook.written_hook}</p>
        </div>
      )}

      {hook.text_overlay && hook.text_overlay !== hook.written_hook && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Text overlay</p>
          <p className="text-sm text-muted-foreground leading-snug">{hook.text_overlay}</p>
        </div>
      )}

      {hook.why_it_works && (
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Why it works</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{hook.why_it_works}</p>
        </div>
      )}

      {/* Refine input */}
      <div className="pt-1 flex gap-2">
        <input
          value={refineInput}
          onChange={e => onRefineInputChange(e.target.value)}
          placeholder="Refine this hook…"
          onKeyDown={e => e.key === 'Enter' && onRefine()}
          className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40"
        />
        <button
          onClick={onRefine}
          disabled={!refineInput.trim() || refining}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          {refining ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  )
}
