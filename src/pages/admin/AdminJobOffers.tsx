import { useEffect, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { listJobOffersAdmin, restoreJobOfferAdmin, suspendJobOfferAdmin, type JobOfferAdminRaw, type JobOfferStatus } from '@/api/admin'
import { cn } from '@/utils/cn'

const tabs: { label: string; value: JobOfferStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Publiées', value: 'published' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Suspendues', value: 'suspended' },
]

const statusBadge: Record<JobOfferStatus, { label: string; tone: 'gray' | 'green' | 'red' | 'orange' | 'blue' }> = {
  draft: { label: 'Brouillon', tone: 'gray' },
  scheduled: { label: 'Planifiée', tone: 'blue' },
  published: { label: 'Publiée', tone: 'green' },
  closed: { label: 'Clôturée', tone: 'orange' },
  archived: { label: 'Archivée', tone: 'gray' },
  suspended: { label: 'Suspendue', tone: 'red' },
}

export function AdminJobOffers() {
  const [tab, setTab] = useState<JobOfferStatus | 'all'>('all')
  const [offers, setOffers] = useState<JobOfferAdminRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = () => {
    setLoading(true)
    listJobOffersAdmin(tab === 'all' ? undefined : tab)
      .then(setOffers)
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [tab])

  const runAction = async (action: () => Promise<unknown>, id: string) => {
    setBusyId(id)
    try {
      await action()
      refresh()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary">Offres d'emploi</h1>
      <p className="text-sm text-text-secondary">Modération des offres publiées sur la plateforme.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold',
              tab === t.value ? 'border-brand-blue-500 bg-brand-blue-500 text-white' : 'border-surface-border bg-white text-text-secondary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {loading ? (
          <p className="py-8 text-center text-sm text-text-tertiary">Chargement…</p>
        ) : offers.length === 0 ? (
          <EmptyState icon={<Briefcase className="size-6" />} title="Aucune offre" description="Aucune offre ne correspond à ce filtre." />
        ) : (
          offers.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-text-primary">{o.title}</span>
                  <Badge tone={statusBadge[o.status].tone}>{statusBadge[o.status].label}</Badge>
                </div>
                <p className="truncate text-xs text-text-tertiary">{o.company_name} · {o.location}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {o.status === 'published' && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={busyId === o.id}
                    onClick={() => {
                      const reason = window.prompt('Motif de la suspension (affiché au recruteur) :')
                      if (reason) runAction(() => suspendJobOfferAdmin(o.id, reason), o.id)
                    }}
                  >
                    Suspendre
                  </Button>
                )}
                {o.status === 'suspended' && (
                  <Button size="sm" loading={busyId === o.id} onClick={() => runAction(() => restoreJobOfferAdmin(o.id), o.id)}>
                    Remettre en brouillon
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
