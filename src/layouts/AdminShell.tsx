import { Outlet, useLocation, useNavigate, Navigate, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Building2, Briefcase, LogOut, ShieldAlert } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { getAuthToken, clearAuthToken } from '@/api/client'
import { cn } from '@/utils/cn'

const links = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/companies', label: 'Entreprises', icon: Building2 },
  { to: '/admin/job-offers', label: 'Offres', icon: Briefcase },
]

// Deliberately its own shell, not a role-conditional branch of
// RecruiterShell — this is a separate, unlisted space (see AdminLogin.tsx,
// not linked from the public Login.tsx tabs) for a third, independent
// identity (PlatformAdmin) that has nothing to do with the candidate/
// recruiter AppContext, so it doesn't use useApp() at all.
export function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuthToken()

  if (!auth || auth.kind !== 'admin') return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-dvh w-full bg-surface-muted">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-ink-950 lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo size={32} textClassName="text-[17px]" dark to="/admin" />
        </div>
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-2xl bg-white/5 p-3 text-white/70">
          <ShieldAlert className="size-4 shrink-0 text-orange-400" />
          <span className="text-xs font-semibold">Espace super-admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-white/10 font-semibold text-white ring-1 ring-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <l.icon className="size-[18px]" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => {
              clearAuthToken()
              navigate('/admin/login')
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="size-[18px]" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-surface-border bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold',
                  isActive ? 'bg-brand-blue-600 text-white shadow-sm shadow-brand-blue-500/30' : 'text-text-secondary hover:bg-surface-muted',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-6xl p-4 sm:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
