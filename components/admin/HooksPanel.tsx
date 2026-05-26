'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateHooksAction,
  refineHookAction,
  confirmHookAction,
  confirmAllHooksAction,
} from '@/app/actions/hooks-actions'
import { Check, RefreshCw, ChevronRight, Eye, Volume2, Type } from 'lucide-react'
import type { Hook, Concept } from '@/lib/types'

export function HooksPanel({
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
  const [confirming, setConfirming] = useState<string | null>(null)
  const [confirmingAll, setConfirmingAll] = useState(false)

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

  async function handleConfirm(hookId: string) {
    setConfirming(hookId)
    try {
      await confirmHookAction(hookId)
      setHooks(prev => prev.map(h => (h.id === hookId ? { ...h, confirmed: true } : h)))
    } catch (err) {
      console.error(err)
    } finally {
      setConfirming(null)
    }
  }

  async function handleConfirmAll() {
    setConfirmingAll(true)
    try {
      await confirmAllHooksAction(concept.id)
      router.refresh()
    } catch (err) {
      console.error(err)
      setConfirmingAll(false)
    }
  }

  const allConfirmed = hooks.length > 0 && hooks.every(h => h.confirmed)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 2 — Hooks</p>
          <p className="text-sm font-semibold mt-0.5">Confirm 3 hooks to continue</p>
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

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Concept summary */}
        <div className="mb-6 rounded-xl border border-border bg-card/40 px-4 py-3 space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Confirmed concept</p>
          {concept.core_message && (
            <p className="text-sm font-medium">{concept.core_message}</p>
          )}
          {concept.insight && (
            <p className="text-xs text-muted-foreground">{concept.insight}</p>
          )}
        </div>

        {generating ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generating hooks…</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {hooks.map((hook, idx) => (
              <HookCard
                key={hook.id}
                hook={hook}
                index={idx}
                refineInput={refineInputs[hook.id] ?? ''}
                onRefineInputChange={(v) => setRefineInputs(prev => ({ ...prev, [hook.id]: v }))}
                onRefine={() => handleRefine(hook.id)}
                onConfirm={() => handleConfirm(hook.id)}
                refining={refining === hook.id}
                confirming={confirming === hook.id}
              />
            ))}
          </div>
        )}

        {allConfirmed && (
          <div className="mt-6">
            <button
              onClick={handleConfirmAll}
              disabled={confirmingAll}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {confirmingAll ? 'Building briefs…' : 'Build briefs from these hooks'}
              {!confirmingAll && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
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
  onConfirm,
  refining,
  confirming,
}: {
  hook: Hook
  index: number
  refineInput: string
  onRefineInputChange: (v: string) => void
  onRefine: () => void
  onConfirm: () => void
  refining: boolean
  confirming: boolean
}) {
  return (
    <div className={`flex flex-col rounded-xl border p-4 space-y-3 transition-colors ${hook.confirmed ? 'border-[var(--quake)]/40 bg-[var(--quake)]/5' : 'border-border bg-card/50'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Hook {index + 1}
        </span>
        {hook.confirmed && (
          <span className="flex items-center gap-1 text-xs text-[var(--quake)] font-medium">
            <Check className="h-3 w-3" /> Confirmed
          </span>
        )}
      </div>

      {hook.hook_type && (
        <span className="inline-block rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground w-fit">
          {hook.hook_type}
        </span>
      )}

      {hook.written_hook && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            <Type className="h-3 w-3" /> Written
          </div>
          <p className="text-sm font-medium leading-snug">{hook.written_hook}</p>
        </div>
      )}

      {hook.visual_hook && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            <Eye className="h-3 w-3" /> Visual
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{hook.visual_hook}</p>
        </div>
      )}

      {hook.audio_hook && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            <Volume2 className="h-3 w-3" /> Audio
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{hook.audio_hook}</p>
        </div>
      )}

      <div className="pt-1 space-y-2">
        {!hook.confirmed && (
          <>
            <div className="flex gap-2">
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
            <button
              onClick={onConfirm}
              disabled={confirming}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-foreground/5 border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              {confirming ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-foreground border-t-transparent" />
              ) : (
                <Check className="h-3 w-3 text-[var(--quake)]" />
              )}
              Confirm hook
            </button>
          </>
        )}
      </div>
    </div>
  )
}
