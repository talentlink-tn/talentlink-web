import { useEffect, useState } from 'react'
import { StatTile } from '@/components/ui/StatTile'
import { Users, Briefcase, Clock, TrendingUp } from 'lucide-react'
import { getDashboardSummary, type DashboardSummaryRaw } from '@/api/companies'

// No backend module tracks month-over-month history or acquisition
// channel (LinkedIn/site carrière/recommandation) — see this repo's
// README decisions log. These two charts stay illustrative; the
// headline tiles and the funnel below use real data.
const monthly = [
  { label: 'Fév', value: 62 },
  { label: 'Mar', value: 78 },
  { label: 'Avr', value: 54 },
  { label: 'Mai', value: 91 },
  { label: 'Juin', value: 70 },
  { label: 'Juil', value: 85 },
]

const sources = [
  { label: 'Talent Link', value: 46, color: 'bg-brand-blue-500' },
  { label: 'LinkedIn', value: 28, color: 'bg-brand-teal-500' },
  { label: 'Site carrière', value: 16, color: 'bg-brand-green-500' },
  { label: 'Recommandation', value: 10, color: 'bg-purple-500' },
]

export function Statistics() {
  const [summary, setSummary] = useState<DashboardSummaryRaw | null>(null)
  const maxMonthly = Math.max(...monthly.map((m) => m.value))

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => {
        // Headline tiles/funnel just show 0s if the summary fails to load.
      })
  }, [])

  const byStatus = summary?.applications_by_status ?? {}
  const funnel = [
    { label: 'Candidatures reçues', value: byStatus.received ?? 0 },
    { label: 'Présélectionnées', value: (byStatus.ai_screening ?? 0) + (byStatus.shortlisted ?? 0) },
    { label: 'Entretiens', value: (byStatus.hr_interview ?? 0) + (byStatus.technical_interview ?? 0) + (byStatus.test ?? 0) },
    { label: 'Offres envoyées', value: byStatus.offer ?? 0 },
    { label: 'Recrutements', value: byStatus.hired ?? 0 },
  ]
  const maxFunnel = Math.max(funnel[0].value, 1)

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary">Statistiques</h1>
      <p className="text-sm text-text-secondary">Performance de recrutement</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Users className="size-[18px]" />} value={summary?.total_applications ?? 0} label="Candidatures totales" tone="blue" />
        <StatTile icon={<Briefcase className="size-[18px]" />} value={byStatus.hired ?? 0} label="Postes pourvus" tone="green" />
        <StatTile
          icon={<Clock className="size-[18px]" />}
          value={summary?.average_match_score != null ? `${Math.round(summary.average_match_score)}%` : '—'}
          label="Score IA moyen"
          tone="purple"
        />
        <StatTile
          icon={<TrendingUp className="size-[18px]" />}
          value={summary && summary.total_applications > 0 ? `${Math.round(((byStatus.hired ?? 0) / summary.total_applications) * 100)}%` : '—'}
          label="Taux de conversion final"
          tone="orange"
        />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-border bg-white p-5">
          <h2 className="mb-5 text-sm font-bold text-text-primary">Candidatures par mois</h2>
          <div className="flex h-40 justify-between gap-3">
            {monthly.map((m) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-gradient transition-all"
                    style={{ height: `${(m.value / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-text-tertiary">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-text-primary">Sources de candidatures</h2>
          <div className="space-y-3.5">
            {sources.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-text-secondary">{s.label}</span>
                  <span className="font-bold text-text-primary">{s.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-text-primary">Entonnoir de recrutement</h2>
          <div className="space-y-3">
            {funnel.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs font-medium text-text-secondary">{f.label}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-lg bg-surface-muted">
                  <div
                    className="flex h-full items-center rounded-lg bg-brand-gradient px-2.5 text-[11px] font-bold text-white"
                    style={{ width: `${Math.max((f.value / maxFunnel) * 100, f.value > 0 ? 14 : 0)}%` }}
                  >
                    {f.value > 0 && f.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
