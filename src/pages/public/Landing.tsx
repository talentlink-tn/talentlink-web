import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Sparkles, Workflow, Smartphone, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { WaveBackground } from '@/components/shared/WaveBackground'

const features = [
  {
    icon: Sparkles,
    title: 'Matching IA détaillé',
    description:
      'Chaque candidature reçoit un score de compatibilité calculé sur les compétences, l’expérience, la formation et les langues — pas une simple liste triée par date.',
  },
  {
    icon: Workflow,
    title: 'Le recrutement de A à Z',
    description:
      'Offres, candidatures, entretiens et messagerie centralisés au même endroit, de la publication d’un poste jusqu’à la décision finale.',
  },
  {
    icon: Smartphone,
    title: 'Web et mobile',
    description:
      'La même expérience, synchronisée en temps réel, que vous recrutiez depuis un ordinateur au bureau ou depuis votre téléphone entre deux réunions.',
  },
  {
    icon: ShieldCheck,
    title: 'Données isolées et sécurisées',
    description:
      'Chaque entreprise et chaque candidat n’accède qu’à ses propres données, une isolation appliquée au niveau de la base de données elle-même.',
  },
]

// Discrete fade-in + slight upward translation on scroll, once per
// section — not a full animation library, just framer-motion's
// whileInView (already a project dependency, used on Splash/Onboarding
// for mount transitions, just not yet for scroll-triggered reveals).
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Marketing landing page — deliberately its own route (/accueil), not
// "/": Splash.tsx stays at "/" as the app's real entry point (native-
// app-style boot screen, unauthenticated-visitor redirect logic lives
// there). This page is a genuine desktop-first vitrine for people
// arriving from an external/shared link, something that didn't exist
// anywhere in the repo before — no pricing, no testimonials (deliberate
// scope), reuses the established ink-950 + blue/green gradient + wave
// identity from Splash/AuthBrandPanel rather than inventing a new look.
export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Logo size={34} />
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
            >
              Se connecter
            </button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Créer un compte
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 px-6 py-24 text-center lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-2xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            <Sparkles className="size-3.5 text-brand-green-400" />
            Propulsé par l’IA
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
            Le recrutement, <span className="text-brand-gradient">réinventé</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/60 lg:text-lg">
            Talent Link connecte candidats et entreprises grâce à un matching IA précis — de la
            première candidature à l’entretien, sur web et mobile.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/register')}>
              Commencer gratuitement
              <ArrowRight className="size-[18px]" />
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 text-base font-semibold text-white transition-all duration-150 hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
            >
              Se connecter
            </button>
          </div>
        </motion.div>
        <WaveBackground />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary lg:text-4xl">
            Tout ce qu’il faut pour recruter intelligemment
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-surface-border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue-200 hover:shadow-lg">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-ink-950 px-6 py-20 text-center lg:py-24">
        <Reveal className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Prêt à passer à la vitesse supérieure ?
          </h2>
          <p className="mt-4 text-white/60">Rejoignez Talent Link en quelques minutes, gratuitement.</p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Créer un compte gratuitement
              <ArrowRight className="size-[18px]" />
            </Button>
          </div>
        </Reveal>
        <WaveBackground />
      </section>

      <footer className="border-t border-surface-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size={28} />
          <div className="flex items-center gap-5 text-xs text-text-tertiary">
            <Link to="/terms" className="hover:text-text-secondary hover:underline">
              Conditions d'utilisation
            </Link>
            <Link to="/privacy-policy" className="hover:text-text-secondary hover:underline">
              Politique de confidentialité
            </Link>
          </div>
          <p className="text-xs text-text-tertiary">© {new Date().getFullYear()} Talent Link. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
