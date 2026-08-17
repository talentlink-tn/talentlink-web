import { Link } from 'react-router-dom'
import { MapPin, Briefcase } from 'lucide-react'
import type { Job } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { modeTone } from '@/utils/format'

// Same visual language as the authenticated JobCard, but links to the
// public job detail route (/jobs/:publicSlug) instead of /app/jobs/:id
// — an unauthenticated visitor hitting the auth-gated route would just
// bounce to /login and lose the job they were looking at.
export function PublicJobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.publicSlug}`}
      className="flex w-full flex-col gap-2 rounded-2xl border border-surface-border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold text-text-primary">{job.title}</span>
        </span>
        {job.isNew && <span className="shrink-0 text-xs font-semibold text-green-600">Nouveau</span>}
      </div>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="size-3.5" /> {job.contract}
        </span>
      </span>
      <Badge tone={modeTone(job.mode)}>{job.mode}</Badge>
    </Link>
  )
}
