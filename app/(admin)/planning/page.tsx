import { getConcepts } from '@/lib/data/concepts'
import { getPersonas } from '@/lib/data/personas'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CAMPAIGN_LABELS } from '@/lib/constants'

export default async function PlanningPage() {
  const [concepts, personas] = await Promise.all([getConcepts(), getPersonas()])
  const planning = concepts.filter(c => c.status === 'idea' || c.status === 'briefed')
  const personaMap = Object.fromEntries(personas.map(p => [p.id, p]))

  const ideas = planning.filter(c => c.status === 'idea')
  const briefed = planning.filter(c => c.status === 'briefed')

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold">Planning</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Refine your concepts — add hooks, formats, and variants before moving to production.
        </p>
      </div>

      {planning.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">Nothing in planning</p>
          <p className="text-xs text-muted-foreground mt-1">Start a new idea to begin.</p>
          <Link
            href="/ideas/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            New idea
          </Link>
        </div>
      ) : (
        <>
          {ideas.length > 0 && (
            <Section title="Ideas — ready to plan">
              {ideas.map(c => (
                <ConceptRow key={c.id} concept={c} persona={c.persona_id ? personaMap[c.persona_id] : null} />
              ))}
            </Section>
          )}
          {briefed.length > 0 && (
            <Section title="Briefed — add variants">
              {briefed.map(c => (
                <ConceptRow key={c.id} concept={c} persona={c.persona_id ? personaMap[c.persona_id] : null} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function ConceptRow({ concept, persona }: { concept: { id: string; title: string; status: string; campaign: string | null }; persona: { name: string } | null }) {
  return (
    <Link
      href={`/planning/${concept.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-border/80 hover:bg-card/80 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs font-bold text-[var(--quake)] shrink-0">{concept.id}</span>
        <span className="text-sm font-medium truncate">{concept.title}</span>
        <StatusBadge status={concept.status as 'idea' | 'briefed' | 'in_production' | 'live' | 'paused' | 'retired'} />
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {persona && <span className="text-xs text-muted-foreground hidden sm:block">{persona.name}</span>}
        {concept.campaign && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}
          </span>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}
