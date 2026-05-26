import { createServerClient } from '@/lib/supabase/server'
import type { Brief } from '@/lib/types'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'

async function getBriefs(): Promise<Brief[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('briefs')
    .select('*, concept:concepts(*)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Brief[]
}

const BRIEF_STATUS_COLORS: Record<string, string> = {
  draft:              'bg-zinc-500/15 text-zinc-400',
  awaiting_approval:  'bg-amber-500/15 text-amber-400',
  approved:           'bg-emerald-500/15 text-emerald-400',
  rejected:           'bg-red-500/15 text-red-400',
}

const BRIEF_STATUS_LABELS: Record<string, string> = {
  draft:              'Draft',
  awaiting_approval:  'Awaiting approval',
  approved:           'Approved',
  rejected:           'Changes requested',
}

export default async function BriefsPage() {
  const briefs = await getBriefs()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Briefs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{briefs.length} briefs shared with you</p>
      </div>

      {briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No briefs yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Briefs submitted for approval will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map(brief => (
            <Link
              key={brief.id}
              href={`/briefs/${brief.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border/80 hover:bg-card/80"
            >
              <div className="flex items-center gap-3">
                {brief.concept && (
                  <span className="font-mono text-xs font-bold text-[var(--quake)]">
                    {(brief.concept as { id: string }).id}
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {brief.concept ? (brief.concept as { title: string }).title : brief.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {new Date(brief.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${BRIEF_STATUS_COLORS[brief.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {BRIEF_STATUS_LABELS[brief.status] ?? brief.status}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
