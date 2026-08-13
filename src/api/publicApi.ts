import { api } from './client'
import { registerCompany } from '@/data/companies'
import { registerJob } from '@/data/jobs'
import { mapCompany, mapJobOffer, type BackendCompanyLike, type BackendJobOfferLike } from './mappers'
import type { Company, Job } from '@/types'

export async function getPublicCompany(slug: string): Promise<Company> {
  const raw = await api.get<BackendCompanyLike>(`/public/companies/${slug}`, { auth: false })
  const company = mapCompany(raw)
  registerCompany(company)
  return company
}

interface PublicJobOfferSummaryRaw extends BackendJobOfferLike {
  public_slug: string
}

export async function listPublicJobOffers(slug: string, companyId: string): Promise<Job[]> {
  const response = await api.get<{ items: PublicJobOfferSummaryRaw[]; total: number }>(
    `/public/companies/${slug}/job-offers`,
    { auth: false, query: { limit: 100 } },
  )
  return response.items.map((item) => {
    const job = mapJobOffer(item, companyId)
    registerJob(job)
    return job
  })
}

export async function getPublicJobOffer(publicSlug: string): Promise<Job> {
  const raw = await api.get<BackendJobOfferLike & { public_slug: string; company: BackendCompanyLike }>(
    `/public/job-offers/${publicSlug}`,
    { auth: false },
  )
  registerCompany(mapCompany(raw.company))
  const job = mapJobOffer(raw, raw.company.id)
  registerJob(job)
  return job
}
