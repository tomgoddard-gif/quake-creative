'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessageAction, sendInitialMessageAction, confirmConceptAction } from '@/app/actions/plan'
import { Send, CheckCircle, ChevronRight } from 'lucide-react'
import type { Message, Concept } from '@/lib/types'

interface ConceptDraft {
  insight: string
  angle_pain: string
  angle_desire: string
  core_message: string
}

function parseConceptReady(text: string): ConceptDraft | null {
  const match = text.match(/\[CONCEPT_READY\]([\s\S]*?)\[\/CONCEPT_READY\]/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim()) as ConceptDraft
  } catch {
    return null
  }
}

function cleanMessageText(text: string): string {
  // Remove the [CONCEPT_READY]...[/CONCEPT_READY] block from displayed text
  return text.replace(/\[CONCEPT_READY\][\s\S]*?\[\/CONCEPT_READY\]/, '').trim()
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
  const [conceptDraft, setConceptDraft] = useState<ConceptDraft | null>(null)
  const [confirming, setConfirming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check existing messages for concept ready signal
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        const draft = parseConceptReady(msg.content)
        if (draft) {
          setConceptDraft(draft)
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
          const draft = parseConceptReady(response.content)
          if (draft) setConceptDraft(draft)
        })
        .catch(console.error)
        .finally(() => setInitializing(false))
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, conceptDraft])

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
      const draft = parseConceptReady(response.content)
      if (draft) setConceptDraft(draft)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleConfirmConcept() {
    if (!conceptDraft) return
    setConfirming(true)
    try {
      await confirmConceptAction(concept.id, conceptDraft)
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
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage 1 — Concept</p>
        <p className="text-sm font-semibold mt-0.5">Developing the creative concept</p>
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

        {/* Concept Draft Card */}
        {conceptDraft && (
          <div className="rounded-xl border border-[var(--quake)]/30 bg-[var(--quake)]/5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--quake)]" />
              <p className="text-sm font-semibold text-[var(--quake)]">Concept ready</p>
            </div>
            <div className="space-y-3">
              <Field label="Insight" value={conceptDraft.insight} />
              <Field label="Angle — pain" value={conceptDraft.angle_pain} />
              <Field label="Angle — desire" value={conceptDraft.angle_desire} />
              <Field label="Core message" value={conceptDraft.core_message} highlight />
            </div>
            <button
              onClick={handleConfirmConcept}
              disabled={confirming}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--quake)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {confirming ? 'Confirming…' : 'Confirm concept — generate hooks'}
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
            disabled={loading || initializing || !!conceptDraft}
            placeholder={conceptDraft ? 'Concept confirmed — proceed to hooks above' : 'Reply…'}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--quake)]/40 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || initializing || !!conceptDraft}
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

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className={`text-sm mt-0.5 leading-relaxed ${highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
        {value}
      </p>
    </div>
  )
}
