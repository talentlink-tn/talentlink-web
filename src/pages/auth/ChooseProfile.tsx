import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Briefcase, Building2, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { ApiError } from '@/api/client'
import { cn } from '@/utils/cn'
import type { ProfileType } from '@/types'

interface RegisterState {
  type?: ProfileType
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  password?: string
}

const profiles: {
  type: ProfileType
  title: string
  description: string
  icon: typeof User
  tint: string
  chips: string[]
}[] = [
  {
    type: 'candidate',
    title: 'Candidat',
    description: 'Je recherche des opportunités et souhaite développer ma carrière.',
    icon: User,
    tint: 'bg-blue-50 text-blue-600',
    chips: ["Recherche d'emploi", 'Candidatures', 'Mon CV'],
  },
  {
    type: 'employee',
    title: 'Employé',
    description: 'Je suis employé et souhaite accéder à mes outils et informations RH.',
    icon: Briefcase,
    tint: 'bg-green-50 text-green-600',
    chips: ['Pointage', 'Congés', 'Documents', 'Formations'],
  },
  {
    type: 'recruiter',
    title: 'RH / Recruteur',
    description: 'Je recrute, gère les talents et suis les processus RH de l’entreprise.',
    icon: Building2,
    tint: 'bg-purple-50 text-purple-600',
    chips: ['Gestion des talents', 'Recrutement', 'Analyses'],
  },
]

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function ChooseProfile() {
  const location = useLocation() as { state?: RegisterState }
  const navigate = useNavigate()
  const { registerCompanyUser, registerCandidateUser, loginEmployeeDemo, showToast } = useApp()
  const data = location.state ?? {}
  const [selected, setSelected] = useState<ProfileType>(data.type ?? 'candidate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (selected === 'employee') {
      // No backend module covers this profile (see AppContext) — stays a
      // local-only demo regardless of what was typed on the form before.
      loginEmployeeDemo()
      navigate('/app', { replace: true })
      return
    }

    if (!data.email || !data.password) {
      // Reached directly (e.g. browser back/forward) without the form
      // data this screen needs to actually create an account.
      navigate('/register', { replace: true })
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (selected === 'recruiter') {
        await registerCompanyUser({
          companyName: data.companyName || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Mon entreprise',
          companySlug: slugify(data.companyName || `${data.firstName ?? ''}-${Date.now()}`),
          email: data.email,
          password: data.password,
          fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        })
        navigate('/recruiter', { replace: true })
      } else {
        await registerCandidateUser({
          email: data.email,
          password: data.password,
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
        })
        navigate('/app', { replace: true })
      }
      showToast('Compte créé avec succès !')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer le compte pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-white px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-ink-950">
          <img src="/icons/icon-192.png" alt="" className="size-10 rounded-xl" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-text-primary">Choisissez votre profil</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Sélectionnez le profil qui correspond le mieux à votre activité sur Talent Link.
        </p>
      </div>

      <div className="mt-7 flex-1 space-y-3.5">
        {profiles.map((p) => {
          const active = selected === p.type
          return (
            <button
              key={p.type}
              onClick={() => setSelected(p.type)}
              className={cn(
                'block w-full rounded-2xl border-2 p-4 text-left transition-colors',
                active ? 'border-brand-blue-500 bg-brand-blue-50/40' : 'border-surface-border bg-white',
              )}
            >
              <div className="flex items-start gap-3.5">
                <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', p.tint)}>
                  <p.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="text-base font-bold text-text-primary">{p.title}</span>
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                        active ? 'border-brand-blue-500' : 'border-surface-border',
                      )}
                    >
                      {active && <span className="size-2.5 rounded-full bg-brand-blue-500" />}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-text-secondary">{p.description}</span>
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    {p.chips.map((c) => (
                      <span key={c} className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', p.tint)}>
                        {c}
                      </span>
                    ))}
                  </span>
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {error && <p className="mb-2 text-center text-sm text-red-600">{error}</p>}

      <Button size="lg" fullWidth onClick={handleContinue} loading={loading} className="mt-2">
        Continuer
        <ArrowRight className="size-[18px]" />
      </Button>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-muted p-3.5">
        <Lock className="size-5 shrink-0 text-text-tertiary" />
        <div>
          <p className="text-xs font-semibold text-text-primary">Vos données sont sécurisées</p>
          <p className="text-[11px] text-text-tertiary">Nous protégeons vos informations personnelles et respectons votre confidentialité.</p>
        </div>
      </div>
    </div>
  )
}
