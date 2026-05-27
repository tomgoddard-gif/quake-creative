import { PlanEntry } from '@/components/admin/PlanEntry'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewAnglePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/plan"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to angles
        </Link>
        <h1 className="text-xl font-semibold">New angle</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to develop your creative angle.
        </p>
      </div>
      <PlanEntry />
    </div>
  )
}
