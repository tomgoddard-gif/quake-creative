import { getConcepts } from '@/lib/data/concepts'
import { ConceptCard } from '@/components/admin/ConceptCard'
import { CONCEPT_STATUSES, STATUS_LABELS, CAMPAIGN_LABELS } from '@/lib/constants'
import type { ConceptStatus } from '@/lib/types'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ status?: string; campaign?: string }>
}

export default async function LibraryPage({ searchParams }: Props) {
  const params = await searchParams
  let concepts = await getConcepts()

  if (params.status) {
    concepts = concepts.filter(c => c.status === params.status)
  }
  if (params.campaign) {
    concepts = concepts.filter(c => c.campaign === params.campaign)
  }

  const counts = CONCEPT_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = concepts.filter(c => c.status === s).length
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Creative Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{concepts.length} concepts</p>
        </div>
        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New brief
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/library" label="All" active={!params.status} />
        {CONCEPT_STATUSES.map(s => (
          <FilterChip
            key={s}
            href={`/library?status=${s}`}
            label={`${STATUS_LABELS[s]} ${counts[s] > 0 ? `(${counts[s]})` : ''}`}
            active={params.status === s}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/library" label="All campaigns" active={!params.campaign} small />
        {Object.entries(CAMPAIGN_LABELS).map(([key, label]) => (
          <FilterChip
            key={key}
            href={`/library?campaign=${key}`}
            label={label}
            active={params.campaign === key}
            small
          />
        ))}
      </div>

      {concepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No concepts match your filters.</p>
          <Link href="/library" className="mt-2 text-sm text-primary underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {concepts.map(concept => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  href,
  label,
  active,
  small,
}: {
  href: string
  label: string
  active: boolean
  small?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 transition-colors ${
        small ? 'text-[11px]' : 'text-xs'
      } ${
        active
          ? 'border-primary/50 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  )
}
