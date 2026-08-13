import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Phone, MoreVertical } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

export function Conversation() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { conversations, sendMessage, markConversationRead } = useApp()
  const conversation = conversations.find((c) => c.id === conversationId)
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversation) markConversationRead(conversation.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length])

  if (!conversation) return <Navigate to="/app/messages" replace />

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(conversation.id, text.trim())
    setText('')
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-surface-border bg-white/95 px-3 py-2.5 backdrop-blur">
        <button onClick={() => navigate(-1)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted" aria-label="Retour">
          <ChevronLeft className="size-5" />
        </button>
        <Avatar name={conversation.personName} color={conversation.avatarColor} size={38} online={conversation.online} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">{conversation.personName}</p>
          <p className="truncate text-xs text-text-tertiary">{conversation.online ? 'En ligne' : conversation.personRole}</p>
        </div>
        <button className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted">
          <Phone className="size-[18px]" />
        </button>
        <button className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted">
          <MoreVertical className="size-[18px]" />
        </button>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        {conversation.messages.map((m) => (
          <div key={m.id} className={cn('flex', m.author === 'me' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                m.author === 'me' ? 'rounded-br-md bg-brand-gradient text-white' : 'rounded-bl-md bg-surface-muted text-text-primary',
              )}
            >
              {m.text}
              <span className={cn('mt-1 block text-[10px]', m.author === 'me' ? 'text-white/70' : 'text-text-tertiary')}>{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="sticky bottom-0 z-20 flex items-center gap-2 border-t border-surface-border bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrivez un message…"
          className="h-11 flex-1 rounded-full border border-surface-border bg-surface-muted px-4 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send className="size-[18px]" />
        </button>
      </form>
    </div>
  )
}
