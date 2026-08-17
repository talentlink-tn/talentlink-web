import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, User, Mail, Phone, Lock, Check, Briefcase, Building2 } from 'lucide-react'
import { AuthBrandPanel } from '@/components/layout/AuthBrandPanel'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { ProfileType } from '@/types'

const tabs: { type: ProfileType; label: string; icon: typeof User }[] = [
  { type: 'candidate', label: 'Candidat', icon: User },
  { type: 'employee', label: 'Employé', icon: Briefcase },
  { type: 'recruiter', label: 'RH / Recruteur', icon: Building2 },
]

export function Register() {
  const navigate = useNavigate()
  const [type, setType] = useState<ProfileType>('candidate')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // The actual account is created on the next screen (ChooseProfile) —
    // this step only collects the fields; passing them through as
    // location state instead of discarding them like the original mock
    // did (it only forwarded `type`, since nothing here ever called a
    // real API before).
    navigate('/choose-profile', { state: { type, firstName, lastName, companyName, email, phone, password } })
  }

  return (
    <div className="flex min-h-dvh w-full bg-white">
      <AuthBrandPanel tagline="Rejoignez des milliers de talents et d’entreprises déjà connectés." />
      <div className="animate-fade-in mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-12">
      <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-muted lg:hidden" aria-label="Retour">
        <ChevronLeft className="size-5" />
      </button>

      <div className="mt-2 flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-ink-950">
          <img src="/icons/icon-192.png" alt="" className="size-10 rounded-xl" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-text-primary">
          Créer <span className="text-brand-blue-600">votre compte</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Rejoignez Talent Link et accédez à des opportunités exceptionnelles.</p>
      </div>

      <div className="mt-6 flex gap-1 rounded-full bg-surface-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setType(t.type)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors',
              type === t.type ? 'bg-white text-brand-blue-600 shadow-sm' : 'text-text-secondary',
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" placeholder="Entrez votre prénom" icon={<User className="size-[18px]" />} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Nom" placeholder="Entrez votre nom" icon={<User className="size-[18px]" />} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        {type === 'recruiter' && (
          <Input
            label="Nom de l’entreprise"
            placeholder="Entrez le nom de votre entreprise"
            icon={<Building2 className="size-[18px]" />}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        )}
        <Input label="Adresse e-mail" type="email" placeholder="Entrez votre adresse e-mail" icon={<Mail className="size-[18px]" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Téléphone" type="tel" placeholder="Entrez votre numéro de téléphone" icon={<Phone className="size-[18px]" />} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input label="Mot de passe" type="password" placeholder="Créez votre mot de passe" icon={<Lock className="size-[18px]" />} value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <CheckItem ok={checks.length} label="8 caractères minimum" />
          <CheckItem ok={checks.digit} label="Un chiffre" />
          <CheckItem ok={checks.upper} label="Une lettre majuscule" />
          <CheckItem ok={checks.special} label="Un caractère spécial" />
        </div>

        <Button type="submit" size="lg" fullWidth>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 mb-2 text-center text-sm text-text-secondary">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-brand-green-600 hover:underline">
          Se connecter
        </Link>
      </p>
      </div>
    </div>
  )
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-green-600' : 'text-text-tertiary')}>
      <span className={cn('flex size-3.5 items-center justify-center rounded-full', ok ? 'bg-green-100' : 'bg-surface-muted')}>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      {label}
    </span>
  )
}
