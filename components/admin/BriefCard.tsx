'use client'

import { useState } from 'react'
import { Download, ChevronDown, ChevronUp } from 'lucide-react'
import type { Brief } from '@/lib/types'

const FIELD_LABELS: Array<{ key: keyof Brief; label: string }> = [
  { key: 'creative_idea', label: 'Creative idea' },
  { key: 'primary_text', label: 'Primary text' },
  { key: 'headline', label: 'Headline' },
  { key: 'cta_text', label: 'CTA' },
  { key: 'talent_notes', label: 'Talent notes' },
  { key: 'audio_direction', label: 'Audio direction' },
  { key: 'placement_specs', label: 'Placement specs' },
]

const FUNNEL_COLORS: Record<string, string> = {
  tofu: 'bg-blue-500/15 text-blue-400',
  mofu: 'bg-yellow-500/15 text-yellow-400',
  bofu: 'bg-green-500/15 text-green-400',
}

export function BriefCard({ brief, index }: { brief: Brief; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { pdf } = await import('@react-pdf/renderer')
      const { BriefPDF } = await import('./BriefPDF')
      const React = await import('react')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(React.createElement(BriefPDF, { brief }) as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brief-${brief.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-muted-foreground shrink-0">#{index + 1}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {brief.format && (
              <span className="text-xs font-medium text-foreground">{brief.format}</span>
            )}
            {brief.platform && (
              <span className="text-xs text-muted-foreground">· {brief.platform}</span>
            )}
            {brief.funnel_stage && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${FUNNEL_COLORS[brief.funnel_stage] ?? 'bg-muted text-muted-foreground'}`}>
                {brief.funnel_stage.toUpperCase()}
              </span>
            )}
            {brief.hook_data?.hook_type && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                {brief.hook_data.hook_type}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-3 w-3" />
            {exporting ? 'Exporting…' : 'PDF'}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center justify-center h-7 w-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {FIELD_LABELS.map(({ key, label }) => {
            const value = brief[key]
            if (!value || typeof value !== 'string') return null
            return (
              <div key={key} className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</p>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{value}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
