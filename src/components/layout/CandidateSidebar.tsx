import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Briefcase, FileText, MessageSquare, User, LogOut, Bell } from 'lucide-react'
import { Logo } from './Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { getMyCandidateProfile } from '@/api/candidates'
import { resolveUploadUrl } from '@/api/client'
import { candidateProfile } from '@/data/profile'
import { cn } from '@/utils/cn'

const links = [
  { to: '/app', label: 'Accueil', icon: Home },
  { to: '/app/jobs', label: 'Offres', icon: Briefcase },
  { to: '/app/applications', label: 'Candidatures', icon: FileText },
  { to: '/app/messages', label: 'Messages', icon: MessageSquare },
  { to: '/app/profile', label: 'Mon profil', icon: User },
]

// Desktop-only fixed sidebar (`hidden lg:flex`, same breakpoint and
// structure as RecruiterSidebar) — the candidate side never had one
// before; AppShell used to cap out at 480px on every screen size, so
// there was nothing to put a sidebar next to. See AppShell.tsx for the
// matching layout change.
export function CandidateSidebar() {
  const navigate = useNavigate()
  const { logout, unreadNotificationsCount, unreadMessagesCount } = useApp()
  const [displayName, setDisplayName] = useState(`${candidateProfile.firstName} ${candidateProfile.lastName}`)
  const [displayTitle, setDisplayTitle] = useState(candidateProfile.title)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(candidateProfile.avatar)

  useEffect(() => {
    getMyCandidateProfile()
      .then((p) => {
        setDisplayName(`${p.first_name} ${p.last_name}`)
        setDisplayTitle(p.headline ?? '')
        setAvatarUrl(p.photo_url ? resolveUploadUrl(p.photo_url) : undefined)
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white lg:flex">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo size={30} textClassName="text-[16px]" />
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted"
        >
          <Bell className="size-[18px]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      <button
        onClick={() => navigate('/app/profile')}
        className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-surface-muted p-3 text-left"
      >
        <Avatar name={displayName} src={avatarUrl} size={40} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-text-primary">{displayName}</span>
          <span className="block truncate text-xs text-text-secondary">{displayTitle}</span>
        </span>
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-blue-50 text-brand-blue-600' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
              )
            }
          >
            <l.icon className="size-[18px]" />
            {l.label}
            {l.to === '/app/messages' && unreadMessagesCount > 0 && (
              <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadMessagesCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-surface-border p-3">
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="size-[18px]" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
