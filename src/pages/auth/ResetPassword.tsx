import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { resetPassword } from '@/api/auth'
import { ApiError } from '@/api/client'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh w-full bg-white">
      <AuthBrandPanel />
      <div className="animate-fade-in mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-12">
        <div className="flex flex-col items-center text-center">
          <Logo size={70} withText={false} />
        </div>

        {!token ? (
          <div className="mt-8 text-center">
            <h2 className="text-xl font-bold text-text-primary">Lien invalide</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Ce lien de réinitialisation est incomplet. Demandez-en un nouveau depuis la page de connexion.
            </p>
            <Link to="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-brand-blue-600 hover:underline">
              Demander un nouveau lien
            </Link>
          </div>
        ) : done ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-10 text-brand-green-600" />
            <h2 className="text-xl font-bold text-text-primary">Mot de passe mis à jour</h2>
            <p className="text-sm text-text-secondary">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <Button size="lg" fullWidth className="mt-2" onClick={() => navigate('/login', { replace: true })}>
              Aller à la connexion
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <h2 className="text-xl font-bold text-text-primary">Choisissez un nouveau mot de passe</h2>
              <p className="mt-1 text-sm text-text-secondary">Au moins 8 caractères.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                icon={<Lock className="size-[18px]" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                icon={<Lock className="size-[18px]" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="lg" fullWidth loading={loading}>
                Réinitialiser le mot de passe
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
