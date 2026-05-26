import { getConcepts } from '@/lib/data/concepts'
import Link from 'next/link'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ArrowRight, Plus } from 'lucide-react'

export default async function BuilderPage() {
  const concepts = await getConcepts()
  const inProgress = concepts.filter(c => c.status === 'idea' || c.status === 'briefed')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Brief Builder</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select a concept to build or continue a brief, or start from scratch.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--quake)]/30 bg-[var(--quake)]/5 p-5">
        <p className="text-sm font-medium text-foreground">Start a new concept</p>
        <p className="text-xs text-muted-foreground mt-1">
          Begin the creative ladder: Persona → Insight → Angle → Hook → Brief
        </p>
        <div className="mt-3">
          <Link
            href="/builder/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New concept
          </Link>
        </div>
      </div>

      {inProgress.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
            In progress
          </h2>
          <div className="space-y-2">
            {inProgress.map(concept => (
              <Link
                key={concept.id}
                href={`/builder/${concept.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border/80 hover:bg-card/80"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--quake)]">{concept.id}</span>
                  <span className="text-sm font-medium">{concept.title}</span>
                  <StatusBadge status={concept.status} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
