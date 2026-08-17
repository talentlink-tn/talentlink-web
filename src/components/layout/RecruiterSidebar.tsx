import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, BarChart3, Settings, LogOut, Bell } from 'lucide-react'
import { Logo } from './Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { getMyCompany, listMyTeam } from '@/api/companies'
import { getAuthToken } from '@/api/client'
import { recruiterProfile } from '@/data/profile'
import { cn } from '@/utils/cn'

const links = [
  { to: '/recruiter', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/recruiter/jobs', label: "Gestion des offres", icon: Briefcase },
  { to: '/recruiter/candidates', label: 'Candidatures', icon: Users },
  { to: '/recruiter/statistics', label: 'Statistiques', icon: BarChart3 },
]

export function RecruiterSidebar() {
  const navigate = useNavigate()
  const { logout, unreadNotificationsCount } = useApp()
  const [companyName, setCompanyName] = useState(recruiterProfile.title)
  const [userName, setUserName] = useState(recruiterProfile.name)

  useEffect(() => {
    getMyCompany().then((c) => setCompanyName(c.name)).catch(() => {})
    // No "who am I" endpoint distinct from the team list — resolve the
    // logged-in user's own name by matching the email cached at login
    // (api/client.ts's StoredAuth.email) against the team roster.
    const email = getAuthToken()?.email
    if (email) {
      listMyTeam()
        .then((team) => {
          const me = team.find((m) => m.email === email)
          if (me) setUserName(me.full_name)
        })
        .catch(() => {})
    }
  }, [])

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white lg:flex">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo size={34} textClassName="text-[17px]" to="/recruiter" />
        <button
          onClick={() => navigate('/recruiter/notifications')}
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

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
        <Avatar name={userName} src={recruiterProfile.avatar} size={40} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-text-primary">{userName}</span>
          <span className="block truncate text-xs text-text-secondary">{companyName}</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/recruiter'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                isActive ? 'bg-brand-blue-50 font-semibold text-brand-blue-600 shadow-sm shadow-brand-blue-500/10' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
              )
            }
          >
            <l.icon className="size-[18px]" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-surface-border p-3">
        <NavLink
          to="/recruiter/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
              isActive ? 'bg-brand-blue-50 font-semibold text-brand-blue-600 shadow-sm shadow-brand-blue-500/10' : 'text-text-secondary hover:bg-surface-muted',
            )
          }
        >
          <Settings className="size-[18px]" />
          Paramètres
        </NavLink>
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
