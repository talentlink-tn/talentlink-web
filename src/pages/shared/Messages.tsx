import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { resolveUploadUrl } from '@/api/client'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'
import { timeAgoFr } from '@/api/enums'
import { cn } from '@/utils/cn'

const tabs = ['Toutes', 'Non lus'] as const

export function Messages() {
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { conversations, conversationsLoading } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Toutes')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = conversations
    if (tab === 'Non lus') list = list.filter((c) => c.unread_count > 0)
    if (query) list = list.filter((c) => c.counterpart_name.toLowerCase().includes(query.toLowerCase()))
    return [...list].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
  }, [conversations, tab, query])

  const unreadTotal = conversations.filter((c) => c.unread_count > 0).length

  return (
    <div className="pb-6">
      <PageHeader title="Messages" />

      <div className="px-4 pt-4">
        <span className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 size-[18px] text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une conversation…"
            className="h-11 w-full rounded-xl border border-surface-border bg-white pr-4 pl-11 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          />
        </span>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold',
                tab === t ? 'border-brand-blue-500 bg-brand-blue-500 text-white' : 'border-surface-border bg-white text-text-secondary',
              )}
            >
              {t}
              {t === 'Non lus' && unreadTotal > 0 && <span className="ml-1">({unreadTotal})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 divide-y divide-surface-border">
        {conversationsLoading && filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-tertiary">Chargement…</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<MessageSquare className="size-6" />} title="Aucune conversation" description="Vos échanges avec les recruteurs apparaîtront ici." />
        ) : (
          filtered.map((c) => (
            <button
              key={c.application_id}
              onClick={() => navigate(`${basePath}/messages/${c.application_id}`)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted"
            >
              <Avatar
                name={c.counterpart_name}
                src={c.counterpart_avatar_url ? resolveUploadUrl(c.counterpart_avatar_url) : undefined}
                size={48}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-text-primary">{c.counterpart_name}</span>
                  <span className="shrink-0 text-[11px] text-text-tertiary">{timeAgoFr(c.last_message_at)}</span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-text-secondary">{c.last_message_body}</span>
                  {c.unread_count > 0 && (
                    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-brand-blue-500 text-[10px] font-bold text-white">
                      {c.unread_count}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-text-tertiary">{c.job_offer_title}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
