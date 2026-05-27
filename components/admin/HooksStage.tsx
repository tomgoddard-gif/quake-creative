'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateHooksAction,
  refineHookAction,
  advanceToConceptStageAction,
} from '@/app/actions/hooks-actions'
import { RefreshCw, ChevronRight } from 'lucide-react'
import type { Hook, Concept } from '@/lib/types'

export function HooksStage({
  concept,
  initialHooks,
}: {
  concept: Concept
  initialHooks: Hook[]
}) {
  const router = useRouter()
  const [hooks, setHooks] = useState<Hook[]>(initialHooks)
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState<string | null>(null)
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({})
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    if (hooks.length === 0) {
      handleGenerate()
    }
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const generated = await generateHooksAction(concept.id)
      setHooks(generated)
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

  async function handleAdvance() {
    setAdvancing(true)
    try {
      await advanceToConceptStageAction(concept.id)
      router.refresh()
    } catch (err) {
      console.error(err)
      setAdvancing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 2 — Hooks</p>
          <p className="text-sm font-semibold mt-0.5">Review and refine your hooks</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`} />
          Regenerate all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Angle recap */}
        {concept.angle && (
          <div className="rounded-xl border border-border bg-card/40 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Angle</p>
            <p className="text-sm font-medium">{concept.angle.title}</p>
            {concept.angle.core_message && (
              <p className="text-xs text-muted-foreground mt-0.5">{concept.angle.core_message}</p>
            )}
          </div>
        )}

        {generating ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generating hooks…</p>
            </div>
          </div>
        ) : (
          <>
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

            {hooks.length > 0 && (
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {advancing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Moving to concept stage…
                  </>
                ) : (
                  <>
                    These hooks are confirmed
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
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
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Hook {index + 1}
        </span>
        {hook.hook_type && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
