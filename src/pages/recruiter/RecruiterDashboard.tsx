import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Users, CalendarCheck, TrendingUp, ChevronRight } from 'lucide-react'
import { StatTile } from '@/components/ui/StatTile'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { getMyCompany, getDashboardSummary, type DashboardSummaryRaw } from '@/api/companies'
import { getAgenda, type InterviewReadRaw } from '@/api/interviews'
import { listApplications, mapApplicationToRecruiterCandidate } from '@/api/applications'
import type { RecruiterCandidate } from '@/types'

const stageTone = { new: 'blue', interview: 'orange', final: 'green' } as const
const stageLabel = { new: 'Nouveau', interview: 'En entretien', final: 'Sélection finale' } as const

export function RecruiterDashboard() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [summary, setSummary] = useState<DashboardSummaryRaw | null>(null)
  const [recentCandidates, setRecentCandidates] = useState<RecruiterCandidate[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<InterviewReadRaw[]>([])

  useEffect(() => {
    getMyCompany().then((c) => setCompanyName(c.name)).catch(() => {})
    getDashboardSummary().then(setSummary).catch(() => {})
    getAgenda().then(setUpcomingInterviews).catch(() => {})
    listApplications({ sort: '-match_score' })
      .then((raw) => setRecentCandidates(raw.slice(0, 5).map(mapApplicationToRecruiterCandidate)))
      .catch(() => {})
  }, [])

  const conversionRate =
    summary && summary.total_applications > 0
      ? Math.round(((summary.applications_by_status.hired ?? 0) / summary.total_applications) * 100)
      : 0

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">Bonjour 👋</h1>
          <p className="text-sm text-text-secondary">{companyName ? `Aperçu de l'activité de ${companyName}.` : 'Voici un aperçu de vos activités RH.'}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Briefcase className="size-[18px]" />} value={summary?.active_job_offers ?? 0} label="Postes ouverts" tone="blue" />
        <StatTile icon={<Users className="size-[18px]" />} value={summary?.total_applications ?? 0} label="Candidatures" tone="green" />
        <StatTile icon={<CalendarCheck className="size-[18px]" />} value={upcomingInterviews.length} label="Entretiens planifiés" tone="purple" />
        <StatTile icon={<TrendingUp className="size-[18px]" />} value={`${conversionRate}%`} label="Taux de conversion" tone="orange" />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Meilleures candidatures</h2>
            <button onClick={() => navigate('/recruiter/candidates')} className="text-sm font-semibold text-brand-blue-600">
              Voir tout
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            {recentCandidates.length === 0 && <p className="py-4 text-center text-xs text-text-tertiary">Aucune candidature pour le moment.</p>}
            {recentCandidates.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate('/recruiter/candidates')}
                className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-3.5 text-left"
              >
                <Avatar name={c.name} color={c.avatarColor} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">{c.name}</span>
                  <span className="block truncate text-xs text-text-secondary">{c.role} · {c.matchScore}% compatibilité</span>
                </span>
                <Badge tone={stageTone[c.stage]}>{stageLabel[c.stage]}</Badge>
                <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Entretiens à venir</h2>
            <button onClick={() => navigate('/recruiter/jobs')} className="text-sm font-semibold text-brand-blue-600">
              Agenda
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            {upcomingInterviews.length === 0 && <p className="py-4 text-center text-xs text-text-tertiary">Aucun entretien planifié.</p>}
            {upcomingInterviews.slice(0, 5).map((iv) => (
              <div key={iv.id} className="rounded-2xl border border-surface-border bg-white p-3.5">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {iv.kind === 'hr' ? 'Entretien RH' : iv.kind === 'technical' ? 'Entretien technique' : iv.kind === 'test' ? 'Test' : 'Entretien'}
                </p>
                <p className="text-xs text-text-secondary">{new Date(iv.scheduled_at).toLocaleString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
