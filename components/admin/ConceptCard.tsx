import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { FatigueBadge } from './FatigueBadge'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { CAMPAIGN_LABELS, META_FATIGUE_THRESHOLD, TEST_AXIS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Concept } from '@/lib/types'

export function ConceptCard({ concept }: { concept: Concept }) {
  const perf = concept.meta_performance
  const isFatigued = perf?.frequency != null && perf.frequency >= META_FATIGUE_THRESHOLD

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 hover:bg-card/80">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[var(--quake)]">{concept.id}</span>
          <StatusBadge status={concept.status} />
          {isFatigued && perf?.frequency != null && (
            <FatigueBadge frequency={perf.frequency} />
          )}
        </div>
        {perf?.ctr != null && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {(perf.ctr * 100).toFixed(2)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium leading-snug text-foreground">{concept.title}</p>
        {concept.persona && (
          <p className="mt-0.5 text-xs text-muted-foreground">{concept.persona.name}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {concept.campaign && (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}
          </span>
        )}
        {concept.hook_type && (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {concept.hook_type}
          </span>
        )}
        {concept.test_axis && (
          <span className={cn('rounded-md px-1.5 py-0.5 text-[11px]', TEST_AXIS_COLORS[concept.test_axis] ?? 'bg-muted text-muted-foreground')}>
            {concept.test_axis}
          </span>
        )}
      </div>

      <Link
        href={`/library/${concept.id}`}
        className="mt-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground"
      >
        View brief <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
