import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Briefcase, Bookmark, Building2, Bell } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatTile } from '@/components/ui/StatTile'
import { JobCard } from '@/components/shared/JobCard'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { getRecommendedJobs } from '@/api/candidates'
import { getMyCandidateProfile, type CandidateProfileRaw } from '@/api/candidates'
import { resolveUploadUrl } from '@/api/client'
import { getCompany } from '@/data/companies'
import { useApp } from '@/context/AppContext'
import type { Job } from '@/types'

export function Dashboard() {
  const navigate = useNavigate()
  const { applications, favorites } = useApp()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<CandidateProfileRaw | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getRecommendedJobs(20), getMyCandidateProfile()])
      .then(([recommended, myProfile]) => {
        if (cancelled) return
        setJobs(recommended)
        setProfile(myProfile)
      })
      .catch(() => {
        // A dashboard that fails to load recommendations just shows an
        // empty state below rather than crashing the whole screen.
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const recruitingCompanyIds = Array.from(new Set(jobs.map((j) => j.companyId)))
  const firstName = profile?.first_name ?? ''

  return (
    <div className="px-4 pt-4 pb-6 lg:px-0 lg:pt-8">
      <div className="flex items-center gap-3">
        <Avatar name={firstName || '?'} src={profile?.photo_url ? resolveUploadUrl(profile.photo_url) : undefined} size={52} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-text-primary lg:text-2xl">Bonjour{firstName ? `, ${firstName}` : ''} 👋</h1>
          <p className="text-sm text-text-secondary">Prêt pour une nouvelle opportunité ?</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/app/jobs')}
        className="mt-4 flex h-12 w-full items-center gap-2.5 rounded-xl border border-surface-border bg-white px-4 text-left text-sm text-text-tertiary lg:max-w-xl"
      >
        <Search className="size-[18px]" />
        <span className="flex-1">Rechercher un emploi, une compétence, une entreprise…</span>
        <SlidersHorizontal className="size-[18px] text-text-secondary" />
      </button>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary lg:text-lg">Tableau de bord</h2>
        <button onClick={() => navigate('/app/jobs')} className="text-sm font-semibold text-brand-blue-600">
          Voir tout
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={<Briefcase className="size-[18px]" />} value={jobs.length} label="Offres recommandées" tone="blue" />
        <StatTile icon={<Bookmark className="size-[18px]" />} value={applications.length} label="Candidatures envoyées" tone="green" />
        <StatTile icon={<Building2 className="size-[18px]" />} value={recruitingCompanyIds.length} label="Entreprises qui recrutent" tone="purple" />
        <StatTile icon={<Bell className="size-[18px]" />} value={favorites.length} label="Offres enregistrées" tone="orange" />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary lg:text-lg">Offres recommandées</h2>
        <button onClick={() => navigate('/app/jobs')} className="text-sm font-semibold text-brand-blue-600">
          Voir tout
        </button>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="col-span-full py-4 text-center text-sm text-text-tertiary">Chargement…</p>}
        {!loading && jobs.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-text-tertiary">Aucune offre recommandée pour le moment.</p>
        )}
        {jobs.slice(0, 6).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {recruitingCompanyIds.length > 0 && (
        <>
          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary lg:text-lg">Entreprises qui recrutent</h2>
            <button onClick={() => navigate('/app/jobs')} className="text-sm font-semibold text-brand-blue-600">
              Voir tout
            </button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
            {recruitingCompanyIds.map((id) => {
              const c = getCompany(id)
              if (!c) return null
              return (
                <button key={id} onClick={() => navigate(`/app/companies/${id}`)} className="shrink-0">
                  <CompanyLogo name={c.logo} color={c.logoColor} size={64} />
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
