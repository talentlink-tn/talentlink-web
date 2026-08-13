import { api } from './client'
import type { BackendApplicationStatus } from './mappers'
import type { RecruiterCandidate } from '@/types'

export interface ApplicationReadRaw {
  id: string
  candidate_id: string
  job_offer_id: string
  company_id: string
  status: BackendApplicationStatus
  cover_letter: string | null
  cv_snapshot_url: string | null
  cv_snapshot_filename: string | null
  created_at: string
  updated_at: string
  candidate: { candidate_id: string; first_name: string; last_name: string; headline: string | null; photo_url: string | null }
  job_offer: { id: string; title: string }
  status_history: { from_status: string | null; to_status: string; changed_at: string; actor_type: string; actor_user_id: string | null }[]
  notes: { id: string; author_user_id: string | null; body: string; created_at: string }[]
  match_score: number | null
  match_breakdown: unknown | null
}

export async function listApplications(params?: {
  jobOfferId?: string
  statusFilter?: BackendApplicationStatus
  minScore?: number
  sort?: '-match_score' | 'match_score'
}): Promise<ApplicationReadRaw[]> {
  return api.get<ApplicationReadRaw[]>('/applications', {
    query: {
      job_offer_id: params?.jobOfferId,
      status_filter: params?.statusFilter,
      min_score: params?.minScore,
      sort: params?.sort,
    },
  })
}

export async function getApplication(id: string): Promise<ApplicationReadRaw> {
  return api.get<ApplicationReadRaw>(`/applications/${id}`)
}

export async function getApplicationCandidateProfile(id: string) {
  return api.get(`/applications/${id}/candidate-profile`)
}

export async function changeApplicationStatus(id: string, toStatus: BackendApplicationStatus): Promise<ApplicationReadRaw> {
  return api.post<ApplicationReadRaw>(`/applications/${id}/status`, { to_status: toStatus })
}

export async function addApplicationNote(id: string, body: string): Promise<ApplicationReadRaw> {
  return api.post<ApplicationReadRaw>(`/applications/${id}/notes`, { body })
}

export async function recomputeApplicationMatch(id: string): Promise<ApplicationReadRaw> {
  return api.post<ApplicationReadRaw>(`/applications/${id}/recompute-match`)
}

const AVATAR_COLORS = ['#2F6FED', '#0F7A3D', '#0EA5A4', '#E4032E', '#7C3AED', '#1E56D6']
function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// The recruiter pipeline board (CandidatesPipeline.tsx) only distinguishes
// 3 stages — same "collapse the 10-status backend pipeline for a simpler
// visual" tradeoff as mapApplicationForCandidate's 5-step stepper.
const STAGE_FOR_STATUS: Record<BackendApplicationStatus, RecruiterCandidate['stage']> = {
  received: 'new',
  ai_screening: 'new',
  shortlisted: 'new',
  hr_interview: 'interview',
  technical_interview: 'interview',
  test: 'interview',
  offer: 'final',
  hired: 'final',
  rejected: 'final',
  withdrawn: 'final',
}

export function mapApplicationToRecruiterCandidate(raw: ApplicationReadRaw): RecruiterCandidate {
  const name = `${raw.candidate.first_name} ${raw.candidate.last_name}`
  return {
    id: raw.id,
    name,
    avatarColor: colorFor(raw.candidate.candidate_id),
    role: raw.candidate.headline ?? raw.job_offer.title,
    stage: STAGE_FOR_STATUS[raw.status],
    appliedAt: raw.created_at,
    matchScore: raw.match_score ?? 0,
  }
}
