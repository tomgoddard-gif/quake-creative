import { getConcepts } from '@/lib/data/concepts'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, FolderDot, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CAMPAIGN_LABELS } from '@/lib/constants'

async function getVariantCounts(): Promise<Record<string, number>> {
  const supabase = createServerClient()
  const { data } = await supabase.from('creative_variants').select('concept_id')
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.concept_id] = (counts[row.concept_id] ?? 0) + 1
  }
  return counts
}

export default async function ProductionPage() {
  const [concepts, variantCounts] = await Promise.all([
    getConcepts(),
    getVariantCounts().catch(() => ({} as Record<string, number>)),
  ])

  const inProd = concepts.filter(c =>
    c.status === 'in_production' || c.status === 'live' || c.status === 'paused' || c.status === 'retired'
  )
  const briefed = concepts.filter(c => c.status === 'briefed')

  const all = [...inProd, ...briefed]

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold">Production</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Each concept is a folder of creative variants — different hooks, formats, and languages on the same angle.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No concepts in production yet</p>
          <p className="text-xs text-muted-foreground mt-1">Move a concept from Planning to start.</p>
          <Link
            href="/planning"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to Planning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map(concept => {
            const count = variantCounts[concept.id] ?? 0
            return (
              <Link
                key={concept.id}
                href={`/production/${concept.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/70 hover:bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {count > 0 ? (
                      <FolderDot className="h-5 w-5 text-[var(--quake)]" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-mono font-bold text-[var(--quake)]">{concept.id}</span>
                  </div>
                  <StatusBadge status={concept.status} />
                </div>

                <div>
                  <p className="text-sm font-medium leading-snug">{concept.title}</p>
                  {concept.persona?.name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{concept.persona.name}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {concept.campaign && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}
                    </span>
                  )}
                  {concept.angle_type && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {concept.angle_type}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {count === 0 ? 'No variants' : `${count} variant${count !== 1 ? 's' : ''}`}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
