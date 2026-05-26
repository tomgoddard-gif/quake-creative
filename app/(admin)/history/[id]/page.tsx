import { notFound } from 'next/navigation'
import { getConceptById } from '@/lib/data/plans'
import { getHooks } from '@/lib/data/hooks-data'
import { getBriefs } from '@/lib/data/briefs-data'
import { BriefCard } from '@/components/admin/BriefCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { quakeConfig } from '@/lib/client-config/quake'

const STATUS_LABELS: Record<string, string> = {
  idea: 'Draft',
  concept_confirmed: 'Concept',
  hooks_confirmed: 'Hooks done',
  in_production: 'In production',
  live: 'Live',
  complete: 'Complete',
}

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const concept = await getConceptById(id)
  if (!concept) notFound()

  const [hooks, briefs] = await Promise.all([getHooks(id), getBriefs(id)])
  const icp = quakeConfig.icps.find(i => i.id === concept.icp_id)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/history"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> History
        </Link>
      </div>

      {/* Concept header */}
      <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{icp?.name ?? concept.icp_id}</p>
            <h1 className="text-lg font-semibold mt-0.5">{concept.core_message ?? concept.title}</h1>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {STATUS_LABELS[concept.status] ?? concept.status}
          </span>
        </div>
        {concept.insight && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Insight</p>
            <p className="text-sm text-muted-foreground">{concept.insight}</p>
          </div>
        )}
        {concept.angle_pain && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Pain</p>
              <p className="text-xs text-muted-foreground">{concept.angle_pain}</p>
            </div>
            {concept.angle_desire && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Desire</p>
                <p className="text-xs text-muted-foreground">{concept.angle_desire}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hooks */}
      {hooks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Hooks ({hooks.length})</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {hooks.map((hook, i) => (
              <div key={hook.id} className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Hook {i + 1}</span>
                  {hook.hook_type && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {hook.hook_type}
                    </span>
                  )}
                </div>
                {hook.written_hook && <p className="text-sm font-medium">{hook.written_hook}</p>}
                {hook.visual_hook && <p className="text-xs text-muted-foreground">{hook.visual_hook}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Briefs */}
      {briefs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Briefs ({briefs.length})</h2>
          <div className="space-y-4">
            {briefs.map((brief, idx) => (
              <BriefCard key={brief.id} brief={brief} index={idx} />
            ))}
          </div>
        </section>
      )}

      {briefs.length === 0 && hooks.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No hooks or briefs generated yet.</p>
          <Link href={`/plan/${id}`} className="mt-3 inline-block text-xs text-[var(--quake)] hover:underline">
            Continue in Plan →
          </Link>
        </div>
      )}
    </div>
  )
}
