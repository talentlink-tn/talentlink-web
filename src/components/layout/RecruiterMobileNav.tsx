import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/recruiter', label: 'Accueil', icon: LayoutDashboard },
  { to: '/recruiter/jobs', label: 'Offres', icon: Briefcase },
  { to: '/recruiter/candidates', label: 'Candidats', icon: Users },
  { to: '/recruiter/statistics', label: 'Stats', icon: BarChart3 },
  { to: '/recruiter/settings', label: 'Réglages', icon: Settings },
]

// Same active-indicator treatment as BottomNav.tsx (candidate side) —
// this had fallen behind with no gradient pill / hover state / active
// icon weight, while the candidate nav already had all three.
export function RecruiterMobileNav() {
  return (
    <nav className="sticky bottom-0 z-30 flex items-stretch justify-around border-t border-surface-border bg-white/95 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/recruiter'}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium',
              isActive ? 'font-semibold text-brand-blue-600' : 'text-text-tertiary hover:text-text-secondary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
              {isActive && <span className="absolute -top-1.5 h-1 w-5 rounded-full bg-brand-gradient" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
