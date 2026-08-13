import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { JobCard } from '@/components/shared/JobCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCompany } from '@/data/companies'
import { getRecommendedJobs } from '@/api/candidates'
import { cn } from '@/utils/cn'
import type { ContractType, Job } from '@/types'

const contracts: ContractType[] = ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance']

export function JobSearch() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { query?: string } }
  const [query, setQuery] = useState(location.state?.query ?? '')
  const [contractFilter, setContractFilter] = useState<ContractType | 'Tous'>('Tous')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getRecommendedJobs(50)
      .then((result) => !cancelled && setJobs(result))
      .catch(() => {
        // Recommended jobs are candidate-only (require auth) — an
        // unauthenticated visitor just sees an empty search for now.
        // See this repo's README decisions log re: no public cross-company
        // job board endpoint existing on the backend.
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const company = getCompany(job.companyId)
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        company?.name.toLowerCase().includes(query.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      const matchesContract = contractFilter === 'Tous' || job.contract === contractFilter
      return matchesQuery && matchesContract
    })
  }, [jobs, query, contractFilter])

  return (
    <div className="pb-6">
      <PageHeader title="Offres d'emploi" action={<SlidersHorizontal className="size-[18px] text-text-secondary" />} />

      <div className="space-y-3 px-4 pt-4 lg:px-0">
        <span className="relative flex items-center lg:max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 size-[18px] text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un poste, une entreprise…"
            className="h-11 w-full rounded-xl border border-surface-border bg-white pr-4 pl-11 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          />
        </span>

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(['Tous', ...contracts] as const).map((c) => (
            <button
              key={c}
              onClick={() => setContractFilter(c)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                contractFilter === c
                  ? 'border-brand-blue-500 bg-brand-blue-500 text-white'
                  : 'border-surface-border bg-white text-text-secondary',
              )}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => navigate('/app/search')}
            className="shrink-0 rounded-full border border-dashed border-surface-border bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-blue-600"
          >
            Recherche avancée
          </button>
        </div>

        <p className="text-xs text-text-tertiary">{loading ? 'Chargement…' : `${filtered.length} offres trouvées`}</p>
      </div>

      <div className="mt-2 px-4 lg:px-0">
        {!loading && filtered.length === 0 ? (
          <EmptyState icon={<Search className="size-6" />} title="Aucune offre trouvée" description="Essayez d'ajuster vos filtres ou votre recherche." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
