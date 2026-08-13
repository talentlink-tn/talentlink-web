import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar'
import { RecruiterMobileNav } from '@/components/layout/RecruiterMobileNav'
import { Logo } from '@/components/layout/Logo'
import { Bell } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'

export function RecruiterShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, profileType, unreadNotificationsCount } = useApp()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profileType !== 'recruiter') return <Navigate to="/app" replace />

  return (
    <div className="flex min-h-dvh w-full bg-surface-muted">
      <RecruiterSidebar />
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Logo size={28} textClassName="text-[16px]" />
          <button onClick={() => navigate('/recruiter/notifications')} className="relative flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted">
            <Bell className="size-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
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
        <RecruiterMobileNav />
      </div>
    </div>
  )
}
