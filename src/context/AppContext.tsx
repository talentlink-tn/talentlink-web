import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { conversations as seedConversations } from '@/data/messages'
import {
  applyToJobOffer,
  getMyApplication,
  listMyApplications,
  listMyNotifications,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
  withdrawMyApplication,
  type NotificationRaw,
} from '@/api/candidates'
import { loginCandidate, loginCompany, registerCandidate, registerCompany } from '@/api/auth'
import { clearAuthToken, getAuthToken, type AuthKind } from '@/api/client'
import { timeAgoFr } from '@/api/enums'
import type { Application, Conversation, MessageItem, NotificationItem, ProfileType } from '@/types'

function notificationToItem(n: NotificationRaw): NotificationItem {
  return {
    id: n.id,
    category: 'application',
    icon: 'bell',
    title: n.title,
    description: n.body,
    time: timeAgoFr(n.created_at),
    read: n.is_read,
    href: n.application_id ? `/app/applications/${n.application_id}` : undefined,
  }
}

interface AppContextValue {
  onboardingSeen: boolean
  markOnboardingSeen: () => void

  isAuthenticated: boolean
  authKind: AuthKind | 'employee' | null
  profileType: ProfileType | null
  loginCompanyUser: (email: string, password: string) => Promise<void>
  loginCandidateUser: (email: string, password: string) => Promise<void>
  loginEmployeeDemo: () => void
  registerCompanyUser: (input: { companyName: string; companySlug: string; email: string; password: string; fullName: string }) => Promise<void>
  registerCandidateUser: (input: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => void

  favorites: string[]
  toggleFavorite: (jobId: string) => void
  isFavorite: (jobId: string) => boolean

  applications: Application[]
  applicationsLoading: boolean
  refreshApplications: () => Promise<void>
  hasApplied: (jobId: string) => boolean
  applyToJob: (jobId: string) => Promise<Application>
  withdrawApplication: (applicationId: string) => Promise<void>

  conversations: Conversation[]
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  unreadMessagesCount: number

  notifications: NotificationItem[]
  refreshNotifications: () => Promise<void>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadNotificationsCount: number

  toast: string | null
  showToast: (message: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboardingSeen, setOnboardingSeen] = useLocalStorage('tl_onboarding_seen', false)
  const [favorites, setFavorites] = useLocalStorage<string[]>('tl_favorites', [])
  const [employeeDemo, setEmployeeDemo] = useLocalStorage('tl_employee_demo', false)

  const stored = getAuthToken()
  const [authKind, setAuthKind] = useState<AuthKind | 'employee' | null>(
    employeeDemo ? 'employee' : (stored?.kind ?? null),
  )

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const isAuthenticated = authKind !== null
  const profileType: ProfileType | null = authKind === 'company' ? 'recruiter' : authKind === 'candidate' ? 'candidate' : authKind === 'employee' ? 'employee' : null

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2600)
  }, [])

  const refreshApplications = useCallback(async () => {
    if (authKind !== 'candidate') return
    setApplicationsLoading(true)
    try {
      setApplications(await listMyApplications())
    } catch {
      // A logged-in candidate with a transient network/API error just sees
      // an empty list rather than a crashed screen — they can retry via
      // whatever triggers refreshApplications() again.
    } finally {
      setApplicationsLoading(false)
    }
  }, [authKind])

  const refreshNotifications = useCallback(async () => {
    if (authKind !== 'candidate') return
    try {
      const raw = await listMyNotifications()
      setNotifications(raw.map(notificationToItem))
    } catch {
      // ignore — notifications are non-critical, next refresh will retry
    }
  }, [authKind])

  useEffect(() => {
    if (authKind === 'candidate') {
      void refreshApplications()
      void refreshNotifications()
    }
  }, [authKind, refreshApplications, refreshNotifications])

  const value: AppContextValue = {
    onboardingSeen,
    markOnboardingSeen: () => setOnboardingSeen(true),

    isAuthenticated,
    authKind,
    profileType,

    loginCompanyUser: async (email, password) => {
      await loginCompany(email, password)
      setEmployeeDemo(false)
      setAuthKind('company')
    },
    loginCandidateUser: async (email, password) => {
      await loginCandidate(email, password)
      setEmployeeDemo(false)
      setAuthKind('candidate')
    },
    loginEmployeeDemo: () => {
      // No backend module covers payroll/leave/time-clock (out of the
      // original 7-module plan) — this profile stays a local-only demo,
      // never hits the API.
      clearAuthToken()
      setEmployeeDemo(true)
      setAuthKind('employee')
    },

    registerCompanyUser: async (input) => {
      await registerCompany({
        companyName: input.companyName,
        companySlug: input.companySlug,
        adminEmail: input.email,
        adminPassword: input.password,
        adminFullName: input.fullName,
      })
      setEmployeeDemo(false)
      setAuthKind('company')
    },
    registerCandidateUser: async (input) => {
      await registerCandidate(input)
      setEmployeeDemo(false)
      setAuthKind('candidate')
    },

    logout: () => {
      clearAuthToken()
      setEmployeeDemo(false)
      setAuthKind(null)
      setApplications([])
      setNotifications([])
    },

    favorites,
    toggleFavorite: (jobId) =>
      setFavorites((current) =>
        current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
      ),
    isFavorite: (jobId) => favorites.includes(jobId),

    applications,
    applicationsLoading,
    refreshApplications,
    hasApplied: (jobId) => applications.some((a) => a.jobId === jobId),
    applyToJob: async (jobId) => {
      const app = await applyToJobOffer(jobId)
      setApplications((current) => [app, ...current])
      showToast('Candidature envoyée avec succès !')
      return app
    },
    withdrawApplication: async (applicationId) => {
      const updated = await withdrawMyApplication(applicationId)
      setApplications((current) => current.map((a) => (a.id === applicationId ? updated : a)))
      showToast('Candidature retirée.')
    },

    conversations,
    sendMessage: (conversationId, text) => {
      const message: MessageItem = {
        id: `msg-${Date.now()}`,
        author: 'me',
        text,
        time: 'À l’instant',
      }
      setConversations((current) =>
        current.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], lastMessage: text, lastTime: 'À l’instant' }
            : c,
        ),
      )
    },
    markConversationRead: (conversationId) =>
      setConversations((current) => current.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))),
    unreadMessagesCount: conversations.reduce((sum, c) => sum + c.unread, 0),

    notifications,
    refreshNotifications,
    markNotificationRead: (id) => {
      setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)))
      if (authKind === 'candidate') void apiMarkNotificationRead(id)
    },
    markAllNotificationsRead: () => {
      setNotifications((current) => current.map((n) => ({ ...n, read: true })))
      if (authKind === 'candidate') void apiMarkAllNotificationsRead()
    },
    unreadNotificationsCount: notifications.filter((n) => !n.read).length,

    toast,
    showToast,
  }

  return <AppContext value={value}>{children}</AppContext>
}

export function useApp() {
  const ctx = use(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Exported for ApplicationDetail.tsx etc. that need a single fresh
// application by id rather than the whole list.
export { getMyApplication }
