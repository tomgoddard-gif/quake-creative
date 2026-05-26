import { getConcepts } from '@/lib/data/concepts'
import { getPersonas } from '@/lib/data/personas'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CAMPAIGN_LABELS } from '@/lib/constants'

export default async function IdeasPage() {
  const [concepts, personas] = await Promise.all([getConcepts(), getPersonas()])
  const ideas = concepts.filter(c => c.status === 'idea')
  const personaMap = Object.fromEntries(personas.map(p => [p.id, p]))

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Ideas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build a new ad concept through the creative ladder — Persona → Insight → Angle → Hook.
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New idea
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No ideas yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start a new idea to begin the creative ladder.
          </p>
          <Link
            href="/ideas/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New idea
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {ideas.map(concept => {
            const persona = concept.persona_id ? personaMap[concept.persona_id] : null
            return (
              <Link
                key={concept.id}
                href={`/planning/${concept.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-border/80 hover:bg-card/80 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-[var(--quake)] shrink-0">{concept.id}</span>
                  <span className="text-sm font-medium truncate">{concept.title}</span>
                  <StatusBadge status={concept.status} />
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {persona && (
                    <span className="text-xs text-muted-foreground hidden sm:block">{persona.name}</span>
                  )}
                  {concept.campaign && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {concepts.length} total concepts across all stages ·{' '}
          <Link href="/library" className="underline underline-offset-2 hover:text-foreground">
            View archive
          </Link>
        </p>
      </div>
    </div>
  )
}
