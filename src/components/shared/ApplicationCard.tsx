import { useNavigate } from 'react-router-dom'
import { MapPin, Briefcase } from 'lucide-react'
import type { Application } from '@/types'
import { getJob } from '@/data/jobs'
import { getCompany } from '@/data/companies'
import { CompanyLogo } from './CompanyLogo'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

export function ApplicationCard({ application, basePath = '/app/applications' }: { application: Application; basePath?: string }) {
  const navigate = useNavigate()
  const job = getJob(application.jobId)
  if (!job) return null
  const company = getCompany(job.companyId)

  return (
    <button
      onClick={() => navigate(`${basePath}/${application.id}`)}
      className="flex w-full items-start gap-3 rounded-2xl border border-surface-border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:shadow-md active:translate-y-0 active:scale-[0.99]"
    >
      <CompanyLogo name={company?.logo ?? '?'} color={company?.logoColor ?? '#2F6FED'} size={48} />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-text-primary">{job.title}</span>
            <span className="block truncate text-sm text-text-secondary">{company?.name}</span>
          </span>
          <ApplicationStatusBadge status={application.status} />
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="size-3.5" /> {job.contract}
          </span>
        </span>
        <span className="mt-2 block text-[11px] text-text-tertiary">
          Postulé le {application.appliedAt} · Mis à jour {application.updatedAt}
        </span>
      </span>
    </button>
  )
}
