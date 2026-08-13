// Thin fetch wrapper around the FastAPI backend (see ../../../talentlink-backend).
// Two separate auth systems exist server-side (company users vs candidates,
// see that repo's README "Candidate identity & access model") — this client
// only ever holds one active token at a time, matching the frontend's own
// single-active-profile model (AppContext's `profileType`).

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8002/api/v1'
const API_ORIGIN = new URL(API_BASE_URL).origin

// CV/photo upload endpoints return a path relative to the API's own
// origin (e.g. `/uploads/photos/xyz.png`, served by a StaticFiles mount
// outside the /api/v1 router — see talentlink-backend's app/main.py) —
// resolve it against that origin, not the frontend's own, or it 404s
// against the Vite dev server instead of the backend.
export function resolveUploadUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path}`
}

export type AuthKind = 'company' | 'candidate'

const TOKEN_STORAGE_KEY = 'tl_auth_token'

interface StoredAuth {
  token: string
  kind: AuthKind
  // Neither auth API returns the account email back (CandidateProfileRead
  // has no email field — see README "Décisions en attente de validation"),
  // so we stash what the user typed at login/register time purely for
  // read-only display (Profile screens). Never used for API calls.
  email?: string
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

let currentAuth: StoredAuth | null = readStoredAuth()

export function setAuthToken(token: string, kind: AuthKind, email?: string) {
  currentAuth = { token, kind, email }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(currentAuth))
}

export function clearAuthToken() {
  currentAuth = null
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function getAuthToken(): StoredAuth | null {
  return currentAuth
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// FastAPI/Pydantic error bodies are either {"detail": "message"} or
// {"detail": [{"msg": "...", "loc": [...]}]} for validation errors.
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d))).join(' ')
    }
  }
  return fallback
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean // defaults to true — set false for public/unauthenticated endpoints
  query?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, query } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && currentAuth) headers.Authorization = `Bearer ${currentAuth.token}`

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => undefined) : undefined

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(payload, `Erreur ${response.status}`))
  }
  return payload as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

// application/x-www-form-urlencoded — the backend's /auth/login and
// /candidates/auth/login both use FastAPI's OAuth2PasswordRequestForm.
export async function postForm<T>(path: string, form: Record<string, string>): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form).toString(),
  })
  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(payload, `Erreur ${response.status}`))
  }
  return payload as T
}

// multipart/form-data — CV/photo uploads.
export async function postFile<T>(path: string, file: File, fieldName = 'file'): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)
  const headers: Record<string, string> = {}
  if (currentAuth) headers.Authorization = `Bearer ${currentAuth.token}`

  const response = await fetch(buildUrl(path), { method: 'POST', headers, body: form })
  const payload = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(payload, `Erreur ${response.status}`))
  }
  return payload as T
}

// Downloads a file (e.g. .ics) as a Blob, for the browser to save.
export async function getBlob(path: string): Promise<Blob> {
  const headers: Record<string, string> = {}
  if (currentAuth) headers.Authorization = `Bearer ${currentAuth.token}`
  const response = await fetch(buildUrl(path), { headers })
  if (!response.ok) throw new ApiError(response.status, `Erreur ${response.status}`)
  return response.blob()
}
