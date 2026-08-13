import { api, postForm, setAuthToken } from './client'

interface TokenResponse {
  access_token: string
  token_type: string
}

export async function registerCompany(input: {
  companyName: string
  companySlug: string
  adminEmail: string
  adminPassword: string
  adminFullName: string
}): Promise<void> {
  const response = await api.post<TokenResponse>(
    '/auth/register-company',
    {
      company_name: input.companyName,
      company_slug: input.companySlug,
      admin_email: input.adminEmail,
      admin_password: input.adminPassword,
      admin_full_name: input.adminFullName,
    },
    { auth: false },
  )
  setAuthToken(response.access_token, 'company', input.adminEmail)
}

export async function loginCompany(email: string, password: string): Promise<void> {
  const response = await postForm<TokenResponse>('/auth/login', { username: email, password })
  setAuthToken(response.access_token, 'company', email)
}

export async function registerCandidate(input: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<void> {
  const response = await api.post<TokenResponse>(
    '/candidates/auth/register',
    { email: input.email, password: input.password, first_name: input.firstName, last_name: input.lastName },
    { auth: false },
  )
  setAuthToken(response.access_token, 'candidate', input.email)
}

export async function loginCandidate(email: string, password: string): Promise<void> {
  const response = await postForm<TokenResponse>('/candidates/auth/login', { username: email, password })
  setAuthToken(response.access_token, 'candidate', email)
}
