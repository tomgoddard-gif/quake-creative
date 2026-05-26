'use client'

import { useState } from 'react'
import { saveSettingsAction } from '@/app/actions/settings'
import { Check } from 'lucide-react'

export function SettingsForm({
  initialProductKnowledge,
  initialGuardrails,
}: {
  initialProductKnowledge: string
  initialGuardrails: string
}) {
  const [productKnowledge, setProductKnowledge] = useState(initialProductKnowledge)
  const [guardrails, setGuardrails] = useState(initialGuardrails)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveSettingsAction({ product_knowledge: productKnowledge, guardrails })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div>
          <h2 className="text-sm font-semibold">Product knowledge</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            USPs, key features, pricing, what makes Quake different. This is injected into every AI generation.
          </p>
        </div>
        <textarea
          value={productKnowledge}
          onChange={e => setProductKnowledge(e.target.value)}
          rows={12}
          placeholder="Add Quake product knowledge here — USPs, the simulator, RFID wristbands, pricing, location, what makes Quake different from every other museum in Lisbon…"
          className="w-full resize-y rounded-xl border border-border bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40 font-mono leading-relaxed"
        />
      </section>

      <section className="space-y-2 opacity-50 pointer-events-none">
        <div>
          <h2 className="text-sm font-semibold">Creative guardrails</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rules the AI must follow (one per line). Removed for V1.
          </p>
        </div>
        <textarea
          value={guardrails}
          onChange={e => setGuardrails(e.target.value)}
          rows={4}
          placeholder="e.g. Never use the word 'devastating'&#10;Never open with a question"
          className="w-full resize-y rounded-xl border border-border bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40 font-mono"
        />
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : saving ? (
          'Saving…'
        ) : (
          'Save settings'
        )}
      </button>
    </div>
  )
}
