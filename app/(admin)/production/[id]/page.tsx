import { getConceptById } from '@/lib/data/concepts'
import { getVariantsByConceptId } from '@/lib/data/variants'
import { ProductionFolder } from '@/components/admin/ProductionFolder'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductionDetailPage({ params }: Props) {
  const { id } = await params
  const [concept, variants] = await Promise.all([
    getConceptById(id),
    getVariantsByConceptId(id).catch(() => []),
  ])
  if (!concept) notFound()

  return (
    <div className="min-h-full p-6">
      <ProductionFolder concept={concept} initialVariants={variants} />
    </div>
  )
}
