import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Globe, Users2 } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { PublicJobCard } from '@/components/shared/PublicJobCard'
import { getPublicCompany, listPublicJobOffers } from '@/api/publicApi'
import type { Company, Job } from '@/types'

// A company's public, unauthenticated career page — GET
// /public/companies/{slug} + /public/companies/{slug}/job-offers. The
// backend has had these endpoints since module 5; no frontend page
// consumed them until now (see README decisions log). Responsive from
// the start: single column on mobile, a wider hero + job grid on
// desktop — this page has no "mobile app screen" to stay consistent
// with the way the authenticated /app/* pages do, so there's no
// AppShell/sidebar chrome here, just a minimal public header.
export function CareerPage() {
  const { companySlug } = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!companySlug) return
    let cancelled = false
    getPublicCompany(companySlug)
      .then((c) => {
        if (cancelled) return
        setCompany(c)
        return listPublicJobOffers(companySlug, c.id).then((j) => !cancelled && setJobs(j))
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [companySlug])

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Logo size={32} textClassName="text-[16px]" to="/" />
          <Link to="/login" className="text-sm font-semibold text-brand-blue-600 transition-colors hover:text-brand-blue-700">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="animate-fade-in mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
        {loading && <p className="py-12 text-center text-sm text-text-tertiary">Chargement…</p>}

        {notFound && (
          <div className="py-16 text-center">
            <p className="text-lg font-bold text-text-primary">Entreprise introuvable</p>
            <p className="mt-1 text-sm text-text-secondary">Cette page carrière n'existe pas ou n'est plus disponible.</p>
          </div>
        )}

        {company && (
          <>
            <div className="rounded-3xl border border-surface-border bg-white p-6 lg:p-10">
              <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center">
                <CompanyLogo name={company.logo} color={company.logoColor} size={80} className="rounded-2xl text-2xl" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-extrabold text-text-primary lg:text-3xl">{company.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                    {company.sector && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users2 className="size-4" /> {company.sector}
                      </span>
                    )}
                    {company.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" /> {company.location}
                      </span>
                    )}
                    {company.website && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="size-4" /> {company.website}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {company.about && <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-secondary">{company.about}</p>}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-text-primary">
                {loading ? 'Offres' : `${jobs.length} offre${jobs.length === 1 ? '' : 's'} ouverte${jobs.length === 1 ? '' : 's'}`}
              </h2>
              {jobs.length === 0 ? (
                <p className="mt-4 text-sm text-text-tertiary">Aucune offre publiée pour le moment.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job) => (
                    <PublicJobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-surface-border py-6 text-center text-xs text-text-tertiary">
        <Link to="/register" className="font-semibold text-brand-blue-600 hover:underline">
          Vous êtes candidat ? Créez votre profil Talent Link
        </Link>
      </footer>
    </div>
  )
}
