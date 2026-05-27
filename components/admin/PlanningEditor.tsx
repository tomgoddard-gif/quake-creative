'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Concept, CreativeVariant } from '@/lib/types'
import { createVariant, updateVariant, deleteVariant } from '@/app/actions/variants'
import { updateConcept } from '@/app/actions/ideas'
import { HOOK_TYPES, CAMPAIGN_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  Save,
  Check,
  FolderOpen,
  X,
  Pencil,
} from 'lucide-react'

const FORMATS = ['Meta Reels', 'Meta Feed (4:5)', 'TikTok', 'YouTube Skippable', 'YouTube Bumper', 'Google Display', 'Static Image']
const PLATFORMS = ['Meta', 'TikTok', 'Google', 'YouTube']
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
]

interface Props {
  concept: Concept
  initialVariants: CreativeVariant[]
}

interface VariantForm {
  hook_type: string
  hook_line: string
  hook_text_overlay: string
  format: string
  platform: string
  duration_seconds: string
  language: string
  notes: string
}

function emptyForm(): VariantForm {
  return {
    hook_type: '',
    hook_line: '',
    hook_text_overlay: '',
    format: '',
    platform: '',
    duration_seconds: '',
    language: 'en',
    notes: '',
  }
}

export function PlanningEditor({ concept, initialVariants }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const variants = initialVariants
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<VariantForm>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<VariantForm>(emptyForm())
  const [notes, setNotes] = useState(concept.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idea = (concept as any).idea

  function updateForm(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }
  function updateEdit(key: string, value: string) {
    setEditForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleAddVariant() {
    if (!form.hook_line.trim() && !form.hook_type) return
    startTransition(async () => {
      const result = await createVariant({
        concept_id: concept.id,
        hook_type: form.hook_type,
        hook_line: form.hook_line,
        hook_text_overlay: form.hook_text_overlay,
        format: form.format,
        platform: form.platform,
        duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
        language: form.language,
        notes: form.notes,
      })
      if (!('error' in result)) {
        router.refresh()
        setShowAddForm(false)
        setForm(emptyForm())
      }
    })
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      const result = await updateVariant(id, concept.id, {
        hook_type: editForm.hook_type || undefined,
        hook_line: editForm.hook_line || undefined,
        hook_text_overlay: editForm.hook_text_overlay || undefined,
        format: editForm.format || undefined,
        platform: editForm.platform || undefined,
        duration_seconds: editForm.duration_seconds ? parseInt(editForm.duration_seconds) : null,
        language: editForm.language || undefined,
        notes: editForm.notes || undefined,
      })
      if (!('error' in result)) {
        router.refresh()
        setEditingId(null)
      }
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteVariant(id, concept.id)
      router.refresh()
    })
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    await updateConcept(concept.id, { notes })
    setSavingNotes(false)
  }

  async function handleMoveToProduction() {
    startTransition(async () => {
      await updateConcept(concept.id, { status: 'in_production' })
      router.push(`/production/${concept.id}`)
    })
  }

  function startEdit(v: CreativeVariant) {
    setEditingId(v.id)
    setEditForm({
      hook_type: v.hook_type ?? '',
      hook_line: v.hook_line ?? '',
      hook_text_overlay: v.hook_text_overlay ?? '',
      format: v.format ?? '',
      platform: v.platform ?? '',
      duration_seconds: v.duration_seconds?.toString() ?? '',
      language: v.language,
      notes: v.notes ?? '',
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push('/planning')} className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Planning
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-foreground font-medium">{concept.id}</span>
      </div>

      {/* Concept header */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{concept.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
              {concept.persona?.name && <span>{concept.persona.name}</span>}
              {concept.campaign && (
                <>
                  <span>·</span>
                  <span>{CAMPAIGN_LABELS[concept.campaign] ?? concept.campaign}</span>
                </>
              )}
              {concept.angle_type && (
                <>
                  <span>·</span>
                  <span>{concept.angle_type}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleMoveToProduction}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--quake)]/40 bg-[var(--quake)]/8 px-3 py-2 text-sm font-medium text-[var(--quake)] transition-colors hover:bg-[var(--quake)]/15 disabled:opacity-60 shrink-0"
          >
            <FolderOpen className="h-4 w-4" />
            Move to production
          </button>
        </div>
      </div>

      {/* Creative ladder summary */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Creative ladder</h2>
        <div className="space-y-2">
          <LadderRow label="Insight" value={idea?.selected_insight} />
          <LadderRow label="Angle" value={idea?.selected_angle} />
          <LadderRow label="Hook" value={idea?.selected_hook} />
          {!idea?.selected_insight && (
            <p className="text-xs text-muted-foreground italic">No ladder data — this concept was seeded directly.</p>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Creative variants
            <span className="ml-2 text-muted-foreground font-normal text-xs">
              ({variants.length} {variants.length === 1 ? 'variant' : 'variants'})
            </span>
          </h2>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null) }}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--quake)]/40 px-3 py-1.5 text-xs font-medium text-[var(--quake)] transition-colors hover:bg-[var(--quake)]/8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add variant
          </button>
        </div>

        {variants.length === 0 && !showAddForm && (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">No variants yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add variants for each hook, format, and language combination.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--quake)]/40 px-3 py-1.5 text-xs font-medium text-[var(--quake)] hover:bg-[var(--quake)]/8"
            >
              <Plus className="h-3.5 w-3.5" />
              Add first variant
            </button>
          </div>
        )}

        {variants.map(v => (
          <div key={v.id} className="rounded-xl border border-border bg-card">
            {editingId === v.id ? (
              <div className="p-4 space-y-3">
                <VariantFormFields form={editForm} update={updateEdit} />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSaveEdit(v.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center min-w-0">
                    {v.hook_type && (
                      <span className="rounded-md bg-[var(--quake)]/10 px-1.5 py-0.5 text-[11px] font-medium text-[var(--quake)]">
                        {v.hook_type}
                      </span>
                    )}
                    {v.format && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {v.format}
                      </span>
                    )}
                    {v.platform && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {v.platform}
                      </span>
                    )}
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground uppercase">
                      {v.language}
                    </span>
                    {v.duration_seconds && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {v.duration_seconds}s
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(v)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={isPending}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {v.hook_line && (
                  <p className="mt-2 text-sm font-medium leading-snug">{v.hook_line}</p>
                )}
                {v.hook_text_overlay && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">Text overlay:</span> {v.hook_text_overlay}
                  </p>
                )}
                {v.notes && (
                  <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{v.notes}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add form */}
        {showAddForm && (
          <div className="rounded-xl border border-[var(--quake)]/30 bg-[var(--quake)]/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--quake)]">New variant</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <VariantFormFields form={form} update={updateForm} />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddVariant}
                disabled={isPending || (!form.hook_line.trim() && !form.hook_type)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--quake)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Add variant
              </button>
              <button
                onClick={() => { setShowAddForm(false); setForm(emptyForm()) }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Brief notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Key message, CTA, visual direction, production notes…"
          rows={4}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Save className="h-3.5 w-3.5" />
          {savingNotes ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}

function VariantFormFields({
  form,
  update,
}: {
  form: { hook_type: string; hook_line: string; hook_text_overlay: string; format: string; platform: string; duration_seconds: string; language: string; notes: string }
  update: (key: string, value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Hook type</label>
        <select
          value={form.hook_type}
          onChange={e => update('hook_type', e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          <option value="">— select —</option>
          {HOOK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Format</label>
        <select
          value={form.format}
          onChange={e => update('format', e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          <option value="">— select —</option>
          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Hook line (audio)</label>
        <input
          value={form.hook_line}
          onChange={e => update('hook_line', e.target.value)}
          placeholder="e.g. You've been walking past it for three days."
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Text overlay (silent scroll)</label>
        <input
          value={form.hook_text_overlay}
          onChange={e => update('hook_text_overlay', e.target.value)}
          placeholder="e.g. You've walked past it every day."
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Platform</label>
        <select
          value={form.platform}
          onChange={e => update('platform', e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          <option value="">— select —</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
        <input
          type="number"
          value={form.duration_seconds}
          onChange={e => update('duration_seconds', e.target.value)}
          placeholder="30"
          min={1}
          max={300}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Language</label>
        <select
          value={form.language}
          onChange={e => update('language', e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Notes</label>
        <input
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Shot description, talent notes, overlays…"
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>
    </div>
  )
}

function LadderRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 w-16 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-foreground leading-snug">{value}</span>
    </div>
  )
}
