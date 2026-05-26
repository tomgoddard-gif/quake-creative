import { PlanEntry } from '@/components/admin/PlanEntry'

export default function PlanPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Plan a concept</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build a paid ad concept from insight to brief — choose how you want to start.
        </p>
      </div>
      <PlanEntry />
    </div>
  )
}
