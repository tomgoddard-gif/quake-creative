import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { ConceptStatus } from '@/lib/types'

export function StatusBadge({ status }: { status: ConceptStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        STATUS_COLORS[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
