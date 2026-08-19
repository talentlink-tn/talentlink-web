import { api, postFile } from './client'

export interface CompanyProfileRaw {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  brand_color: string | null
}

export async function getMyCompany(): Promise<CompanyProfileRaw> {
  return api.get<CompanyProfileRaw>('/companies/me')
}

export async function updateMyCompany(patch: Partial<{
  name: string
  description: string
  logo_url: string
  brand_color: string
}>): Promise<CompanyProfileRaw> {
  return api.patch<CompanyProfileRaw>('/companies/me', patch)
}

// Dedicated multipart upload — logo_url itself stays writable directly
// via updateMyCompany too (an already-hosted external logo URL), same
// split as the candidate side's uploadMyPhoto vs. updateMyCandidateProfile.
export async function uploadMyLogo(file: File): Promise<CompanyProfileRaw> {
  return postFile<CompanyProfileRaw>('/companies/me/logo', file)
}

export interface TeamMemberRaw {
  id: string
  email: string
  full_name: string
  role_name: string | null
  is_active: boolean
  created_at: string
}

export async function listMyTeam(): Promise<TeamMemberRaw[]> {
  return api.get<TeamMemberRaw[]>('/companies/me/team')
}

export async function inviteTeamMember(input: {
  email: string
  password: string
  fullName: string
  roleName: string
}): Promise<TeamMemberRaw> {
  return api.post<TeamMemberRaw>('/companies/me/team', {
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    role_name: input.roleName,
  })
}

export async function updateTeamMember(
  userId: string,
  patch: Partial<{ role_name: string; is_active: boolean }>,
): Promise<TeamMemberRaw> {
  return api.patch<TeamMemberRaw>(`/companies/me/team/${userId}`, patch)
}

export interface DashboardSummaryRaw {
  active_job_offers: number
  job_offers_by_status: Record<string, number>
  total_applications: number
  applications_by_status: Record<string, number>
  applications_last_30_days: number
  average_match_score: number | null
}

export async function getDashboardSummary(): Promise<DashboardSummaryRaw> {
  return api.get<DashboardSummaryRaw>('/companies/me/dashboard')
}
