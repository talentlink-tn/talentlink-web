import { NavLink } from 'react-router-dom'
import { Home, Briefcase, FileText, MessageSquare, User, Clock, CalendarDays, FolderOpen } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof Home
  badge?: number
}

export function BottomNav() {
  const { profileType, unreadMessagesCount } = useApp()

  const candidateItems: NavItem[] = [
    { to: '/app', label: 'Accueil', icon: Home },
    { to: '/app/jobs', label: 'Offres', icon: Briefcase },
    { to: '/app/applications', label: 'Candidatures', icon: FileText },
    { to: '/app/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { to: '/app/profile', label: 'Profil', icon: User },
  ]

  const employeeItems: NavItem[] = [
    { to: '/app', label: 'Accueil', icon: Home },
    { to: '/app/clock', label: 'Pointage', icon: Clock },
    { to: '/app/leave', label: 'Congés', icon: CalendarDays },
    { to: '/app/documents', label: 'Documents', icon: FolderOpen },
    { to: '/app/profile', label: 'Profil', icon: User },
  ]

  const items = profileType === 'employee' ? employeeItems : candidateItems

  return (
    <nav className="sticky bottom-0 z-30 flex items-stretch justify-around border-t border-surface-border bg-white/95 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/app'}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-brand-blue-600' : 'text-text-tertiary hover:text-text-secondary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <item.icon className="size-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                {!!item.badge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
              {isActive && <span className="absolute -top-1.5 h-1 w-5 rounded-full bg-brand-gradient" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
