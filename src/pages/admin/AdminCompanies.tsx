import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  approveCompany,
  listCompanies,
  reactivateCompany,
  suspendCompany,
  type CompanyAdminRaw,
  type CompanyStatus,
} from '@/api/admin'
import { cn } from '@/utils/cn'

const tabs: { label: string; value: CompanyStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Actives', value: 'active' },
  { label: 'Suspendues', value: 'suspended' },
]

const statusBadge: Record<CompanyStatus, { label: string; tone: 'orange' | 'green' | 'red' }> = {
  pending: { label: 'En attente', tone: 'orange' },
  active: { label: 'Active', tone: 'green' },
  suspended: { label: 'Suspendue', tone: 'red' },
}

export function AdminCompanies() {
  const [tab, setTab] = useState<CompanyStatus | 'all'>('all')
  const [companies, setCompanies] = useState<CompanyAdminRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = () => {
    setLoading(true)
    listCompanies(tab === 'all' ? undefined : tab)
      .then(setCompanies)
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
      <h1 className="text-xl font-extrabold text-text-primary">Entreprises</h1>
      <p className="text-sm text-text-secondary">Validation des nouvelles inscriptions et suspension de comptes.</p>

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
        ) : companies.length === 0 ? (
          <EmptyState icon={<Building2 className="size-6" />} title="Aucune entreprise" description="Aucune entreprise ne correspond à ce filtre." />
        ) : (
          companies.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-text-primary">{c.name}</span>
                  <Badge tone={statusBadge[c.status].tone}>{statusBadge[c.status].label}</Badge>
                </div>
                <p className="truncate text-xs text-text-tertiary">{c.slug}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {c.status === 'pending' && (
                  <Button size="sm" loading={busyId === c.id} onClick={() => runAction(() => approveCompany(c.id), c.id)}>
                    Approuver
                  </Button>
                )}
                {c.status !== 'suspended' && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={busyId === c.id}
                    onClick={() => {
                      const reason = window.prompt('Motif de la suspension (affiché au recruteur) :')
                      if (reason) runAction(() => suspendCompany(c.id, reason), c.id)
                    }}
                  >
                    Suspendre
                  </Button>
                )}
                {c.status === 'suspended' && (
                  <Button size="sm" loading={busyId === c.id} onClick={() => runAction(() => reactivateCompany(c.id), c.id)}>
                    Réactiver
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
