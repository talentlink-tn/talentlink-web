import { api, getAuthToken } from './client'

export interface NotificationRaw {
  id: string
  application_id: string | null
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

// Same dual-mode dispatch as messages.ts — candidates and companies hit
// different endpoint families for what's conceptually the same feature.
function isCompany(): boolean {
  return getAuthToken()?.kind === 'company'
}

export async function listMyNotifications(): Promise<NotificationRaw[]> {
  return isCompany() ? api.get('/companies/me/notifications') : api.get('/candidates/me/notifications')
}

export async function markNotificationRead(id: string): Promise<NotificationRaw> {
  return isCompany()
    ? api.post(`/companies/me/notifications/${id}/read`)
    : api.post(`/candidates/me/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<NotificationRaw[]> {
  return isCompany() ? api.post('/companies/me/notifications/read-all') : api.post('/candidates/me/notifications/read-all')
}
