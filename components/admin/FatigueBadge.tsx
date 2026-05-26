import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FatigueBadgeProps {
  frequency: number
  className?: string
}

export function FatigueBadge({ frequency, className }: FatigueBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium text-orange-400',
        className,
      )}
      title={`Frequency: ${frequency.toFixed(1)} — creative fatigue risk`}
    >
      <AlertTriangle className="h-3 w-3" />
      {frequency.toFixed(1)}×
    </span>
  )
}
