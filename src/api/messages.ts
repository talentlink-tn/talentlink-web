import { api, getAuthToken } from './client'

export interface ConversationSummaryRaw {
  application_id: string
  job_offer_title: string
  counterpart_name: string
  counterpart_avatar_url: string | null
  last_message_body: string
  last_message_at: string
  unread_count: number
}

export interface MessageRaw {
  id: string
  application_id: string
  sender_type: 'candidate' | 'recruiter'
  sender_user_id: string | null
  body: string
  is_read: boolean
  created_at: string
}

// The Messages/Conversation pages are shared between candidate and
// recruiter, but they hit different endpoint families server-side (one
// scoped by candidate_id, one by company_id) — dispatch on the active
// auth kind here rather than forking the pages themselves.
function isCompany(): boolean {
  return getAuthToken()?.kind === 'company'
}

export async function listMyConversations(): Promise<ConversationSummaryRaw[]> {
  return isCompany() ? api.get('/companies/me/messages') : api.get('/candidates/me/messages')
}

export async function listApplicationMessages(applicationId: string): Promise<MessageRaw[]> {
  return isCompany()
    ? api.get(`/applications/${applicationId}/messages`)
    : api.get(`/candidates/me/applications/${applicationId}/messages`)
}

export async function sendApplicationMessage(applicationId: string, body: string): Promise<MessageRaw> {
  return isCompany()
    ? api.post(`/applications/${applicationId}/messages`, { body })
    : api.post(`/candidates/me/applications/${applicationId}/messages`, { body })
}

export async function markApplicationMessagesRead(applicationId: string): Promise<void> {
  await api.post(
    isCompany()
      ? `/applications/${applicationId}/messages/read`
      : `/candidates/me/applications/${applicationId}/messages/read`,
  )
}
