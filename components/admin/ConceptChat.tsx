'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessageAction, sendInitialMessageAction } from '@/app/actions/plan'
import { confirmAngleAction, type AngleDraftFields } from '@/app/actions/angles'
import { Send, CheckCircle, ChevronRight } from 'lucide-react'
import type { Message, Concept } from '@/lib/types'

interface AngleDraft {
  title: string
  angle_narrative: string
  core_message: string
  pain_point: string
  benefit: string
  desired_response: string
  test_axis: string
}

function parseAngleReady(text: string): AngleDraft | null {
  const match = text.match(/\[ANGLE_READY\]([\s\S]*?)\[\/ANGLE_READY\]/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim()) as AngleDraft
  } catch {
    return null
  }
}

function cleanMessageText(text: string): string {
  return text.replace(/\[ANGLE_READY\][\s\S]*?\[\/ANGLE_READY\]/, '').trim()
}

export function ConceptChat({
  concept,
  initialMessages,
}: {
  concept: Concept
  initialMessages: Message[]
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [angleDraft, setAngleDraft] = useState<AngleDraft | null>(null)
  const [confirming, setConfirming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check existing messages for angle ready signal
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        const draft = parseAngleReady(msg.content)
        if (draft) {
          setAngleDraft(draft)
          break
        }
      }
    }
  }, [])

  // Auto-start if no messages yet
  useEffect(() => {
    if (messages.length === 0 && !initializing) {
      setInitializing(true)
      sendInitialMessageAction(concept.id)
        .then(response => {
          const aiMsg: Message = {
            id: Date.now().toString(),
            concept_id: concept.id,
            role: response.role,
            content: response.content,
            created_at: new Date().toISOString(),
          }
          setMessages([aiMsg])
          const draft = parseAngleReady(response.content)
          if (draft) setAngleDraft(draft)
        })
        .catch(console.error)
        .finally(() => setInitializing(false))
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, angleDraft])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      concept_id: concept.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await sendMessageAction(concept.id, text)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        concept_id: concept.id,
        role: 'assistant',
        content: response.content,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      const draft = parseAngleReady(response.content)
      if (draft) setAngleDraft(draft)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleConfirmAngle() {
    if (!angleDraft || !concept.angle_id) return
    setConfirming(true)
    try {
      await confirmAngleAction(concept.angle_id, concept.id, angleDraft as AngleDraftFields)
      router.refresh()
    } catch (err) {
      console.error(err)
      setConfirming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 1 — Angle</p>
        <p className="text-sm font-semibold mt-0.5">Developing the creative angle</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {initializing && messages.length === 0 && (
          <div className="flex gap-3">
            <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--quake)]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--quake)]">AI</span>
            </div>
            <div className="flex-1 rounded-xl bg-card/60 border border-border px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--quake)]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--quake)]">AI</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[var(--quake)]/10 text-foreground ml-auto'
                  : 'bg-card/60 border border-border text-foreground'
              }`}
            >
              {cleanMessageText(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--quake)]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--quake)]">AI</span>
            </div>
            <div className="rounded-xl bg-card/60 border border-border px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Angle Draft Card */}
        {angleDraft && (
          <div className="rounded-xl border border-[var(--quake)]/30 bg-[var(--quake)]/5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--quake)]" />
              <p className="text-sm font-semibold text-[var(--quake)]">Angle ready</p>
              {angleDraft.test_axis && (
                <span className="ml-auto rounded-full border border-[var(--quake)]/30 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--quake)]">
                  {angleDraft.test_axis}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Title</p>
              <p className="text-sm font-semibold mt-0.5">{angleDraft.title}</p>
            </div>

            {/* Angle narrative — prose block */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1.5">Angle narrative</p>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2 border-l-2 border-[var(--quake)]/20 pl-3">
                {angleDraft.angle_narrative.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Core message — highlighted */}
            <div className="rounded-lg bg-[var(--quake)]/10 border border-[var(--quake)]/20 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--quake)]/70 mb-1">Core message</p>
              <p className="text-sm font-semibold leading-snug">{angleDraft.core_message}</p>
            </div>

            {/* Structured fields */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Pain point" value={angleDraft.pain_point} />
              <Field label="Benefit" value={angleDraft.benefit} />
              <Field label="Desired response" value={angleDraft.desired_response} />
            </div>

            <button
              onClick={handleConfirmAngle}
              disabled={confirming || !concept.angle_id}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {confirming ? 'Confirming…' : 'Confirm angle — generate creative package'}
              {!confirming && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || initializing || !!angleDraft}
            placeholder={angleDraft ? 'Angle confirmed — proceed above' : 'Reply…'}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || initializing || !!angleDraft}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--quake)] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/50">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">{value}</p>
    </div>
  )
}
