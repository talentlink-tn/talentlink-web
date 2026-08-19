// Backend response shapes -> existing frontend types (types/index.ts).
// The backend's Company/JobOffer schemas are deliberately minimal
// compared to the rich mocked data (no sector/size/website/founded on
// Company; no responsibilities/benefits/start date/work time on
// JobOffer — see README "Décisions en attente de validation" in this
// repo). Fields with no backend equivalent are left empty/undefined;
// screens rendering them must treat them as optional.
import { getJob, registerJob } from '@/data/jobs'
import type { Application, ApplicationStatus, ApplicationStep, Company, Job } from '@/types'
import {
  contractTypeToFr,
  educationLevelLabel,
  experienceLevelLabel,
  timeAgoFr,
  workModeToFr,
  type BackendContractType,
  type BackendEducationLevel,
  type BackendExperienceLevel,
  type BackendWorkMode,
} from './enums'

export interface BackendSkillRequirement {
  skill_name: string
  is_mandatory: boolean
  weight?: number
}

export interface BackendMatchBreakdown {
  overall_score: number
}

// Fields shared by JobOfferRead, RecommendedJobRead, PublicJobOfferRead —
// each mapper below picks the subset it actually receives.
export interface BackendJobOfferLike {
  id: string
  public_slug: string
  title: string
  description?: string
  company_id?: string
  location: string
  contract_type: BackendContractType
  work_mode: BackendWorkMode
  experience_level: BackendExperienceLevel
  education_level?: BackendEducationLevel
  department?: string | null
  salary_min?: number | null
  salary_max?: number | null
  published_at?: string | null
  required_skills?: BackendSkillRequirement[]
  match?: BackendMatchBreakdown
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// Deterministic fallback color when a company has no brand_color set —
// same palette family as the mocked company catalogue.
const FALLBACK_COLORS = ['#2F6FED', '#0F7A3D', '#0EA5A4', '#E4032E', '#7C3AED', '#1E56D6']
function fallbackColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

export function mapJobOffer(offer: BackendJobOfferLike, companyIdFallback?: string): Job {
  const companyId = offer.company_id ?? companyIdFallback ?? ''
  const publishedAt = offer.published_at ?? null
  const isNew = publishedAt ? Date.now() - new Date(publishedAt).getTime() < 48 * 60 * 60 * 1000 : false

  return {
    id: offer.id,
    publicSlug: offer.public_slug,
    title: offer.title,
    companyId,
    location: offer.location,
    contract: contractTypeToFr(offer.contract_type),
    mode: workModeToFr(offer.work_mode),
    postedAt: timeAgoFr(publishedAt) || 'Brouillon',
    isNew,
    salaryMin: offer.salary_min ?? 0,
    salaryMax: offer.salary_max ?? 0,
    experience: experienceLevelLabel(offer.experience_level),
    education: offer.education_level ? educationLevelLabel(offer.education_level) : 'Non précisé',
    startDate: 'Non précisé',
    workTime: 'Temps plein',
    skills: (offer.required_skills ?? []).map((s) => s.skill_name),
    description: offer.description ?? '',
    responsibilities: [],
    profile: [],
    benefits: [],
    applicants: 0,
    matchScore: offer.match ? Math.round(offer.match.overall_score) : undefined,
    category: offer.department ?? '',
  }
}

export interface BackendCompanyLike {
  id: string
  slug?: string
  name: string
  description?: string | null
  logo_url?: string | null
  brand_color?: string | null
}

export type BackendApplicationStatus =
  | 'received'
  | 'ai_screening'
  | 'shortlisted'
  | 'hr_interview'
  | 'technical_interview'
  | 'test'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

// The backend's 10-status pipeline collapses onto the frontend's fixed
// 5-step visual stepper (+ 2 terminal outcomes) — there's no 1:1 mapping,
// this is a deliberate simplification for the existing stepper UI. See
// this repo's README "Décisions en attente de validation" for the
// tradeoff (a richer stepper matching all 10 statuses would need
// ApplicationStepper/ApplicationStatusBadge changes, not just data wiring).
const STATUS_TO_FR: Record<BackendApplicationStatus, ApplicationStatus> = {
  received: 'submitted',
  ai_screening: 'under_review',
  shortlisted: 'under_review',
  hr_interview: 'interview',
  technical_interview: 'interview',
  test: 'technical_test',
  offer: 'decision',
  hired: 'accepted',
  rejected: 'refused',
  withdrawn: 'refused',
}

const STEP_ORDER: ApplicationStep['key'][] = ['submitted', 'under_review', 'interview', 'technical_test', 'decision']
const STEP_LABELS: Record<ApplicationStep['key'], string> = {
  submitted: 'Candidature soumise',
  under_review: 'En examen',
  interview: 'Entretien',
  technical_test: 'Test technique',
  decision: 'Décision',
}

export function backendApplicationStatusToFr(status: BackendApplicationStatus): ApplicationStatus {
  return STATUS_TO_FR[status]
}

function buildSteps(currentFr: ApplicationStatus): ApplicationStep[] {
  const isTerminal = currentFr === 'accepted' || currentFr === 'refused'
  const currentIndex = isTerminal ? STEP_ORDER.length : STEP_ORDER.indexOf(currentFr)
  return STEP_ORDER.map((key, i) => ({
    key,
    label: STEP_LABELS[key],
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }))
}

export interface BackendApplicationForCandidate {
  id: string
  job_offer_id: string
  status: BackendApplicationStatus
  created_at: string
  updated_at: string
  job_offer: {
    id: string
    title: string
    location: string
    contract_type: BackendContractType
    salary_min: number | null
    salary_max: number | null
  }
}

export function mapApplicationForCandidate(raw: BackendApplicationForCandidate): Application {
  const status = backendApplicationStatusToFr(raw.status)

  // ApplicationReadForCandidate.job_offer carries title/location/contract/
  // salary (extended for this reason — see talentlink-backend/README.md's
  // decisions log) but not company, description, or slug — so components
  // resolving the job via getJob(application.jobId) (ApplicationCard,
  // ApplicationDetail) would otherwise get nothing back and silently
  // render blank for an application whose job was never separately
  // loaded via a list screen in this session (e.g. a direct visit to
  // /app/applications). Register a stub with what we do have so those
  // fields show real data even then; richer job screens (JobSearch,
  // recommended-jobs) overwrite it with the full version when visited.
  if (!getJob(raw.job_offer_id)) {
    registerJob({
      id: raw.job_offer_id,
      title: raw.job_offer.title,
      companyId: '',
      location: raw.job_offer.location,
      contract: contractTypeToFr(raw.job_offer.contract_type),
      mode: 'Sur site',
      postedAt: '',
      isNew: false,
      salaryMin: raw.job_offer.salary_min ?? 0,
      salaryMax: raw.job_offer.salary_max ?? 0,
      experience: '',
      education: '',
      startDate: '',
      workTime: '',
      skills: [],
      description: '',
      responsibilities: [],
      profile: [],
      benefits: [],
      applicants: 0,
      category: '',
    })
  }

  return {
    id: raw.id,
    jobId: raw.job_offer_id,
    status,
    appliedAt: timeAgoFr(raw.created_at) || raw.created_at,
    updatedAt: timeAgoFr(raw.updated_at) || raw.updated_at,
    steps: buildSteps(status),
    // The AI match score is deliberately never exposed to the candidate
    // (module 4's ApplicationReadForCandidate has no match_score field
    // at all — recruiter-only signal) — left at 0 rather than shown as
    // if it were real. ApplicationDetail.tsx only renders this section
    // when at least one value is non-zero.
    evaluation: { overall: 0, technical: 0, experience: 0, training: 0, softSkills: 0, languages: 0 },
    documents: [],
  }
}

export function mapCompany(company: BackendCompanyLike): Company {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logo: initials(company.name),
    logoColor: company.brand_color || fallbackColor(company.id),
    logoUrl: company.logo_url ?? undefined,
    sector: '',
    size: '',
    location: '',
    website: '',
    founded: '',
    about: company.description ?? '',
  }
}
