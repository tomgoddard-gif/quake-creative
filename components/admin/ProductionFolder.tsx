'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Concept, CreativeVariant } from '@/lib/types'
import { createVariant, updateVariant, deleteVariant } from '@/app/actions/variants'
import { updateConcept } from '@/app/actions/ideas'
import { HOOK_TYPES, CAMPAIGN_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  X,
  Pencil,
  FolderDot,
} from 'lucide-react'

const FORMATS = ['Meta Reels', 'Meta Feed (4:5)', 'TikTok', 'YouTube Skippable', 'YouTube Bumper', 'Google Display', 'Static Image']
const PLATFORMS = ['Meta', 'TikTok', 'Google', 'YouTube']
const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
]
const STATUSES = ['idea', 'briefed', 'in_production', 'live', 'paused', 'retired'] as const

interface Props {
  concept: Concept
  initialVariants: CreativeVariant[]
}

interface VForm {
  hook_type: string
  hook_line: string
  hook_text_overlay: string
  format: string
  platform: string
  duration_seconds: string
  language: string
  notes: string
}

function empty(): VForm {
  return { hook_type: '', hook_line: '', hook_text_overlay: '', format: '', platform: '', duration_seconds: '', language: 'en', notes: '' }
}

export function ProductionFolder({ concept, initialVariants }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const variants = initialVariants
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<VForm>(empty())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<VForm>(empty())
  const [status, setStatus] = useState(concept.status)
  const [notes, setNotes] = useState(concept.notes ?? '')
  const [editingNotes, setEditingNotes] = useState(false)

  function upAdd(k: string, v: string) { setAddForm(f => ({ ...f, [k]: v })) }
  function upEdit(k: string, v: string) { setEditForm(f => ({ ...f, [k]: v })) }

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

  async function handleAdd() {
    startTransition(async () => {
      await createVariant({
        concept_id: concept.id,
        hook_type: addForm.hook_type,
        hook_line: addForm.hook_line,
        hook_text_overlay: addForm.hook_text_overlay,
        format: addForm.format,
        platform: addForm.platform,
        duration_seconds: addForm.duration_seconds ? parseInt(addForm.duration_seconds) : null,
        language: addForm.language,
        notes: addForm.notes,
      })
      router.refresh()
      setShowAdd(false)
      setAddForm(empty())
    })
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      await updateVariant(id, concept.id, {
        hook_type: editForm.hook_type || undefined,
        hook_line: editForm.hook_line || undefined,
        hook_text_overlay: editForm.hook_text_overlay || undefined,
        format: editForm.format || undefined,
        platform: editForm.platform || undefined,
        duration_seconds: editForm.duration_seconds ? parseInt(editForm.duration_seconds) : null,
        language: editForm.language || undefined,
        notes: editForm.notes || undefined,
      })
      router.refresh()
      setEditingId(null)
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this variant?')) return
    startTransition(async () => {
      await deleteVariant(id, concept.id)
      router.refresh()
    })
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus as typeof status)
    startTransition(async () => {
      await updateConcept(concept.id, { status: newStatus })
    })
  }

  async function handleSaveNotes() {
    startTransition(async () => {
      await updateConcept(concept.id, { notes })
      setEditingNotes(false)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push('/production')} className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Production
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-foreground font-medium">{concept.id}</span>
      </div>

      {/* Folder header */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <FolderDot className="h-6 w-6 text-[var(--quake)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-snug">{concept.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="font-mono text-xs font-bold text-[var(--quake)]">{concept.id}</span>
                {concept.persona?.name && (
                  <>
                    <span>·</span>
                    <span>{concept.persona.name}</span>
                  </>
                )}
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
                {concept.test_axis && (
                  <>
                    <span>·</span>
                    <span>{concept.test_axis}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div className="shrink-0">
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium cursor-pointer focus:outline-none',
                STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground border-border',
              )}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brief notes */}
        <div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isPending}
                  className="flex items-center gap-1 rounded-lg bg-[var(--quake)] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                >
                  <Check className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={() => setEditingNotes(false)}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="w-full text-left text-sm text-muted-foreground hover:text-foreground group"
            >
              {notes ? (
                <span className="flex items-start gap-2">
                  <span className="flex-1 leading-relaxed">{notes}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
                </span>
              ) : (
                <span className="flex items-center gap-1.5 italic text-xs">
                  <Pencil className="h-3 w-3" />
                  Add brief notes, key message, CTA, visual direction…
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Variants section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Creative variants
            <span className="ml-2 text-muted-foreground font-normal text-xs">
              {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
            </span>
          </h2>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null) }}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--quake)]/40 px-3 py-1.5 text-xs font-medium text-[var(--quake)] hover:bg-[var(--quake)]/8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add variant
          </button>
        </div>

        {variants.length === 0 && !showAdd && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No variants yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Each variant is a specific hook + format + language combination.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--quake)]/40 px-3 py-1.5 text-xs font-medium text-[var(--quake)] hover:bg-[var(--quake)]/8"
            >
              <Plus className="h-3.5 w-3.5" />
              Add first variant
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {variants.map(v => (
            <div key={v.id} className="rounded-xl border border-border bg-card">
              {editingId === v.id ? (
                <div className="p-4 space-y-3">
                  <InlineVariantForm form={editForm} update={upEdit} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(v.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 rounded-lg bg-[var(--quake)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5 min-w-0">
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
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground uppercase font-medium">
                        {v.language}
                      </span>
                      {v.duration_seconds && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {v.duration_seconds}s
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => startEdit(v)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={isPending}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {v.hook_line && (
                    <p className="mt-2.5 text-sm font-medium leading-snug">{v.hook_line}</p>
                  )}
                  {v.hook_text_overlay && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="text-muted-foreground/60">Text:</span> {v.hook_text_overlay}
                    </p>
                  )}
                  {v.notes && (
                    <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{v.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {showAdd && (
            <div className="rounded-xl border border-[var(--quake)]/30 bg-[var(--quake)]/5 p-4 space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--quake)]">New variant</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <InlineVariantForm form={addForm} update={upAdd} />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex items-center gap-1 rounded-lg bg-[var(--quake)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
                <button
                  onClick={() => { setShowAdd(false); setAddForm(empty()) }}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InlineVariantForm({ form, update }: { form: VForm; update: (k: string, v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hook type</label>
        <select
          value={form.hook_type}
          onChange={e => update('hook_type', e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
        >
          <option value="">— select —</option>
          {HOOK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Format</label>
        <select
          value={form.format}
          onChange={e => update('format', e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
        >
          <option value="">— select —</option>
          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Platform</label>
        <select
          value={form.platform}
          onChange={e => update('platform', e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
        >
          <option value="">— select —</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="col-span-2 sm:col-span-3 space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hook line (audio)</label>
        <input
          value={form.hook_line}
          onChange={e => update('hook_line', e.target.value)}
          placeholder="e.g. You've been walking past it for three days."
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="col-span-2 sm:col-span-3 space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Text overlay</label>
        <input
          value={form.hook_text_overlay}
          onChange={e => update('hook_text_overlay', e.target.value)}
          placeholder="e.g. You've walked past it every day."
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Language</label>
        <div className="flex gap-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => update('language', l.code)}
              className={cn(
                'flex-1 rounded py-1.5 text-xs font-medium transition-colors',
                form.language === l.code
                  ? 'bg-[var(--quake)] text-white'
                  : 'border border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Duration (s)</label>
        <input
          type="number"
          value={form.duration_seconds}
          onChange={e => update('duration_seconds', e.target.value)}
          placeholder="30"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="col-span-2 sm:col-span-3 space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
        <input
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Shot description, talent, overlays…"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  )
}
