import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, MapPin, Briefcase, User, Infinity as InfinityIcon, CheckCircle2,
  Bell, Calendar, FolderOpen, Umbrella, GraduationCap, Star, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

const slides = [
  {
    title: 'Trouvez le',
    highlight: 'bon emploi',
    description: 'Découvrez des milliers d’opportunités qui correspondent à vos compétences et à vos aspirations.',
  },
  {
    title: 'L’IA trouve le',
    highlight: 'meilleur match',
    description: 'Notre intelligence artificielle analyse vos compétences et vous connecte aux entreprises qui vous correspondent.',
  },
  {
    title: 'Gérez toute votre',
    highlight: 'carrière',
    description: 'Du recrutement à l’évolution, gérez tous les aspects de votre vie professionnelle au même endroit.',
  },
]

function SearchIllustration() {
  return (
    <div className="relative h-[260px] w-[280px]">
      <div className="absolute inset-6 rounded-[2.5rem] bg-brand-blue-50/70" />

      <div className="absolute top-14 left-3 w-48 -rotate-6 rounded-2xl border border-surface-border bg-white p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-green-50 text-[10px] font-extrabold text-green-700">BNA</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-text-primary">Développeur Full Stack</p>
            <p className="truncate text-[10px] text-text-secondary">Tunis, Tunisie</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600">CDI</span>
          <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[9px] font-bold text-white">Postuler</span>
        </div>
      </div>

      <div className="absolute top-1 right-3 flex size-16 rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-400 shadow-lg">
        <Search className="size-7 text-white" strokeWidth={2} />
      </div>

      <div className="absolute right-1 bottom-16 flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-2.5 py-1.5 shadow-md">
        <MapPin className="size-3 text-brand-green-500" />
        <span className="text-[10px] font-semibold text-text-primary">UX Designer · Sousse</span>
      </div>

      <div className="absolute bottom-1 left-14 flex -rotate-2 items-center gap-1.5 rounded-xl border border-surface-border bg-white px-2.5 py-1.5 shadow-md">
        <Briefcase className="size-3 text-brand-blue-500" />
        <span className="text-[10px] font-semibold text-text-primary">Chef de projet · Sfax</span>
      </div>

      <div className="absolute bottom-16 left-0 flex size-14 items-center justify-center rounded-full bg-brand-blue-100">
        <User className="size-7 text-brand-blue-600" />
      </div>
    </div>
  )
}

function MatchIllustration() {
  return (
    <div className="relative flex h-[260px] w-[280px] items-center justify-center">
      <div className="flex items-stretch gap-3">
        <div className="w-28 rounded-2xl border border-surface-border bg-white p-3 shadow-md">
          <p className="mb-2 text-[10px] font-bold text-text-secondary">Vos compétences</p>
          <div className="flex flex-wrap gap-1">
            {['Flutter', 'Dart', 'API', 'Agile'].map((s) => (
              <span key={s} className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 w-28 rounded-2xl border border-surface-border bg-white p-3 shadow-md">
          <p className="mb-2 text-[10px] font-bold text-text-secondary">Entreprise idéale</p>
          <div className="flex flex-wrap gap-1">
            {['Innovation', 'Équipe', 'Culture'].map((s) => (
              <span key={s} className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-600">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-[92px] flex size-14 items-center justify-center rounded-full border border-surface-border bg-white shadow-lg">
        <InfinityIcon className="size-7 text-brand-teal-500" strokeWidth={2.2} />
      </div>

      <div className="absolute bottom-6 flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1.5 shadow-md">
        <CheckCircle2 className="size-4 text-green-500" />
        <span className="text-[11px] font-bold text-green-600">Match trouvé ! 92% de compatibilité</span>
      </div>
    </div>
  )
}

const gridIcons = [Briefcase, Calendar, FolderOpen, Umbrella, GraduationCap, Star]
const gridLabels = ['Candidatures', 'Entretiens', 'Documents', 'Congés', 'Formations', 'Évaluations']

function DashboardIllustration() {
  return (
    <div className="relative flex h-[260px] w-[280px] items-center justify-center">
      <div className="w-44 rounded-[1.75rem] border-4 border-ink-900 bg-white p-3.5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold text-text-primary">Bonjour Yassine 👋</p>
          <Bell className="size-3 text-text-tertiary" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {gridIcons.map((Icon, i) => (
            <div key={gridLabels[i]} className="flex flex-col items-center gap-1 rounded-lg bg-surface-muted py-2.5">
              <Icon className="size-3.5 text-brand-blue-600" />
              <span className="text-[6px] font-medium text-text-tertiary">{gridLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-2 -bottom-2 flex items-center gap-2 rounded-xl border border-surface-border bg-white px-3 py-2 shadow-lg">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
          <Calendar className="size-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-text-primary">Entretien demain</p>
          <p className="text-[9px] text-text-secondary">10:00 · Chef de projet</p>
        </div>
      </div>
    </div>
  )
}

const illustrations = [SearchIllustration, MatchIllustration, DashboardIllustration]

export function Onboarding() {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const { markOnboardingSeen } = useApp()
  const slide = slides[index]
  const Illustration = illustrations[index]
  const isLast = index === slides.length - 1

  const finish = () => {
    markOnboardingSeen()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh w-full bg-white">
      <AuthBrandPanel />
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-brand-blue-500' : 'w-1.5 bg-surface-border')}
            />
          ))}
        </div>
        <button onClick={finish} className="text-sm font-medium text-text-secondary hover:text-text-primary">
          Passer
        </button>
      </div>

      <div className="mt-10">
        <h1 className="text-3xl leading-tight font-extrabold text-text-primary">
          {slide.title} <span className="text-brand-gradient">{slide.highlight}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{slide.description}</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Illustration />
          </motion.div>
        </AnimatePresence>
      </div>

      <Button size="lg" fullWidth onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}>
        {isLast ? 'Commencer' : 'Suivant'}
        <ArrowRight className="size-[18px]" />
      </Button>
      </div>
    </div>
  )
}
