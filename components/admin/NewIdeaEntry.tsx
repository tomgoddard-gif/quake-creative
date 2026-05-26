'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Persona } from '@/lib/types'
import { IdeaChatBuilder } from './IdeaChatBuilder'
import { IdeaGenerator } from './IdeaGenerator'
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react'

type Mode = 'chat' | 'generate' | null

interface Props {
  personas: Persona[]
}

export function NewIdeaEntry({ personas }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(null)

  if (mode === 'chat') return <IdeaChatBuilder onBack={() => setMode(null)} />
  if (mode === 'generate') return <IdeaGenerator personas={personas} onBack={() => setMode(null)} />

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/ideas')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ideas
        </button>
      </div>

      <div>
        <h1 className="text-xl font-semibold">New concept</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How do you want to start?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => setMode('chat')}
          className="text-left rounded-2xl border border-border bg-card p-6 hover:border-[var(--quake)]/50 hover:bg-[var(--quake)]/4 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--quake)]/10 group-hover:bg-[var(--quake)]/15 transition-colors">
              <Lightbulb className="h-5 w-5 text-[var(--quake)]" />
            </div>
          </div>
          <h2 className="text-sm font-semibold text-foreground">I have an idea</h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Describe your idea in any form — a feeling, a line, a scenario. Claude will ask a few questions and build it into a structured concept.
          </p>
        </button>

        <button
          onClick={() => setMode('generate')}
          className="text-left rounded-2xl border border-border bg-card p-6 hover:border-[var(--quake)]/50 hover:bg-[var(--quake)]/4 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--quake)]/10 group-hover:bg-[var(--quake)]/15 transition-colors">
              <Sparkles className="h-5 w-5 text-[var(--quake)]" />
            </div>
          </div>
          <h2 className="text-sm font-semibold text-foreground">Generate ideas for me</h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Choose a persona and funnel stage. Claude will generate 5–6 concept ideas based on what it knows about Quake and your existing library.
          </p>
        </button>
      </div>
    </div>
  )
}
