import { api, getBlob, postFile } from './client'
import { registerCompany } from '@/data/companies'
import { registerJob } from '@/data/jobs'
import { mapApplicationForCandidate, mapCompany, mapJobOffer, type BackendApplicationForCandidate } from './mappers'
import type { Application } from '@/types'

export interface ExperienceRaw {
  id: string
  title: string
  company_name: string
  location: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
  display_order: number
}

export type ExperienceInput = Omit<ExperienceRaw, 'id'>

export interface EducationRaw {
  id: string
  degree: string
  school: string
  field_of_study: string | null
  level: 'none' | 'bac' | 'bac2' | 'bac3' | 'bac5' | 'doctorate' | null
  start_date: string | null
  end_date: string | null
  display_order: number
}

export type EducationInput = Omit<EducationRaw, 'id'>

export interface CertificationRaw {
  id: string
  name: string
  issuing_organization: string | null
  issue_date: string | null
  expiry_date: string | null
  credential_url: string | null
}

export type CertificationInput = Omit<CertificationRaw, 'id'>

export interface CandidateProfileRaw {
  candidate_id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  headline: string | null
  about: string | null
  photo_url: string | null
  cv_file_url: string | null
  cv_file_name: string | null
  cv_uploaded_at: string | null
  completion_percent: number
  experiences: ExperienceRaw[]
  educations: EducationRaw[]
  skills: { skill_name: string }[]
  languages: { language: string; proficiency: string }[]
  certifications: CertificationRaw[]
}

export async function getMyCandidateProfile(): Promise<CandidateProfileRaw> {
  return api.get<CandidateProfileRaw>('/candidates/me')
}

export async function updateMyCandidateProfile(patch: Record<string, unknown>): Promise<CandidateProfileRaw> {
  return api.patch<CandidateProfileRaw>('/candidates/me', patch)
}

export async function uploadMyCv(file: File): Promise<CandidateProfileRaw> {
  return postFile<CandidateProfileRaw>('/candidates/me/cv', file)
}

export async function uploadMyPhoto(file: File): Promise<CandidateProfileRaw> {
  return postFile<CandidateProfileRaw>('/candidates/me/photo', file)
}

// Full bulk replace, matching the tag-editor UI in ProfileEdit.tsx — the
// backend only exposes skills as PUT (replace-all), not per-skill CRUD.
export async function updateMySkills(skillNames: string[]): Promise<CandidateProfileRaw> {
  return api.put<CandidateProfileRaw>(
    '/candidates/me/skills',
    skillNames.map((skill_name) => ({ skill_name })),
  )
}

// Individual CRUD-by-id, unlike skills' bulk PUT — the backend has no
// bulk-replace for these three, and PATCH is a full overwrite (every
// field must be sent, not just the ones that changed), matching how
// the backend service applies model_dump() without exclude_unset.
export async function addExperience(input: ExperienceInput): Promise<CandidateProfileRaw> {
  return api.post<CandidateProfileRaw>('/candidates/me/experiences', input)
}
export async function updateExperience(id: string, input: ExperienceInput): Promise<CandidateProfileRaw> {
  return api.patch<CandidateProfileRaw>(`/candidates/me/experiences/${id}`, input)
}
export async function deleteExperience(id: string): Promise<CandidateProfileRaw> {
  return api.delete<CandidateProfileRaw>(`/candidates/me/experiences/${id}`)
}

export async function addEducation(input: EducationInput): Promise<CandidateProfileRaw> {
  return api.post<CandidateProfileRaw>('/candidates/me/educations', input)
}
export async function updateEducation(id: string, input: EducationInput): Promise<CandidateProfileRaw> {
  return api.patch<CandidateProfileRaw>(`/candidates/me/educations/${id}`, input)
}
export async function deleteEducation(id: string): Promise<CandidateProfileRaw> {
  return api.delete<CandidateProfileRaw>(`/candidates/me/educations/${id}`)
}

export async function addCertification(input: CertificationInput): Promise<CandidateProfileRaw> {
  return api.post<CandidateProfileRaw>('/candidates/me/certifications', input)
}
export async function updateCertification(id: string, input: CertificationInput): Promise<CandidateProfileRaw> {
  return api.patch<CandidateProfileRaw>(`/candidates/me/certifications/${id}`, input)
}
export async function deleteCertification(id: string): Promise<CandidateProfileRaw> {
  return api.delete<CandidateProfileRaw>(`/candidates/me/certifications/${id}`)
}

export async function applyToJobOffer(jobOfferId: string, coverLetter?: string): Promise<Application> {
  const raw = await api.post<BackendApplicationForCandidate>('/candidates/me/applications', {
    job_offer_id: jobOfferId,
    cover_letter: coverLetter,
  })
  return mapApplicationForCandidate(raw)
}

export async function listMyApplications(): Promise<Application[]> {
  const raw = await api.get<BackendApplicationForCandidate[]>('/candidates/me/applications')
  return raw.map(mapApplicationForCandidate)
}

export async function getMyApplication(id: string): Promise<Application> {
  const raw = await api.get<BackendApplicationForCandidate>(`/candidates/me/applications/${id}`)
  return mapApplicationForCandidate(raw)
}

export async function withdrawMyApplication(id: string): Promise<Application> {
  const raw = await api.post<BackendApplicationForCandidate>(`/candidates/me/applications/${id}/withdraw`)
  return mapApplicationForCandidate(raw)
}

// Fetches recommended jobs and registers both the jobs and their
// companies with the runtime registries (data/jobs.ts, data/companies.ts)
// so JobCard/JobDetail resolve them via the existing getJob/getCompany
// helpers with no further changes.
export async function getRecommendedJobs(limit = 20) {
  interface RecommendedJobRaw {
    id: string
    public_slug: string
    title: string
    company_id: string
    company_name: string
    location: string
    work_mode: 'on_site' | 'hybrid' | 'remote'
    contract_type: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'alternance'
    experience_level: 'junior' | 'confirmed' | 'senior' | 'expert'
    education_level: 'none' | 'bac' | 'bac2' | 'bac3' | 'bac5' | 'doctorate'
    salary_min: number | null
    salary_max: number | null
    published_at: string | null
    match: { overall_score: number }
  }
  const raw = await api.get<RecommendedJobRaw[]>('/candidates/me/recommended-jobs', { query: { limit } })
  return raw.map((item) => {
    registerCompany(mapCompany({ id: item.company_id, name: item.company_name }))
    const job = mapJobOffer(item, item.company_id)
    registerJob(job)
    return job
  })
}

export interface InterviewForCandidateRaw {
  id: string
  kind: 'hr' | 'technical' | 'test' | 'other'
  format: 'on_site' | 'video' | 'phone'
  scheduled_at: string
  duration_minutes: number
  location: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
}

export async function listMyUpcomingInterviews(): Promise<InterviewForCandidateRaw[]> {
  return api.get<InterviewForCandidateRaw[]>('/candidates/me/interviews')
}

export async function listMyApplicationInterviews(applicationId: string): Promise<InterviewForCandidateRaw[]> {
  return api.get<InterviewForCandidateRaw[]>(`/candidates/me/applications/${applicationId}/interviews`)
}

export async function downloadMyInterviewIcs(interviewId: string): Promise<Blob> {
  return getBlob(`/candidates/me/interviews/${interviewId}/calendar.ics`)
}
