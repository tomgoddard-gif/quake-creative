import { getConceptById } from '@/lib/data/concepts'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { FatigueBadge } from '@/components/admin/FatigueBadge'
import { CAMPAIGN_LABELS, META_FATIGUE_THRESHOLD } from '@/lib/constants'
import Link from 'next/link'
import { ArrowLeft, Wand2 } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConceptDetailPage({ params }: Props) {
  const { id } = await params
  const concept = await getConceptById(id)
  if (!concept) notFound()

  const perf = concept.meta_performance
  const isFatigued = perf?.frequency != null && perf.frequency >= META_FATIGUE_THRESHOLD

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Library
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm font-bold text-[var(--quake)]">{concept.id}</span>
          <StatusBadge status={concept.status} />
          {isFatigued && perf?.frequency != null && (
            <FatigueBadge frequency={perf.frequency} />
          )}
        </div>
        <h1 className="text-2xl font-semibold">{concept.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {concept.persona && <span>{concept.persona.name}</span>}
          {concept.campaign && (
            <span>· {CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}</span>
          )}
          {concept.platforms && concept.platforms.length > 0 && (
            <span>· {concept.platforms.join(', ')}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Hook type" value={concept.hook_type} />
        <Stat label="Angle" value={concept.angle_type} />
        <Stat label="Test axis" value={concept.test_axis} />
        <Stat label="Campaign" value={concept.campaign ? CAMPAIGN_LABELS[concept.campaign] : null} />
      </div>

      {perf && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-medium">Meta Performance</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="CTR" value={perf.ctr != null ? `${(perf.ctr * 100).toFixed(2)}%` : null} />
            <Stat label="Frequency" value={perf.frequency != null ? perf.frequency.toFixed(2) : null} />
            <Stat label="Spend" value={perf.spend != null ? `€${perf.spend.toFixed(0)}` : null} />
            <Stat label="CPA" value={perf.cpa != null ? `€${perf.cpa.toFixed(2)}` : null} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Synced {new Date(perf.last_synced).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/builder/${concept.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Wand2 className="h-4 w-4" />
          {concept.status === 'idea' ? 'Build brief' : 'Edit brief'}
        </Link>
      </div>

      {concept.notes && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="text-sm text-muted-foreground">{concept.notes}</p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value ?? '—'}</p>
    </div>
  )
}
