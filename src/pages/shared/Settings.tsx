import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Lock, Mail, Trash2, Bell, Globe, Moon, MapPin, Info, HelpCircle, Shield, ChevronRight, LogOut,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { candidateProfile, recruiterProfile } from '@/data/profile'
import { getMyCandidateProfile } from '@/api/candidates'
import { getMyCompany, listMyTeam } from '@/api/companies'
import { getAuthToken, resolveUploadUrl } from '@/api/client'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'

export function Settings() {
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { logout, showToast, profileType } = useApp()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [name, setName] = useState(profileType === 'recruiter' ? recruiterProfile.name : `${candidateProfile.firstName} ${candidateProfile.lastName}`)
  const [subtitle, setSubtitle] = useState(profileType === 'recruiter' ? recruiterProfile.title : candidateProfile.title)
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(profileType === 'recruiter' ? recruiterProfile.avatar : candidateProfile.avatar)

  useEffect(() => {
    const email = getAuthToken()?.email
    if (profileType === 'recruiter') {
      getMyCompany().then((c) => setSubtitle(c.name)).catch(() => {})
      if (email) {
        listMyTeam()
          .then((team) => {
            const me = team.find((m) => m.email === email)
            if (me) setName(me.full_name)
          })
          .catch(() => {})
      }
    } else if (profileType === 'candidate') {
      getMyCandidateProfile()
        .then((p) => {
          setName(`${p.first_name} ${p.last_name}`)
          setSubtitle(p.headline || 'Titre professionnel non renseigné')
          if (p.photo_url) setAvatarSrc(resolveUploadUrl(p.photo_url))
        })
        .catch(() => {})
    }
  }, [profileType])

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Paramètres" />
      <p className="mt-4 mb-4 text-sm text-text-secondary">Gérez votre compte et vos préférences</p>

      <button onClick={() => navigate(`${basePath}/profile`)} className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-3.5">
        <Avatar name={name} src={avatarSrc} size={52} />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-bold text-text-primary">{name}</span>
          <span className="block truncate text-xs text-text-secondary">{subtitle}</span>
        </span>
        <ChevronRight className="size-4 text-text-tertiary" />
      </button>

      <SectionLabel>Compte</SectionLabel>
      <Group>
        <Row icon={User} label="Informations personnelles" desc="Gérez vos informations de compte" onClick={() => navigate(`${basePath}/profile/edit`)} />
        <Row icon={Lock} label="Sécurité et connexion" desc="Mot de passe, authentification à deux facteurs" onClick={() => showToast('Sécurité à jour.')} />
        <Row icon={Mail} label="Email & notifications" desc="Préférences de réception des emails" onClick={() => showToast('Préférences enregistrées.')} />
        <Row icon={Trash2} label="Supprimer mon compte" desc="Supprimer définitivement votre compte" danger onClick={() => showToast('Contactez le support pour supprimer votre compte.')} />
      </Group>

      <SectionLabel>Préférences</SectionLabel>
      <Group>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <Bell className="size-4" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-primary">Notifications push</span>
            <span className="block text-xs text-text-tertiary">Gérez vos notifications push</span>
          </span>
          <Switch checked={pushEnabled} onChange={setPushEnabled} />
        </div>
        <Row icon={Globe} label="Langue de l'application" desc="Français" onClick={() => showToast('Langue : Français')} />
        <Row icon={Moon} label="Thème de l'application" desc="Clair" onClick={() => showToast('Le mode sombre arrive bientôt.')} />
        <Row icon={MapPin} label="Localisation" desc="Gérez vos préférences de localisation" onClick={() => showToast('Localisation : Tunis, Tunisie')} />
      </Group>

      <SectionLabel>À propos</SectionLabel>
      <Group>
        <Row icon={Info} label="À propos de Talent Link" desc="Version 1.0.0" onClick={() => showToast('Talent Link v1.0.0')} />
        <Row icon={HelpCircle} label="Aide et support" desc="FAQ et assistance" onClick={() => navigate(`${basePath}/help`)} />
        <Row icon={Shield} label="Conditions d'utilisation" desc="Politique de confidentialité" onClick={() => showToast('Ouverture des conditions…')} />
      </Group>

      <Button
        variant="outline"
        fullWidth
        size="lg"
        className="mt-6 border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => {
          logout()
          navigate('/login')
        }}
      >
        <LogOut className="size-[18px]" />
        Se déconnecter
      </Button>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <h3 className="mt-6 mb-2 px-1 text-xs font-bold tracking-wide text-text-tertiary uppercase">{children}</h3>
}

function Group({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-white">{children}</div>
}

function Row({
  icon: Icon,
  label,
  desc,
  onClick,
  danger,
}: {
  icon: typeof User
  label: string
  desc: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${danger ? 'bg-red-50 text-red-500' : 'bg-brand-blue-50 text-brand-blue-600'}`}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${danger ? 'text-red-600' : 'text-text-primary'}`}>{label}</span>
        <span className="block truncate text-xs text-text-tertiary">{desc}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
    </button>
  )
}
