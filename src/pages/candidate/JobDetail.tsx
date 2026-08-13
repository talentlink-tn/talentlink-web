import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { Bookmark, Share2, MapPin, Briefcase, Clock, Heart, Utensils, TrendingUp, Home, Car, GraduationCap, Calendar, Timer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getJob } from '@/data/jobs'
import { getCompany } from '@/data/companies'
import { getRecommendedJobs } from '@/api/candidates'
import { getPublicJobOffer } from '@/api/publicApi'
import { modeTone } from '@/utils/format'
import { useApp } from '@/context/AppContext'
import { ApiError } from '@/api/client'
import { cn } from '@/utils/cn'
import type { Job } from '@/types'

const benefitIcons: Record<string, typeof Heart> = { heart: Heart, utensils: Utensils, 'trending-up': TrendingUp, home: Home, car: Car }
const tabs = ['Détails', 'À propos', 'Équipe', 'Avis'] as const

export function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | undefined>(() => getJob(jobId ?? ''))
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Détails')
  const [applying, setApplying] = useState(false)
  const { isFavorite, toggleFavorite, hasApplied, applyToJob, showToast } = useApp()

  useEffect(() => {
    if (job || !jobId) return
    // Direct navigation / page refresh — the job wasn't registered by a
    // prior list screen (JobSearch, Dashboard...) in this session yet.
    getRecommendedJobs(100)
      .then((jobs) => {
        const found = jobs.find((j) => j.id === jobId)
        if (found) setJob(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [job, jobId])

  useEffect(() => {
    // RecommendedJobRead (used for the listing screens) is a lightweight
    // summary with a match score — it deliberately doesn't carry
    // description/required_skills. Once we know the slug, fetch the full
    // public detail (unauthenticated endpoint, works for any published
    // offer) to fill those in for this detail view.
    if (!job?.publicSlug || job.description) return
    getPublicJobOffer(job.publicSlug)
      .then((full) => setJob((current) => (current && current.id === full.id ? { ...full, matchScore: current.matchScore } : current)))
      .catch(() => {
        // Keep showing the lightweight version rather than failing the page.
      })
  }, [job])

  if (notFound) return <Navigate to="/app/jobs" replace />
  if (!job) return null
  const company = getCompany(job.companyId)
  const applied = hasApplied(job.id)

  const handleApply = async () => {
    if (applied) {
      showToast('Vous avez déjà postulé à cette offre.')
      return
    }
    setApplying(true)
    try {
      const app = await applyToJob(job.id)
      navigate(`/app/applications/${app.id}`)
    } catch (error) {
      // The backend requires a CV on file before accepting an
      // application (see talentlink-backend's module 3) — the most
      // common failure here by far.
      if (error instanceof ApiError && error.status === 422) {
        showToast('Ajoutez un CV à votre profil avant de postuler.')
        navigate('/app/profile/cv')
      } else {
        showToast("Impossible d'envoyer la candidature pour le moment.")
      }
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title=""
        action={
          <span className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(job.id)}
              className={cn('flex size-9 items-center justify-center rounded-full hover:bg-surface-muted', isFavorite(job.id) ? 'text-brand-blue-600' : 'text-text-primary')}
            >
              <Bookmark className="size-[18px]" fill={isFavorite(job.id) ? 'currentColor' : 'none'} />
            </button>
          </span>
        }
      />

      <div className="px-4 pt-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:px-0">
        <div className="rounded-2xl border border-surface-border bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <CompanyLogo name={company?.logo ?? '?'} color={company?.logoColor ?? '#2F6FED'} size={56} />
            <span className="flex items-center gap-1.5">
              {job.isNew && <Badge tone="green">Nouveau</Badge>}
              <button onClick={() => showToast('Lien copié !')} className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted">
                <Share2 className="size-4" />
              </button>
            </span>
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-text-primary lg:text-2xl">{job.title}</h1>
          <button onClick={() => navigate(`/app/companies/${job.companyId}`)} className="text-sm font-medium text-text-secondary hover:text-brand-blue-600">
            {company?.name}
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" /> {job.contract}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {job.postedAt}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={modeTone(job.mode)}>{job.mode}</Badge>
            <Badge tone="gray">{job.category}</Badge>
          </div>

          {/* Desktop-only apply actions — replaces the mobile sticky bottom
              bar (hidden at lg: below), same actions, inline instead of
              fixed since a sidebar/detail page has room for them here. */}
          <div className="mt-4 hidden gap-3 border-t border-surface-border pt-4 lg:flex">
            <Button variant="outline" onClick={() => toggleFavorite(job.id)} className="shrink-0">
              <Bookmark className="size-[18px]" fill={isFavorite(job.id) ? 'currentColor' : 'none'} />
              Enregistrer
            </Button>
            <Button fullWidth onClick={handleApply} disabled={applied} loading={applying}>
              {applied ? 'Déjà postulé' : 'Postuler maintenant'}
            </Button>
          </div>
        </div>

      <div className="no-scrollbar mt-4 flex gap-5 border-b border-surface-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative shrink-0 pb-3 text-sm font-semibold transition-colors',
              tab === t ? 'text-brand-blue-600' : 'text-text-tertiary',
            )}
          >
            {t}
            {t === 'Avis' && <span className="ml-1 text-text-tertiary">(12)</span>}
            {tab === t && <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-brand-blue-600" />}
          </button>
        ))}
      </div>

      <div className="flex-1 pt-4">
        {tab === 'Détails' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-[15px] font-bold text-text-primary">Description du poste</h2>
              <p className="text-sm leading-relaxed text-text-secondary">{job.description}</p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-bold text-text-primary">Informations clés</h2>
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={Briefcase} label="Type de contrat" value={job.contract} tone="bg-green-50 text-green-600" />
                <InfoTile
                  icon={TrendingUp}
                  label="Salaire"
                  value={job.salaryMin || job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} TND` : 'À discuter'}
                  tone="bg-blue-50 text-blue-600"
                />
                <InfoTile icon={GraduationCap} label="Expérience" value={job.experience} tone="bg-purple-50 text-purple-600" />
                <InfoTile icon={GraduationCap} label="Niveau d'études" value={job.education} tone="bg-orange-50 text-orange-600" />
                <InfoTile icon={Calendar} label="Date de début" value={job.startDate} tone="bg-teal-50 text-teal-600" />
                <InfoTile icon={Timer} label="Temps de travail" value={job.workTime} tone="bg-pink-50 text-pink-600" />
              </div>
            </div>

            {job.responsibilities.length > 0 && (
              <div>
                <h2 className="mb-2 text-[15px] font-bold text-text-primary">Responsabilités</h2>
                <ul className="space-y-1.5">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-blue-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="mb-2 text-[15px] font-bold text-text-primary">Compétences requises</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s} tone="gray">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {job.benefits.length > 0 && (
              <div>
                <h2 className="mb-2 text-[15px] font-bold text-text-primary">Avantages</h2>
                <div className="grid grid-cols-2 gap-3">
                  {job.benefits.map((b) => {
                    const Icon = benefitIcons[b.icon] ?? Heart
                    return (
                      <div key={b.label} className="flex flex-col items-center gap-2 rounded-xl border border-surface-border bg-white py-4 text-center">
                        <Icon className="size-5 text-brand-green-500" />
                        <span className="text-xs font-medium text-text-secondary">{b.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'À propos' && company && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-text-secondary">{company.about}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoTile icon={Briefcase} label="Secteur" value={company.sector} tone="bg-blue-50 text-blue-600" />
              <InfoTile icon={TrendingUp} label="Taille" value={company.size} tone="bg-green-50 text-green-600" />
            </div>
            <Button variant="outline" fullWidth onClick={() => navigate(`/app/companies/${company.id}`)}>
              Voir le profil de l’entreprise
            </Button>
          </div>
        )}

        {tab === 'Équipe' && (
          <div className="space-y-3">
            {['Sarah Ben Ali · Responsable RH', 'Karim Selmi · Lead Développeur', 'Nadia Trabelsi · Product Manager'].map((m) => (
              <div key={m} className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-blue-50 text-sm font-bold text-brand-blue-600">
                  {m[0]}
                </span>
                <span className="text-sm font-medium text-text-primary">{m}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Avis' && (
          <div className="space-y-3">
            {[
              { name: 'Amine T.', note: 5, text: 'Excellente ambiance de travail et vraies opportunités d’évolution.' },
              { name: 'Ines K.', note: 4, text: 'Bon équilibre vie pro/perso, management à l’écoute.' },
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
      </div>

      <div className="sticky bottom-0 z-20 mt-auto flex gap-3 border-t border-surface-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button variant="outline" onClick={() => toggleFavorite(job.id)} className="shrink-0">
          <Bookmark className="size-[18px]" fill={isFavorite(job.id) ? 'currentColor' : 'none'} />
          Enregistrer
        </Button>
        <Button fullWidth onClick={handleApply} disabled={applied} loading={applying}>
          {applied ? 'Déjà postulé' : 'Postuler maintenant'}
        </Button>
      </div>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value, tone }: { icon: typeof Heart; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs text-text-tertiary">{label}</span>
        <span className="block truncate text-sm font-semibold text-text-primary">{value}</span>
      </span>
    </div>
  )
}
