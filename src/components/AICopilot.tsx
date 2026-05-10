import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'
import { chat, type ChatMessage } from '../lib/ai'

type Props = {
  open: boolean
  seed: string | null
  onOpenChange: (open: boolean) => void
}

export function AICopilot({ open, seed, onOpenChange }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const seedHandled = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && seed && seedHandled.current !== seed) {
      seedHandled.current = seed
      send(seed)
    }
  }, [open, seed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const reply = await chat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: '出了点状况，稍后再试。' + (err as Error).message,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="pb-safe absolute inset-x-0 bottom-0 flex h-[88vh] flex-col rounded-t-3xl bg-ink-50 shadow-2xl"
        style={{ animation: 'fadeUp 0.35s ease-out' }}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-ink-50">
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-sm text-ink-900">西湖 · AI 副驾</p>
              <p className="text-[11px] text-ink-400">
                {messages.length === 0 ? '问我此刻该去哪' : `已聊 ${messages.length} 条`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 active:bg-ink-200"
          >
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          {messages.length === 0 && !loading && <Suggestions onPick={send} />}
          <div className="space-y-4">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <Loader2 size={14} className="animate-spin" />
                正在想…
              </div>
            )}
          </div>
        </div>

        <Composer value={input} onChange={setInput} onSend={() => send(input)} />
      </div>
    </div>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-ink-900 text-ink-50'
            : 'rounded-bl-md border border-ink-200 bg-white text-ink-900'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

function Suggestions({ onPick }: { onPick: (text: string) => void }) {
  const items = [
    '现在去西湖，最值得做的一件事是什么？',
    '我只有两小时，怎么走最不亏？',
    '湖边吃饭，本地人会去哪三家？',
    '讲一个我没听过的西湖故事。',
  ]
  return (
    <div>
      <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-400">
        try asking
      </p>
      <div className="space-y-2">
        {items.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="block w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm text-ink-800 active:bg-ink-100"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function Composer({
  value,
  onChange,
  onSend,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}) {
  return (
    <div className="border-t border-ink-200 bg-ink-50 px-4 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          rows={1}
          placeholder="问点什么 ……"
          className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-ink-50 disabled:opacity-30"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

export function AICopilotFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pb-safe fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-ink-50 shadow-lg shadow-ink-900/20 active:scale-95"
      aria-label="打开 AI 副驾"
    >
      <Sparkles size={20} />
    </button>
  )
}
