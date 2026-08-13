import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/layout/Logo'
import { WaveBackground } from '@/components/shared/WaveBackground'
import { useApp } from '@/context/AppContext'

export function Splash() {
  const navigate = useNavigate()
  const { onboardingSeen, isAuthenticated, profileType } = useApp()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!onboardingSeen) navigate('/onboarding', { replace: true })
      else if (!isAuthenticated) navigate('/login', { replace: true })
      else navigate(profileType === 'recruiter' ? '/recruiter' : '/app', { replace: true })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [navigate, onboardingSeen, isAuthenticated, profileType])

  return (
    <div className="relative flex min-h-dvh w-full max-w-[480px] mx-auto flex-col items-center justify-center overflow-hidden bg-ink-950 px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center"
      >
        <Logo size={92} withText={false} />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
          <span className="text-white">Talent</span> <span className="text-brand-green-500">Link</span>
        </h1>
        <p className="mt-3 text-sm text-white/60">Connecter les talents, construire l’avenir.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="z-10 mt-20 flex flex-col items-center gap-4"
      >
        <span className="relative flex size-9 items-center justify-center">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-brand-blue-500 border-r-brand-green-500" />
        </span>
        <span className="text-xs font-medium text-white/50">Chargement en cours…</span>
      </motion.div>

      <WaveBackground />
    </div>
  )
}
