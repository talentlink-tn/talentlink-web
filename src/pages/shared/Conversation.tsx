import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { resolveUploadUrl, getAuthToken } from '@/api/client'
import { listApplicationMessages, markApplicationMessagesRead, sendApplicationMessage, type MessageRaw } from '@/api/messages'
import { timeAgoFr } from '@/api/enums'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'
import { cn } from '@/utils/cn'

// applicationId, not a separate "conversation id" — there's one
// conversation per application (see the backend's messaging module),
// route param name kept as :conversationId for URL stability.
export function Conversation() {
  const { conversationId: applicationId } = useParams()
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { conversations, refreshConversations } = useApp()
  const conversation = conversations.find((c) => c.application_id === applicationId)
  const isCompany = getAuthToken()?.kind === 'company'

  const [messages, setMessages] = useState<MessageRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!applicationId) return
    let cancelled = false
    setLoading(true)
    listApplicationMessages(applicationId)
      .then((raw) => !cancelled && setMessages(raw))
      .finally(() => !cancelled && setLoading(false))
    markApplicationMessagesRead(applicationId).then(() => void refreshConversations())
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!applicationId) return <Navigate to={`${basePath}/messages`} replace />

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setText('')
    try {
      const message = await sendApplicationMessage(applicationId, body)
      setMessages((current) => [...current, message])
      void refreshConversations()
    } finally {
      setSending(false)
    }
  }

  const mySenderType = isCompany ? 'recruiter' : 'candidate'
  const headerName = conversation?.counterpart_name ?? '…'
  const headerAvatar = conversation?.counterpart_avatar_url ? resolveUploadUrl(conversation.counterpart_avatar_url) : undefined

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-surface-border bg-white/95 px-3 py-2.5 backdrop-blur">
        <button onClick={() => navigate(-1)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted" aria-label="Retour">
          <ChevronLeft className="size-5" />
        </button>
        <Avatar name={headerName} src={headerAvatar} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">{headerName}</p>
          {conversation && <p className="truncate text-xs text-text-tertiary">{conversation.job_offer_title}</p>}
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        {loading && messages.length === 0 && <p className="py-12 text-center text-sm text-text-tertiary">Chargement…</p>}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.sender_type === mySenderType ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                m.sender_type === mySenderType
                  ? 'rounded-br-md bg-brand-gradient text-white'
                  : 'rounded-bl-md bg-surface-muted text-text-primary',
              )}
            >
              {m.body}
              <span className={cn('mt-1 block text-[10px]', m.sender_type === mySenderType ? 'text-white/70' : 'text-text-tertiary')}>
                {timeAgoFr(m.created_at)}
              </span>
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
          disabled={!text.trim() || sending}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send className="size-[18px]" />
        </button>
      </form>
    </div>
  )
}
