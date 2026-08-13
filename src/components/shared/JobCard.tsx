import { useNavigate } from 'react-router-dom'
import { Bookmark, MapPin, Briefcase } from 'lucide-react'
import type { Job } from '@/types'
import { getCompany } from '@/data/companies'
import { CompanyLogo } from './CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { useApp } from '@/context/AppContext'
import { modeTone } from '@/utils/format'
import { cn } from '@/utils/cn'

export function JobCard({ job, dense }: { job: Job; dense?: boolean }) {
  const navigate = useNavigate()
  const company = getCompany(job.companyId)
  const { isFavorite, toggleFavorite } = useApp()
  const favorite = isFavorite(job.id)

  return (
    <button
      onClick={() => navigate(`/app/jobs/${job.id}`)}
      className="flex w-full items-start gap-3 rounded-2xl border border-surface-border bg-white p-4 text-left transition-shadow hover:shadow-md active:scale-[0.99]"
    >
      <CompanyLogo name={company?.logo ?? '?'} color={company?.logoColor ?? '#2F6FED'} size={dense ? 44 : 52} />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-text-primary">{job.title}</span>
            <span className="block truncate text-sm text-text-secondary">{company?.name}</span>
          </span>
          {job.isNew && (
            <span className="shrink-0 text-xs font-semibold text-green-600">Nouveau</span>
          )}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="size-3.5" /> {job.contract}
          </span>
        </span>
        <span className="mt-2 flex items-center justify-between gap-2">
          <Badge tone={modeTone(job.mode)}>{job.mode}</Badge>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(job.id)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                toggleFavorite(job.id)
              }
            }}
            className={cn(
              'flex size-8 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-muted',
              favorite && 'text-brand-blue-600',
            )}
            aria-label="Ajouter aux favoris"
          >
            <Bookmark className="size-[18px]" fill={favorite ? 'currentColor' : 'none'} />
          </span>
        </span>
      </span>
    </button>
  )
}
