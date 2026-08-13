import { useEffect, useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { BadgeCheck, MapPin, Share2, Users, Building2, Calendar, Globe } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { JobCard } from '@/components/shared/JobCard'
import { Button } from '@/components/ui/Button'
import { getCompany } from '@/data/companies'
import { getRecommendedJobs } from '@/api/candidates'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import type { Job } from '@/types'

const tabs = ['À propos', 'Offres', 'Avis'] as const

export function CompanyProfile() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('À propos')
  const company = getCompany(companyId ?? '')
  const [companyJobs, setCompanyJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!company) return
    // No "get company's published offers by id" endpoint reachable from
    // a candidate session — reuse the recommended-jobs list (spans every
    // company already) and filter, rather than a dedicated fetch.
    getRecommendedJobs(100)
      .then((all) => setCompanyJobs(all.filter((j) => j.companyId === company.id)))
      .catch(() => {})
  }, [company])

  if (!company) return <Navigate to="/app/jobs" replace />

  return (
    <div className="pb-6">
      <PageHeader
        title="Entreprise"
        action={
          <button onClick={() => showToast('Lien copié !')} className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted" aria-label="Partager">
            <Share2 className="size-[18px]" />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-surface-border bg-white p-4">
          <div className="flex items-start gap-3.5">
            <CompanyLogo name={company.logo} color={company.logoColor} size={60} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-lg font-extrabold text-text-primary">{company.name}</h1>
                <BadgeCheck className="size-4 shrink-0 text-brand-blue-500" />
              </div>
              {company.sector && <p className="text-sm text-text-secondary">{company.sector}</p>}
              {company.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-text-tertiary">
                  <MapPin className="size-3.5" /> {company.location}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cn('mt-3 grid gap-2.5 text-center', company.founded ? 'grid-cols-3' : 'grid-cols-1')}>
          <MiniStat icon={Users} value={`${companyJobs.length}`} label="Offres" />
          {company.founded && <MiniStat icon={Building2} value={`${company.agencies ?? 1}`} label="Agences" />}
          {company.founded && <MiniStat icon={Calendar} value={company.founded} label="Depuis" />}
        </div>
      </div>

      <div className="no-scrollbar mt-5 flex gap-5 border-b border-surface-border px-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('relative shrink-0 pb-3 text-sm font-semibold', tab === t ? 'text-brand-blue-600' : 'text-text-tertiary')}
          >
            {t}
            {t === 'Offres' && <span className="ml-1">({companyJobs.length})</span>}
            {t === 'Avis' && <span className="ml-1">(24)</span>}
            {tab === t && <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-brand-blue-600" />}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {tab === 'À propos' && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              {company.about || 'Cette entreprise n’a pas encore ajouté de description.'}
            </p>
            {(company.sector || company.size || company.website) && (
              <div className="space-y-2 rounded-2xl border border-surface-border bg-white p-4">
                {company.sector && <InfoRow icon={Building2} label="Secteur" value={company.sector} />}
                {company.size && <InfoRow icon={Users} label="Taille" value={company.size} />}
                {company.website && <InfoRow icon={Globe} label="Site web" value={company.website} />}
              </div>
            )}
            <Button fullWidth onClick={() => setTab('Offres')}>
              Voir les offres
            </Button>
          </div>
        )}

        {tab === 'Offres' && (
          <div className="space-y-3">
            {companyJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-tertiary">Aucune offre active pour le moment.</p>
            ) : (
              companyJobs.map((j) => <JobCard key={j.id} job={j} />)
            )}
          </div>
        )}

        {tab === 'Avis' && (
          <div className="space-y-3">
            {[
              { name: 'Sami R.', note: 5, text: 'Une entreprise sérieuse avec de belles perspectives d’évolution.' },
              { name: 'Yosra B.', note: 4, text: 'Process de recrutement clair et rapide.' },
            ].map((r) => (
              <div key={r.name} className="rounded-xl border border-surface-border bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{r.name}</span>
                  <span className="text-xs font-semibold text-amber-500">{'★'.repeat(r.note)}</span>
                </div>
                <p className="mt-1.5 text-sm text-text-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 px-4">
        <Button variant="ghost" fullWidth onClick={() => navigate('/app/jobs')}>
          Retour aux offres
        </Button>
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white py-3">
      <Icon className="mx-auto mb-1 size-4 text-brand-blue-500" />
      <p className="text-sm font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-tertiary">{label}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-text-tertiary" />
      <span className="flex-1 text-sm text-text-secondary">{label}</span>
      <span className="truncate text-sm font-semibold text-text-primary">{value}</span>
    </div>
  )
}
