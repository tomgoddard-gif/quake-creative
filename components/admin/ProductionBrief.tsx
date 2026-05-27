'use client'

import { useState, useEffect } from 'react'
import {
  generateProductionBriefAction,
  getBriefsAction,
} from '@/app/actions/briefs-actions'
import { Copy, Check, Plus, FileText } from 'lucide-react'
import type { Concept, Brief } from '@/lib/types'
import type { FunnelStage } from '@/lib/types'

type Format = '15s_video' | 'static' | 'ugc'
type Platform = 'meta_feed' | 'meta_stories' | 'tiktok' | 'google_display'

const FORMAT_OPTIONS: { id: Format; label: string; description: string }[] = [
  { id: '15s_video', label: '15s Video', description: 'Scripted 4-scene format' },
  { id: 'static', label: 'Static Ad', description: 'Hero image + copy' },
  { id: 'ugc', label: 'UGC Brief', description: 'Creator brief format' },
]

const PLATFORM_OPTIONS: { id: Platform; label: string }[] = [
  { id: 'meta_feed', label: 'Meta Feed (4:5)' },
  { id: 'meta_stories', label: 'Meta Stories / Reels (9:16)' },
  { id: 'tiktok', label: 'TikTok (9:16)' },
  { id: 'google_display', label: 'Google Display' },
]

const FUNNEL_OPTIONS: { id: FunnelStage; label: string; description: string }[] = [
  { id: 'tofu', label: 'TOFU', description: 'Awareness' },
  { id: 'mofu', label: 'MOFU', description: 'Consideration' },
  { id: 'bofu', label: 'BOFU', description: 'Conversion' },
]

const COMPLEXITY_LABELS: Record<string, string> = {
  ugc: 'UGC',
  mid: 'Mid-production',
  professional: 'Full production',
}

export function ProductionBrief({
  concept,
  initialBriefs,
}: {
  concept: Concept
  initialBriefs: Brief[]
}) {
  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs)
  const [format, setFormat] = useState<Format>('15s_video')
  const [platform, setPlatform] = useState<Platform>('meta_feed')
  const [funnelStage, setFunnelStage] = useState<FunnelStage>('tofu')
  const [generating, setGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(initialBriefs.length === 0)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const brief = await generateProductionBriefAction(concept.id, {
        format,
        platform,
        funnelStage,
      })
      setBriefs(prev => [brief, ...prev])
      setShowGenerator(false)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 4 — Production Brief</p>
        <p className="text-sm font-semibold mt-0.5">Generate format-specific briefs</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-8 max-w-3xl">

          {/* Concept recap */}
          <div className="space-y-2">
            {concept.angle && (
              <div className="rounded-xl border border-border bg-card/40 px-4 py-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Angle</p>
                <p className="text-sm font-medium">{concept.angle.title}</p>
              </div>
            )}
            {concept.concept_overview && (
              <div className="rounded-xl border border-border bg-card/40 px-4 py-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  Concept
                  {concept.production_complexity && (
                    <span className="ml-2 normal-case">· {COMPLEXITY_LABELS[concept.production_complexity] ?? concept.production_complexity}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{concept.concept_overview}</p>
              </div>
            )}
          </div>

          {/* Generator panel */}
          {showGenerator && (
            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">New brief</p>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground/70 block">Format</label>
                <div className="flex gap-2 flex-wrap">
                  {FORMAT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFormat(opt.id)}
                      className={`flex flex-col rounded-xl border px-4 py-3 text-left transition-all min-w-[110px] ${
                        format === opt.id
                          ? 'border-[var(--quake)]/40 bg-[var(--quake)]/8 text-foreground'
                          : 'border-border bg-background/50 text-muted-foreground hover:border-[var(--quake)]/20'
                      }`}
                    >
                      <span className="text-xs font-semibold">{opt.label}</span>
                      <span className="text-[10px] mt-0.5">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground/70 block">Platform</label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORM_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPlatform(opt.id)}
                      className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                        platform === opt.id
                          ? 'border-[var(--quake)]/40 bg-[var(--quake)]/8 text-foreground font-medium'
                          : 'border-border bg-background/50 text-muted-foreground hover:border-[var(--quake)]/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funnel stage */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground/70 block">Funnel stage</label>
                <div className="flex gap-2">
                  {FUNNEL_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setFunnelStage(opt.id)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs transition-all ${
                        funnelStage === opt.id
                          ? 'border-[var(--quake)]/40 bg-[var(--quake)]/8 text-foreground font-medium'
                          : 'border-border bg-background/50 text-muted-foreground hover:border-[var(--quake)]/20'
                      }`}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--quake)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating brief…
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate brief
                  </>
                )}
              </button>
            </div>
          )}

          {/* Add another brief button */}
          {!showGenerator && (
            <button
              onClick={() => setShowGenerator(true)}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:border-[var(--quake)]/30 transition-colors w-full justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another brief
            </button>
          )}

          {/* Generated briefs */}
          {briefs.length > 0 && (
            <div className="space-y-5">
              {briefs.map(brief => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const FORMAT_DISPLAY: Record<string, string> = {
  '15s_video': '15s Video',
  static: 'Static Ad',
  ugc: 'UGC Brief',
}

const PLATFORM_DISPLAY: Record<string, string> = {
  meta_feed: 'Meta Feed',
  meta_stories: 'Meta Stories',
  tiktok: 'TikTok',
  google_display: 'Google Display',
}

function BriefCard({ brief }: { brief: Brief }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(brief.creative_idea ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  function handleDownload() {
    const format = FORMAT_DISPLAY[brief.format ?? ''] ?? brief.format ?? 'brief'
    const platform = PLATFORM_DISPLAY[brief.platform ?? ''] ?? brief.platform ?? ''
    const funnel = brief.funnel_stage?.toUpperCase() ?? ''
    const filename = `Brief — ${format} — ${platform} — ${funnel}.txt`

    const blob = new Blob([brief.creative_idea ?? ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Brief header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[var(--quake)]/10 border border-[var(--quake)]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--quake)]">
            {FORMAT_DISPLAY[brief.format ?? ''] ?? brief.format}
          </span>
          {brief.platform && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {PLATFORM_DISPLAY[brief.platform] ?? brief.platform}
            </span>
          )}
          {brief.funnel_stage && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {brief.funnel_stage.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>

      {/* Brief body */}
      <div className="px-5 py-4">
        <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
          {brief.creative_idea}
        </pre>
      </div>
    </div>
  )
}
