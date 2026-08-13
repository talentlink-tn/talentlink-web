import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Send, Clock, XCircle, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { ApplicationCard } from '@/components/shared/ApplicationCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

const tabs = ['Toutes', 'En cours', 'En attente', 'Refusées'] as const

export function Applications() {
  const navigate = useNavigate()
  const { applications } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Toutes')

  const counts = {
    total: applications.length,
    inProgress: applications.filter((a) => a.status === 'interview' || a.status === 'technical_test' || a.status === 'submitted').length,
    pending: applications.filter((a) => a.status === 'under_review' || a.status === 'decision').length,
    refused: applications.filter((a) => a.status === 'refused').length,
  }

  const filtered = useMemo(() => {
    if (tab === 'Toutes') return applications
    if (tab === 'En cours') return applications.filter((a) => a.status === 'interview' || a.status === 'technical_test' || a.status === 'submitted')
    if (tab === 'En attente') return applications.filter((a) => a.status === 'under_review' || a.status === 'decision')
    return applications.filter((a) => a.status === 'refused')
  }, [applications, tab])

  return (
    <div className="pb-6">
      <PageHeader title="Mes candidatures" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4 lg:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              tab === t ? 'border-brand-blue-500 bg-brand-blue-500 text-white' : 'border-surface-border bg-white text-text-secondary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 lg:px-0">
        <StatTile icon={<FileText className="size-[18px]" />} value={counts.total} label="Candidatures au total" tone="blue" />
        <StatTile icon={<Send className="size-[18px]" />} value={counts.inProgress} label="En cours de traitement" tone="green" />
        <StatTile icon={<Clock className="size-[18px]" />} value={counts.pending} label="En attente de réponse" tone="orange" />
        <StatTile icon={<XCircle className="size-[18px]" />} value={counts.refused} label="Refusées" tone="red" />
      </div>

      <div className="mt-4 px-4 lg:px-0">
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText className="size-6" />} title="Aucune candidature ici" description="Postulez à des offres pour les retrouver dans cet onglet." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-4 mt-6 flex items-center gap-3 rounded-2xl bg-brand-blue-50/60 p-4 lg:mx-0">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue-600">
          <Sparkles className="size-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Conseil pour booster vos candidatures</p>
          <p className="text-xs text-text-secondary">Complétez votre profil et ajoutez plus de compétences.</p>
        </div>
      </div>
      <div className="mx-4 mt-3 lg:mx-0 lg:max-w-xs">
        <Button variant="outline" fullWidth onClick={() => navigate('/app/profile')}>
          Améliorer mon profil
        </Button>
      </div>
    </div>
  )
}
