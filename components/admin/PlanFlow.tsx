'use client'

import { ConceptChat } from './ConceptChat'
import { HooksPanel } from './HooksPanel'
import { BriefBuilder } from './BriefBuilder'
import { quakeConfig } from '@/lib/client-config/quake'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Concept, Message, Hook, Brief } from '@/lib/types'

const STAGE_LABELS: Record<number, string> = {
  1: 'Concept',
  2: 'Hooks',
  3: 'Brief',
}

export function PlanFlow({
  concept,
  initialMessages,
  initialHooks,
  initialBriefs,
}: {
  concept: Concept
  initialMessages: Message[]
  initialHooks: Hook[]
  initialBriefs: Brief[]
}) {
  const stage = concept.plan_stage ?? 1
  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-card/30 shrink-0">
        <Link
          href="/plan"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Plan
        </Link>

        <div className="flex-1 min-w-0">
          {icp && <span className="text-xs text-muted-foreground">{icp.name}</span>}
        </div>

        {/* Stage progress */}
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                s === stage
                  ? 'bg-[var(--quake)]/15 text-[var(--quake)]'
                  : s < stage
                  ? 'text-muted-foreground/60'
                  : 'text-muted-foreground/30'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  s < stage
                    ? 'bg-[var(--quake)]/60'
                    : s === stage
                    ? 'bg-[var(--quake)]'
                    : 'bg-muted-foreground/20'
                }`}
              />
              {STAGE_LABELS[s]}
            </div>
          ))}
        </div>
      </div>

      {/* Stage content */}
      <div className="flex-1 overflow-hidden">
        {stage === 1 && (
          <ConceptChat concept={concept} initialMessages={initialMessages} />
        )}
        {stage === 2 && (
          <HooksPanel concept={concept} initialHooks={initialHooks} />
        )}
        {stage === 3 && (
          <BriefBuilder concept={concept} hooks={initialHooks} initialBriefs={initialBriefs} />
        )}
      </div>
    </div>
  )
}
