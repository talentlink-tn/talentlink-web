import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Mail, Lock } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loginAdmin } from '@/api/admin'
import { ApiError } from '@/api/client'

// Deliberately unlisted — not a third tab on the public Login.tsx, no
// link to it from anywhere a normal visitor would see. Reachable only by
// typing /admin/login directly, matching the "not discoverable" design
// decision for this surface.
export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginAdmin(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo size={56} withText={false} />
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-white/70">
            <ShieldAlert className="size-4 text-orange-400" />
            <span className="text-xs font-semibold">Espace super-admin</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Connexion administrateur</h1>
          <p className="mt-1 text-sm text-white/50">Accès réservé à l'équipe Talent Link.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-5">
          <Input
            label="Adresse e-mail"
            type="email"
            placeholder="admin@talentlink.tn"
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
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  )
}
