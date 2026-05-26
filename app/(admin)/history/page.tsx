import { getConcepts } from '@/lib/data/plans'
import Link from 'next/link'
import { ArrowRight, PenLine } from 'lucide-react'
import { quakeConfig } from '@/lib/client-config/quake'

const STATUS_LABELS: Record<string, string> = {
  idea: 'Draft',
  concept_confirmed: 'Concept',
  hooks_confirmed: 'Hooks done',
  briefed: 'Briefed',
  in_production: 'In production',
  live: 'Live',
  complete: 'Complete',
  paused: 'Paused',
  retired: 'Retired',
}

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-muted text-muted-foreground',
  concept_confirmed: 'bg-blue-500/15 text-blue-400',
  hooks_confirmed: 'bg-purple-500/15 text-purple-400',
  briefed: 'bg-yellow-500/15 text-yellow-400',
  in_production: 'bg-orange-500/15 text-orange-400',
  live: 'bg-green-500/15 text-green-400',
  complete: 'bg-[var(--quake)]/15 text-[var(--quake)]',
  paused: 'bg-muted text-muted-foreground',
  retired: 'bg-muted text-muted-foreground/50',
}

export default async function HistoryPage() {
  const concepts = await getConcepts()
  const icpMap = Object.fromEntries(quakeConfig.icps.map(i => [i.id, i.name]))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All concepts across every stage.
          </p>
        </div>
        <Link
          href="/plan"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <PenLine className="h-4 w-4" />
          New concept
        </Link>
      </div>

      {concepts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium">No concepts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start your first concept to see it here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ICP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Concept</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {concepts.map(concept => (
                <tr key={concept.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {concept.icp_id ? icpMap[concept.icp_id] ?? concept.icp_id : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {concept.core_message ?? concept.title}
                    </span>
                    {concept.insight && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{concept.insight}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[concept.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {STATUS_LABELS[concept.status] ?? concept.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {new Date(concept.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/plan/${concept.id}`} className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
