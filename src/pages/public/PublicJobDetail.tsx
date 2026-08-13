import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { MapPin, Briefcase, TrendingUp, GraduationCap } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { getCompany } from '@/data/companies'
import { getPublicJobOffer } from '@/api/publicApi'
import { modeTone } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Job } from '@/types'

// The standalone, unauthenticated detail view a shared job link
// resolves to (GET /public/job-offers/{public_slug} — no company_slug
// needed, public_slug is already globally unique). Same data shape
// (Job) as the authenticated JobDetail.tsx, so the "Détails" tab's
// content mirrors it directly — responsibilities/profile/benefits stay
// empty here too (see mappers.ts: no backend equivalent), same as on
// the authenticated page.
export function PublicJobDetail() {
  const { publicSlug } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!publicSlug) return
    let cancelled = false
    getPublicJobOffer(publicSlug)
      .then((j) => !cancelled && setJob(j))
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [publicSlug])

  if (notFound) return <Navigate to="/" replace />

  const company = job ? getCompany(job.companyId) : undefined

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link to="/">
            <Logo size={28} textClassName="text-[15px]" />
          </Link>
          <Link to="/login" className="text-sm font-semibold text-brand-blue-600">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
        {loading && <p className="py-12 text-center text-sm text-text-tertiary">Chargement…</p>}

        {job && (
          <>
            <div className="rounded-3xl border border-surface-border bg-white p-6 lg:p-8">
              <div className="flex items-start justify-between gap-2">
                <CompanyLogo name={company?.logo ?? '?'} color={company?.logoColor ?? '#2F6FED'} size={56} />
                {job.isNew && <Badge tone="green">Nouveau</Badge>}
              </div>
              <h1 className="mt-4 text-2xl font-extrabold text-text-primary lg:text-3xl">{job.title}</h1>
              {company && (
                <Link to={`/careers/${company.slug}`} className="text-sm font-medium text-text-secondary hover:text-brand-blue-600">
                  {company.name}
                </Link>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-tertiary">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4" /> {job.contract}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge tone={modeTone(job.mode)}>{job.mode}</Badge>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-6 sm:flex-row sm:items-center">
                <p className="flex-1 text-sm text-text-secondary">
                  Connectez-vous ou créez un compte candidat pour postuler à cette offre.
                </p>
                <div className="flex shrink-0 gap-2">
                  <Link
                    to="/login"
                    className="flex h-11 items-center justify-center rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-text-primary hover:bg-surface-muted"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="flex h-11 items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-white shadow-sm shadow-brand-blue-500/20 hover:brightness-105"
                  >
                    Postuler
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-[15px] font-bold text-text-primary">Description du poste</h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-text-secondary">{job.description}</p>
                </div>

                {job.skills.length > 0 && (
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
                )}
              </div>

              <div className="space-y-3">
                <InfoTile icon={Briefcase} label="Type de contrat" value={job.contract} tone="bg-green-50 text-green-600" />
                <InfoTile
                  icon={TrendingUp}
                  label="Salaire"
                  value={job.salaryMin || job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} TND` : 'À discuter'}
                  tone="bg-blue-50 text-blue-600"
                />
                <InfoTile icon={GraduationCap} label="Expérience" value={job.experience} tone="bg-purple-50 text-purple-600" />
                <InfoTile icon={GraduationCap} label="Niveau d'études" value={job.education} tone="bg-orange-50 text-orange-600" />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value, tone }: { icon: typeof Briefcase; label: string; value: string; tone: string }) {
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
