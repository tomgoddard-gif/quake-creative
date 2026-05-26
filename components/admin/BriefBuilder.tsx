'use client'

import { useState } from 'react'
import { generateBriefsAction } from '@/app/actions/briefs-actions'
import { BriefCard } from './BriefCard'
import { Sparkles, AlertTriangle } from 'lucide-react'
import type { Brief, Concept, Hook, FunnelStage } from '@/lib/types'

const FORMATS = [
  'UGC / Testimonial',
  'Short video',
  'Static image',
  'Carousel',
  'Motion / Slideshow',
]

const PLATFORMS = ['Meta', 'TikTok', 'Google Demand Gen', 'YouTube']

const FUNNEL_STAGES: Array<{ id: FunnelStage; label: string; description: string }> = [
  { id: 'tofu', label: 'TOFU', description: 'Top of Funnel — awareness, cold audiences' },
  { id: 'mofu', label: 'MOFU', description: 'Middle of Funnel — consideration, warm audiences' },
  { id: 'bofu', label: 'BOFU', description: 'Bottom of Funnel — conversion, hot leads' },
]

export function BriefBuilder({
  concept,
  hooks,
  initialBriefs,
}: {
  concept: Concept
  hooks: Hook[]
  initialBriefs: Brief[]
}) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [funnelStage, setFunnelStage] = useState<FunnelStage | null>(null)
  const [generating, setGenerating] = useState(false)
  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs)
  const [staticTofuWarning, setStaticTofuWarning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleFormat(f: string) {
    setSelectedFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }
  function togglePlatform(p: string) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const briefCount = selectedFormats.length * hooks.length
  const isStaticTofu = selectedFormats.includes('Static image') && funnelStage === 'tofu'

  async function handleGenerate() {
    if (!funnelStage || selectedFormats.length === 0 || selectedPlatforms.length === 0) return
    if (isStaticTofu && !staticTofuWarning) {
      setStaticTofuWarning(true)
      return
    }
    setGenerating(true)
    setError(null)
    setStaticTofuWarning(false)
    try {
      const generated = await generateBriefsAction(concept.id, {
        formats: selectedFormats,
        platforms: selectedPlatforms,
        funnelStage,
      })
      setBriefs(generated)
    } catch (err) {
      setError('Failed to generate briefs. Please try again.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 3 — Brief</p>
        <p className="text-sm font-semibold mt-0.5">Select formats to generate production briefs</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Hooks summary */}
        <div className="rounded-xl border border-border bg-card/40 px-4 py-3 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{hooks.length} confirmed hooks</p>
          <div className="flex flex-wrap gap-2">
            {hooks.map((h, i) => (
              <span key={h.id} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                Hook {i + 1} · {h.hook_type}
              </span>
            ))}
          </div>
        </div>

        {/* Format selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map(f => (
              <button
                key={f}
                onClick={() => toggleFormat(f)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedFormats.includes(f)
                    ? 'border-[var(--quake)]/60 bg-[var(--quake)]/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Platform selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedPlatforms.includes(p)
                    ? 'border-[var(--quake)]/60 bg-[var(--quake)]/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Funnel stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Funnel stage</label>
          <div className="flex gap-2">
            {FUNNEL_STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => setFunnelStage(s.id)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  funnelStage === s.id
                    ? 'border-[var(--quake)]/60 bg-[var(--quake)]/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Static × TOFU warning */}
        {staticTofuWarning && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">Static image defaults to BOFU. Are you sure you want TOFU for a static?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStaticTofuWarning(false)}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 text-xs text-yellow-200 hover:bg-yellow-500/30 transition-colors"
              >
                Yes, generate anyway
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generate button */}
        {!staticTofuWarning && (
          <button
            onClick={handleGenerate}
            disabled={
              generating ||
              selectedFormats.length === 0 ||
              selectedPlatforms.length === 0 ||
              !funnelStage
            }
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating {briefCount} brief{briefCount !== 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate {briefCount > 0 ? `${briefCount} ` : ''}brief{briefCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        )}

        {/* Generated briefs */}
        {briefs.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-4">{briefs.length} brief{briefs.length !== 1 ? 's' : ''} generated</p>
              <div className="space-y-4">
                {briefs.map((brief, idx) => (
                  <BriefCard key={brief.id} brief={brief} index={idx} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
