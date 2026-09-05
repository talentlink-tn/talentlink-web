import { api, postFile } from './client'

export interface CompanyGalleryPhotoRaw {
  id: string
  url: string
}

export interface CompanyProfileRaw {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  brand_color: string | null
  dg_name: string | null
  dg_contact: string | null
  drh_name: string | null
  drh_contact: string | null
  tax_id: string | null
  address: string | null
  industry: string | null
  evp_culture: string | null
  evp_benefits: string | null
  gallery_photos: CompanyGalleryPhotoRaw[]
}

export async function getMyCompany(): Promise<CompanyProfileRaw> {
  return api.get<CompanyProfileRaw>('/companies/me')
}

export async function updateMyCompany(patch: Partial<{
  name: string
  description: string
  logo_url: string
  brand_color: string
  dg_name: string
  dg_contact: string
  drh_name: string
  drh_contact: string
  tax_id: string
  address: string
  industry: string
  evp_culture: string
  evp_benefits: string
}>): Promise<CompanyProfileRaw> {
  return api.patch<CompanyProfileRaw>('/companies/me', patch)
}

// Dedicated multipart upload — logo_url itself stays writable directly
// via updateMyCompany too (an already-hosted external logo URL), same
// split as the candidate side's uploadMyPhoto vs. updateMyCandidateProfile.
export async function uploadMyLogo(file: File): Promise<CompanyProfileRaw> {
  return postFile<CompanyProfileRaw>('/companies/me/logo', file)
}

export async function uploadGalleryPhoto(file: File): Promise<CompanyProfileRaw> {
  return postFile<CompanyProfileRaw>('/companies/me/gallery', file)
}

export async function deleteGalleryPhoto(photoId: string): Promise<CompanyProfileRaw> {
  return api.delete<CompanyProfileRaw>(`/companies/me/gallery/${photoId}`)
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
  average_time_to_hire_days: number | null
  retention_rate_percent: number | null
  retention_checks_pending: number
  candidate_experience_score: number | null
}

export async function getDashboardSummary(): Promise<DashboardSummaryRaw> {
  return api.get<DashboardSummaryRaw>('/companies/me/dashboard')
}

export interface TalentPoolEntryRaw {
  id: string
  candidate: { candidate_id: string; first_name: string; last_name: string; headline: string | null; photo_url: string | null }
  source_job_offer_id: string | null
  source_job_offer_title: string | null
  added_at: string
}

export async function getTalentPool(): Promise<TalentPoolEntryRaw[]> {
  return api.get<TalentPoolEntryRaw[]>('/companies/me/talent-pool')
}
