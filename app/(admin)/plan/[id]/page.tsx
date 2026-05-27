import { notFound } from 'next/navigation'
import { getConceptById } from '@/lib/data/plans'
import { getHooks } from '@/lib/data/hooks-data'
import { getBriefs } from '@/lib/data/briefs-data'
import { PlanFlow } from '@/components/admin/PlanFlow'

export default async function PlanSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const concept = await getConceptById(id)
  if (!concept) notFound()

  const [hooks, briefs] = await Promise.all([
    getHooks(id),
    getBriefs(id),
  ])

  return (
    <PlanFlow
      concept={concept}
      initialHooks={hooks}
      initialBriefs={briefs}
    />
  )
}
