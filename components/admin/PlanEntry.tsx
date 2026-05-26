'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createConceptAction } from '@/app/actions/plan'
import { quakeConfig } from '@/lib/client-config/quake'
import { MessageSquare, Lightbulb, Users, ChevronRight, X } from 'lucide-react'
import type { EntryPoint } from '@/lib/types'

type Step = 'entry' | 'icp' | 'idea_seed'

const ENTRY_OPTIONS: Array<{
  id: EntryPoint
  icon: React.ElementType
  label: string
  description: string
}> = [
  {
    id: 'guided',
    icon: MessageSquare,
    label: 'Guided',
    description: 'Answer questions and develop an insight together through conversation.',
  },
  {
    id: 'icp_first',
    icon: Users,
    label: 'ICP-first',
    description: 'Pick a customer profile and get 2–3 ready-made angles to choose from.',
  },
  {
    id: 'idea_first',
    icon: Lightbulb,
    label: 'Idea-first',
    description: 'Start with a rough idea and let AI sharpen it into a concept.',
  },
]

const TOURIST_ICPS = ['tourist_family', 'tourist_older_couple', 'tourist_young_couple']

export function PlanEntry() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('entry')
  const [entryPoint, setEntryPoint] = useState<EntryPoint | null>(null)
  const [selectedIcp, setSelectedIcp] = useState<string | null>(null)
  const [ideaSeed, setIdeaSeed] = useState('')
  const [loading, setLoading] = useState(false)

  async function proceed(icpId: string, seed?: string) {
    if (!entryPoint) return
    setLoading(true)
    try {
      await createConceptAction({
        icp_id: icpId,
        entry_point: entryPoint,
        idea_seed: seed,
      })
    } catch {
      setLoading(false)
    }
  }

  if (step === 'entry') {
    return (
      <div className="space-y-3">
        {ENTRY_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => {
              setEntryPoint(opt.id)
              setStep('icp')
            }}
            className="w-full flex items-start gap-4 rounded-xl border border-border bg-card/50 px-5 py-4 text-left transition-colors hover:border-[var(--quake)]/40 hover:bg-card group"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--quake)]/10 group-hover:bg-[var(--quake)]/20 transition-colors">
              <opt.icon className="h-4 w-4 text-[var(--quake)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2 group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>
    )
  }

  if (step === 'icp') {
    const tourists = quakeConfig.icps.filter(i => TOURIST_ICPS.includes(i.id))
    const locals = quakeConfig.icps.filter(i => !TOURIST_ICPS.includes(i.id))

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Choose ICP</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Who is this concept for?</p>
          </div>
          <button
            onClick={() => setStep('entry')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Back
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">Tourists</p>
            <div className="space-y-2">
              {tourists.map(icp => (
                <IcpButton
                  key={icp.id}
                  name={icp.name}
                  description={icp.description}
                  selected={selectedIcp === icp.id}
                  loading={loading && selectedIcp === icp.id}
                  onClick={() => {
                    setSelectedIcp(icp.id)
                    if (entryPoint === 'idea_first') {
                      setStep('idea_seed')
                    } else {
                      proceed(icp.id)
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">Locals</p>
            <div className="space-y-2">
              {locals.map(icp => (
                <IcpButton
                  key={icp.id}
                  name={icp.name}
                  description={icp.description}
                  selected={selectedIcp === icp.id}
                  loading={loading && selectedIcp === icp.id}
                  onClick={() => {
                    setSelectedIcp(icp.id)
                    if (entryPoint === 'idea_first') {
                      setStep('idea_seed')
                    } else {
                      proceed(icp.id)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'idea_seed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Your idea</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Describe your rough idea — even a half-formed thought is enough.</p>
          </div>
          <button
            onClick={() => setStep('icp')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Back
          </button>
        </div>
        <textarea
          value={ideaSeed}
          onChange={e => setIdeaSeed(e.target.value)}
          placeholder="e.g. Something about locals who've never actually been to Quake even though they live in Lisbon…"
          className="w-full h-32 resize-none rounded-xl border border-border bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40"
        />
        <button
          disabled={!ideaSeed.trim() || loading}
          onClick={() => selectedIcp && proceed(selectedIcp, ideaSeed)}
          className="w-full rounded-lg bg-[var(--quake)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Starting…' : 'Start session →'}
        </button>
      </div>
    )
  }

  return null
}

function IcpButton({
  name,
  description,
  selected,
  loading,
  onClick,
}: {
  name: string
  description: string
  selected: boolean
  loading: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
        selected
          ? 'border-[var(--quake)]/60 bg-[var(--quake)]/5'
          : 'border-border bg-card/50 hover:border-border/80 hover:bg-card'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      {loading && (
        <div className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--quake)] border-t-transparent" />
      )}
    </button>
  )
}
