import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TopHeader } from '@/components/layout/TopHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { CandidateSidebar } from '@/components/layout/CandidateSidebar'
import { useApp } from '@/context/AppContext'

export function AppShell() {
  const location = useLocation()
  const { isAuthenticated, profileType } = useApp()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profileType === 'recruiter') return <Navigate to="/recruiter" replace />

  return (
    // Below `lg` this renders exactly as before: CandidateSidebar is
    // `hidden` (contributes no width) and the inner column keeps its
    // mobile max-w-[480px] cap — the phone-mockup shadow/rounding it
    // used to also apply at `lg` (regardless of screen width) is now
    // superseded by the real sidebar layout at that breakpoint instead.
    // Matches RecruiterShell's structure exactly (see that file) rather
    // than inventing a second pattern.
    <div className="flex min-h-dvh w-full bg-surface-muted">
      <CandidateSidebar />
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-1 flex-col sm:my-0 sm:shadow-[0_0_0_1px_rgba(15,23,42,0.06)] lg:mx-0 lg:max-w-none lg:shadow-none">
        <TopHeader />
        <main className="no-scrollbar flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full lg:max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
