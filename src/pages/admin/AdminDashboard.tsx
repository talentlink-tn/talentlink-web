import { useEffect, useState } from 'react'
import { Building2, Briefcase, Users2, CheckCircle2 } from 'lucide-react'
import { StatTile } from '@/components/ui/StatTile'
import { getAdminDashboard, type AdminDashboardSummaryRaw } from '@/api/admin'

export function AdminDashboard() {
  const [summary, setSummary] = useState<AdminDashboardSummaryRaw | null>(null)

  useEffect(() => {
    getAdminDashboard().then(setSummary).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary">Vue d'ensemble de la plateforme</h1>
      <p className="text-sm text-text-secondary">Chiffres agrégés sur toutes les entreprises.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Building2 className="size-[18px]" />} value={summary?.companies_total ?? 0} label="Entreprises" tone="blue" />
        <StatTile icon={<Briefcase className="size-[18px]" />} value={summary?.job_offers_total ?? 0} label="Offres au total" tone="green" />
        <StatTile icon={<CheckCircle2 className="size-[18px]" />} value={summary?.job_offers_published ?? 0} label="Offres publiées" tone="purple" />
        <StatTile icon={<Users2 className="size-[18px]" />} value={summary?.candidates_total ?? 0} label="Candidats" tone="orange" />
      </div>

      <div className="mt-7">
        <h2 className="text-base font-bold text-text-primary">Statut des entreprises</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-surface-border bg-white p-4">
            <p className="text-2xl font-extrabold text-orange-600">{summary?.companies_pending ?? 0}</p>
            <p className="text-xs text-text-secondary">En attente de validation</p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white p-4">
            <p className="text-2xl font-extrabold text-green-600">{summary?.companies_active ?? 0}</p>
            <p className="text-xs text-text-secondary">Actives</p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white p-4">
            <p className="text-2xl font-extrabold text-red-600">{summary?.companies_suspended ?? 0}</p>
            <p className="text-xs text-text-secondary">Suspendues</p>
          </div>
        </div>
      </div>
    </div>
  )
}
