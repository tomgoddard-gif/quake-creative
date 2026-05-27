import Link from 'next/link'
import { getAngles } from '@/lib/data/angles-data'
import { Plus, ChevronRight } from 'lucide-react'
import type { Angle, Concept } from '@/lib/types'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  idea: { label: 'Idea', className: 'bg-muted text-muted-foreground' },
  concept_confirmed: { label: 'Angle confirmed', className: 'bg-[var(--quake)]/10 text-[var(--quake)]' },
  hooks_confirmed: { label: 'Package ready', className: 'bg-green-500/10 text-green-600' },
  briefed: { label: 'Briefed', className: 'bg-blue-500/10 text-blue-600' },
  in_production: { label: 'In production', className: 'bg-orange-500/10 text-orange-600' },
  live: { label: 'Live', className: 'bg-green-500/15 text-green-700' },
}

function statusBadge(status: string) {
  const s = STATUS_BADGE[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${s.className}`}>
      {s.label}
    </span>
  )
}

export default async function PlanPage() {
  let angles: Angle[] = []
  try {
    angles = await getAngles()
  } catch {
    // angles table may not exist yet — migration 006 not run
  }

  // Group by icp name
  const groups: Record<string, Angle[]> = {}
  for (const angle of angles) {
    const key = angle.icp?.name ?? 'Unknown ICP'
    if (!groups[key]) groups[key] = []
    groups[key].push(angle)
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Creative angles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Angles are the strategic frames. Each angle can have multiple concept executions.
          </p>
        </div>
        <Link
          href="/plan/new"
          className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> New angle
        </Link>
      </div>

      {angles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="rounded-full bg-muted/50 p-4">
            <Plus className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <div>
            <p className="text-sm font-medium">No angles yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first angle to start building ad concepts.</p>
            {/* Check if migration has been run */}
          </div>
          <Link
            href="/plan/new"
            className="rounded-lg bg-[var(--quake)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Create first angle
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([icpName, icpAngles]) => (
            <div key={icpName}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 px-1">
                {icpName}
              </p>
              <div className="space-y-3">
                {icpAngles.map(angle => (
                  <AngleRow key={angle.id} angle={angle} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AngleRow({ angle }: { angle: Angle }) {
  const concepts = (angle.concepts ?? []) as Concept[]

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      {/* Angle header */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{angle.title}</p>
              {angle.test_axis && (
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {angle.test_axis}
                </span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                angle.status === 'confirmed'
                  ? 'bg-[var(--quake)]/10 text-[var(--quake)]'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {angle.status === 'confirmed' ? 'Confirmed' : 'Draft'}
              </span>
            </div>
            {angle.core_message && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{angle.core_message}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground/50 shrink-0 mt-0.5">
            {concepts.length} concept{concepts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Concepts nested under angle */}
      {concepts.length > 0 && (
        <div className="border-t border-border/60 divide-y divide-border/40">
          {concepts.map(concept => (
            <Link
              key={concept.id}
              href={`/plan/${concept.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="w-1 h-full rounded-full bg-transparent group-hover:bg-[var(--quake)]/20 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{concept.title ?? 'Untitled concept'}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {new Date(concept.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {statusBadge(concept.status)}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
