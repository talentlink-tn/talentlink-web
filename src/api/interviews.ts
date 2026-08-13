import { api, getBlob } from './client'

export interface InterviewParticipantRaw {
  user_id: string
  full_name: string
}

export interface InterviewReadRaw {
  id: string
  application_id: string
  kind: 'hr' | 'technical' | 'test' | 'other'
  format: 'on_site' | 'video' | 'phone'
  scheduled_at: string
  duration_minutes: number
  location: string | null
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  participants: InterviewParticipantRaw[]
  created_at: string
  updated_at: string
}

export interface InterviewFormInput {
  kind: InterviewReadRaw['kind']
  format: InterviewReadRaw['format']
  scheduledAt: string // ISO 8601
  durationMinutes?: number
  location?: string
  notes?: string
  participantUserIds?: string[]
}

export async function scheduleInterview(applicationId: string, input: InterviewFormInput): Promise<InterviewReadRaw> {
  return api.post<InterviewReadRaw>(`/applications/${applicationId}/interviews`, {
    kind: input.kind,
    format: input.format,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes ?? 60,
    location: input.location,
    notes: input.notes,
    participant_user_ids: input.participantUserIds ?? [],
  })
}

export async function listApplicationInterviews(applicationId: string): Promise<InterviewReadRaw[]> {
  return api.get<InterviewReadRaw[]>(`/applications/${applicationId}/interviews`)
}

export async function updateInterview(
  id: string,
  patch: Partial<{ scheduled_at: string; duration_minutes: number; location: string; notes: string; participant_user_ids: string[] }>,
): Promise<InterviewReadRaw> {
  return api.patch<InterviewReadRaw>(`/interviews/${id}`, patch)
}

export async function cancelInterview(id: string): Promise<InterviewReadRaw> {
  return api.post<InterviewReadRaw>(`/interviews/${id}/cancel`)
}

export async function completeInterview(id: string): Promise<InterviewReadRaw> {
  return api.post<InterviewReadRaw>(`/interviews/${id}/complete`)
}

export async function downloadInterviewIcs(id: string): Promise<Blob> {
  return getBlob(`/interviews/${id}/calendar.ics`)
}

export async function getAgenda(): Promise<InterviewReadRaw[]> {
  return api.get<InterviewReadRaw[]>('/companies/me/agenda')
}
