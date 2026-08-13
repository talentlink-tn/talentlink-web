import { api } from './client'
import type { BackendContractType, BackendEducationLevel, BackendExperienceLevel, BackendWorkMode } from './enums'
import { mapJobOffer, type BackendJobOfferLike } from './mappers'
import { registerJob } from '@/data/jobs'
import type { Job } from '@/types'

export interface JobOfferReadRaw extends BackendJobOfferLike {
  status: 'draft' | 'scheduled' | 'published' | 'closed' | 'archived'
  application_deadline?: string | null
  public_slug: string
}

interface JobOfferListItemRaw {
  id: string
  title: string
  status: JobOfferReadRaw['status']
  contract_type: BackendContractType
  location: string
  department: string | null
  published_at: string | null
  created_at: string
}

interface JobOfferListResponse {
  items: JobOfferListItemRaw[]
  total: number
  limit: number
  offset: number
}

export interface JobOfferFormInput {
  title: string
  description: string
  mission?: string
  experienceLevel: BackendExperienceLevel
  educationLevel?: BackendEducationLevel
  contractType: BackendContractType
  workMode: BackendWorkMode
  location: string
  department?: string
  salaryMin?: number
  salaryMax?: number
  requiredSkills?: { skill_name: string; is_mandatory: boolean; weight?: number }[]
}

function toPayload(input: JobOfferFormInput) {
  return {
    title: input.title,
    description: input.description,
    mission: input.mission,
    experience_level: input.experienceLevel,
    education_level: input.educationLevel,
    contract_type: input.contractType,
    work_mode: input.workMode,
    location: input.location,
    department: input.department,
    salary_min: input.salaryMin,
    salary_max: input.salaryMax,
    required_skills: input.requiredSkills ?? [],
  }
}

export async function listMyJobOffers(params?: {
  status?: JobOfferReadRaw['status']
  q?: string
}): Promise<{ items: JobOfferListItemRaw[]; total: number }> {
  const response = await api.get<JobOfferListResponse>('/job-offers', {
    query: { status: params?.status, q: params?.q, limit: 100 },
  })
  return response
}

export async function getMyJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.get<JobOfferReadRaw>(`/job-offers/${id}`)
}

export async function createJobOffer(input: JobOfferFormInput): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>('/job-offers', toPayload(input))
}

export async function updateJobOffer(id: string, input: Partial<JobOfferFormInput>): Promise<JobOfferReadRaw> {
  const payload = toPayload(input as JobOfferFormInput)
  return api.patch<JobOfferReadRaw>(`/job-offers/${id}`, payload)
}

export async function publishJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>(`/job-offers/${id}/publish`)
}

export async function closeJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>(`/job-offers/${id}/close`)
}

export async function archiveJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>(`/job-offers/${id}/archive`)
}

export async function restoreJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>(`/job-offers/${id}/restore`)
}

export async function deleteJobOffer(id: string): Promise<void> {
  await api.delete<void>(`/job-offers/${id}`)
}

export async function duplicateJobOffer(id: string): Promise<JobOfferReadRaw> {
  return api.post<JobOfferReadRaw>(`/job-offers/${id}/duplicate`)
}

export async function shareJobOffer(id: string): Promise<{ public_url: string; preview_title: string; preview_description: string }> {
  return api.get(`/job-offers/${id}/share`)
}

export interface PipelineSummary {
  job_offer_id: string
  total_applications: number
  applications_by_status: Record<string, number>
  average_match_score: number | null
}

export async function getPipelineSummary(jobOfferId: string): Promise<PipelineSummary> {
  return api.get<PipelineSummary>(`/job-offers/${jobOfferId}/pipeline-summary`)
}

// Fetches + maps a job offer into the frontend `Job` shape, registering it
// with data/jobs.ts's runtime registry so components resolving jobs via
// `getJob(id)` (JobDetail, JobCard...) see it immediately after.
export async function getMyJobOfferAsJob(id: string, companyId: string): Promise<Job> {
  const raw = await getMyJobOffer(id)
  const job = mapJobOffer(raw, companyId)
  registerJob(job)
  return job
}
