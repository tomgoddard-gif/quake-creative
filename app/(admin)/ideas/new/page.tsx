import { getPersonas } from '@/lib/data/personas'
import { NewIdeaEntry } from '@/components/admin/NewIdeaEntry'

export default async function NewIdeaPage() {
  const personas = await getPersonas()

  return (
    <div className="min-h-full p-6">
      <NewIdeaEntry personas={personas} />
    </div>
  )
}
