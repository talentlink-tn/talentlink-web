import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { forgotPassword } from '@/api/auth'
import { ApiError } from '@/api/client'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotPassword(email)
      // Always shown on success, regardless of whether the email
      // actually matched an account — see the backend's same-response
      // guarantee (no account enumeration via this form).
      setSent(true)
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

        <div className="mt-8">
          <h2 className="text-xl font-bold text-text-primary">Mot de passe oublié ?</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Indiquez votre adresse e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe.
          </p>
        </div>

        {sent ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-surface-muted p-6 text-center">
            <CheckCircle2 className="size-8 text-brand-green-600" />
            <p className="text-sm text-text-primary">
              Si un compte existe avec l'adresse <span className="font-semibold">{email}</span>, un e-mail de
              réinitialisation vient d'être envoyé.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Adresse e-mail"
              type="email"
              placeholder="Entrez votre adresse e-mail"
              icon={<Mail className="size-[18px]" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="lg" fullWidth loading={loading}>
              Envoyer le lien de réinitialisation
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
