import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { ApiError } from '@/api/client'
import type { ProfileType } from '@/types'

export function Login() {
  const navigate = useNavigate()
  const { loginCompanyUser, loginCandidateUser, loginEmployeeDemo, showToast } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [asType, setAsType] = useState<Exclude<ProfileType, 'employee'>>('candidate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (asType === 'recruiter') {
        await loginCompanyUser(email, password)
        navigate('/recruiter', { replace: true })
      } else {
        await loginCandidateUser(email, password)
        navigate('/app', { replace: true })
      }
      showToast('Connexion réussie !')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const quickEmployeeLogin = () => {
    loginEmployeeDemo()
    showToast('Connexion réussie !')
    navigate('/app', { replace: true })
  }

  return (
    <div className="flex min-h-dvh w-full bg-white">
      <AuthBrandPanel />
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-12">
      <div className="flex flex-col items-center text-center">
        <Logo size={70} withText={false} />
        <h1 className="mt-4 text-2xl font-extrabold text-text-primary">
          Talent <span className="text-brand-green-500">Link</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Connecter les talents, construire l’avenir.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-text-primary">Bienvenue !</h2>
        <p className="mt-1 text-sm text-text-secondary">Connectez-vous pour accéder à votre espace.</p>
      </div>

      <div className="mt-5 flex gap-1 rounded-full bg-surface-muted p-1">
        <button
          type="button"
          onClick={() => setAsType('candidate')}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${asType === 'candidate' ? 'bg-white text-brand-blue-600 shadow-sm' : 'text-text-secondary'}`}
        >
          Candidat
        </button>
        <button
          type="button"
          onClick={() => setAsType('recruiter')}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${asType === 'recruiter' ? 'bg-white text-brand-blue-600 shadow-sm' : 'text-text-secondary'}`}
        >
          RH / Recruteur
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="Entrez votre adresse e-mail"
          icon={<Mail className="size-[18px]" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="Entrez votre mot de passe"
          icon={<Lock className="size-[18px]" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button type="button" className="text-sm font-medium text-brand-blue-600 hover:underline">
            Mot de passe oublié ?
          </button>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Se connecter
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="text-xs text-text-tertiary">ou</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <div className="rounded-xl bg-surface-muted p-3 text-center text-xs text-text-tertiary">
        Profil « Employé » — démo visuelle uniquement, sans compte réel :{' '}
        <button onClick={quickEmployeeLogin} className="font-semibold text-brand-blue-600">
          Continuer en tant qu’employé
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Vous n’avez pas de compte ?{' '}
        <Link to="/register" className="font-semibold text-brand-green-600 hover:underline">
          S’inscrire
        </Link>
      </p>
      </div>
    </div>
  )
}
