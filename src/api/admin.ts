import { api, postForm, setAuthToken } from './client'

interface TokenResponse {
  access_token: string
  token_type: string
}

export type CompanyStatus = 'pending' | 'active' | 'suspended'
export type JobOfferStatus = 'draft' | 'scheduled' | 'published' | 'closed' | 'archived' | 'suspended'

export interface CompanyAdminRaw {
  id: string
  name: string
  slug: string
  status: CompanyStatus
  description: string | null
  logo_url: string | null
  created_at: string
}

export interface JobOfferAdminRaw {
  id: string
  title: string
  company_id: string
  company_name: string
  status: JobOfferStatus
  location: string
  created_at: string
}

export interface AdminDashboardSummaryRaw {
  companies_total: number
  companies_pending: number
  companies_active: number
  companies_suspended: number
  job_offers_total: number
  job_offers_published: number
  candidates_total: number
}

export async function loginAdmin(email: string, password: string): Promise<void> {
  const res = await postForm<TokenResponse>('/admin/auth/login', { username: email, password })
  setAuthToken(res.access_token, 'admin', email)
}

export async function listCompanies(statusFilter?: CompanyStatus): Promise<CompanyAdminRaw[]> {
  return api.get<CompanyAdminRaw[]>('/admin/companies', { query: { status_filter: statusFilter } })
}

export async function approveCompany(companyId: string): Promise<CompanyAdminRaw> {
  return api.post<CompanyAdminRaw>(`/admin/companies/${companyId}/approve`)
}

export async function suspendCompany(companyId: string, reason: string): Promise<CompanyAdminRaw> {
  return api.post<CompanyAdminRaw>(`/admin/companies/${companyId}/suspend`, { reason })
}

export async function reactivateCompany(companyId: string): Promise<CompanyAdminRaw> {
  return api.post<CompanyAdminRaw>(`/admin/companies/${companyId}/reactivate`)
}

export async function listJobOffersAdmin(statusFilter?: JobOfferStatus): Promise<JobOfferAdminRaw[]> {
  return api.get<JobOfferAdminRaw[]>('/admin/job-offers', { query: { status_filter: statusFilter } })
}

export async function suspendJobOfferAdmin(jobOfferId: string, reason: string): Promise<JobOfferAdminRaw> {
  return api.post<JobOfferAdminRaw>(`/admin/job-offers/${jobOfferId}/suspend`, { reason })
}

export async function restoreJobOfferAdmin(jobOfferId: string): Promise<JobOfferAdminRaw> {
  return api.post<JobOfferAdminRaw>(`/admin/job-offers/${jobOfferId}/restore`)
}

export async function getAdminDashboard(): Promise<AdminDashboardSummaryRaw> {
  return api.get<AdminDashboardSummaryRaw>('/admin/dashboard')
}
