import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, MessageCircle, Eye, Star, Bell, Mail, Gift, CheckCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import type { NotificationItem } from '@/types'

const iconMap: Record<string, typeof Bell> = {
  'check-circle': CheckCircle2,
  'message-circle': MessageCircle,
  eye: Eye,
  star: Star,
  bell: Bell,
  mail: Mail,
  gift: Gift,
}

const toneMap: Record<NotificationItem['category'], string> = {
  application: 'bg-green-50 text-green-600',
  message: 'bg-blue-50 text-blue-600',
  offer: 'bg-orange-50 text-orange-600',
  system: 'bg-purple-50 text-purple-600',
}

const tabs = ['Toutes', 'Candidatures', 'Messages', 'Offres', 'Système'] as const
const tabToCategory: Record<(typeof tabs)[number], NotificationItem['category'] | null> = {
  Toutes: null,
  Candidatures: 'application',
  Messages: 'message',
  Offres: 'offer',
  Système: 'system',
}

export function Notifications() {
  const navigate = useNavigate()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Toutes')

  const category = tabToCategory[tab]
  const filtered = category ? notifications.filter((n) => n.category === category) : notifications

  const handleClick = (n: NotificationItem) => {
    markNotificationRead(n.id)
    if (n.href) navigate(n.href)
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Notifications"
        action={
          <button onClick={markAllNotificationsRead} className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted" aria-label="Tout marquer comme lu">
            <CheckCheck className="size-[18px]" />
          </button>
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
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
          </button>
        ))}
      </div>

      <div className="mt-2 divide-y divide-surface-border">
        {filtered.length === 0 ? (
          <EmptyState icon={<Bell className="size-6" />} title="Aucune notification" description="Vous êtes à jour !" />
        ) : (
          filtered.map((n) => {
            const Icon = iconMap[n.icon] ?? Bell
            return (
              <button key={n.id} onClick={() => handleClick(n)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-muted">
                <span className="mt-2 flex size-2 shrink-0 items-center justify-center">
                  {!n.read && <span className="size-2 rounded-full bg-brand-blue-500" />}
                </span>
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', toneMap[n.category])}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className={cn('text-sm', n.read ? 'font-medium text-text-primary' : 'font-bold text-text-primary')}>{n.title}</span>
                    <span className="shrink-0 text-[11px] text-text-tertiary">{n.time}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-text-secondary">{n.description}</span>
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
