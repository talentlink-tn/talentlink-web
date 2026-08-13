import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, ChevronRight, User, Briefcase, Star, Sliders, Shield, Send, LogOut, FileText } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { candidateProfile, recruiterProfile } from '@/data/profile'
import { getMyCandidateProfile, type CandidateProfileRaw } from '@/api/candidates'
import { getMyCompany, getDashboardSummary, listMyTeam, type DashboardSummaryRaw } from '@/api/companies'
import { getAuthToken, resolveUploadUrl } from '@/api/client'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'

export function Profile() {
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { profileType, applications, logout } = useApp()

  if (profileType === 'recruiter') {
    return <RecruiterProfile navigate={navigate} basePath={basePath} logout={logout} />
  }

  return <CandidateProfile navigate={navigate} basePath={basePath} applicationsCount={applications.length} logout={logout} />
}

function RecruiterProfile({
  navigate,
  basePath,
  logout,
}: {
  navigate: ReturnType<typeof useNavigate>
  basePath: string
  logout: () => void
}) {
  const [companyName, setCompanyName] = useState('')
  const [userName, setUserName] = useState(recruiterProfile.name)
  const [summary, setSummary] = useState<DashboardSummaryRaw | null>(null)

  useEffect(() => {
    getMyCompany().then((c) => setCompanyName(c.name)).catch(() => {})
    getDashboardSummary().then(setSummary).catch(() => {})
    const email = getAuthToken()?.email
    if (email) {
      listMyTeam()
        .then((team) => {
          const me = team.find((m) => m.email === email)
          if (me) setUserName(me.full_name)
        })
        .catch(() => {})
    }
  }, [])

  return (
    <div className="px-4 pt-4 pb-8 lg:mx-auto lg:max-w-2xl lg:px-0">
      <div className="flex items-center gap-4">
        <Avatar name={userName} src={recruiterProfile.avatar} size={72} />
        <div>
          <h1 className="text-lg font-bold text-text-primary lg:text-xl">{userName}</h1>
          <p className="text-sm text-text-secondary">{companyName || recruiterProfile.title}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat label="Offres actives" value={summary ? String(summary.active_job_offers) : '—'} />
        <MiniStat label="Candidatures" value={summary ? String(summary.total_applications) : '—'} />
        <MiniStat label="Derniers 30j" value={summary ? String(summary.applications_last_30_days) : '—'} />
      </div>
      <div className="mt-6 space-y-1">
        <ProfileLink icon={Settings} label="Paramètres" onClick={() => navigate(`${basePath}/settings`)} />
        <ProfileLink icon={LogOut} label="Se déconnecter" danger onClick={logout} />
      </div>
    </div>
  )
}

function CandidateProfile({
  navigate,
  basePath,
  applicationsCount,
  logout,
}: {
  navigate: ReturnType<typeof useNavigate>
  basePath: string
  applicationsCount: number
  logout: () => void
}) {
  const { favorites } = useApp()
  const [profile, setProfile] = useState<CandidateProfileRaw | null>(null)

  useEffect(() => {
    getMyCandidateProfile().then(setProfile).catch(() => {})
  }, [])

  // Only fall back to the mock demo person's data while the real profile
  // is still loading (avoids a blank flash) — once `profile` has loaded,
  // an empty field means the candidate genuinely hasn't filled it in yet,
  // so it must render empty rather than silently show mock data.
  const name = profile ? `${profile.first_name} ${profile.last_name}` : `${candidateProfile.firstName} ${candidateProfile.lastName}`
  const headline = profile ? profile.headline ?? '' : candidateProfile.title
  const about = profile ? profile.about ?? '' : candidateProfile.about
  const phone = profile ? profile.phone ?? '' : candidateProfile.phone
  const languages = profile ? profile.languages.map((l) => l.language).join(', ') : candidateProfile.languages.join(', ')
  const completion = profile?.completion_percent ?? candidateProfile.completion
  const experienceCount = profile ? profile.experiences.length : candidateProfile.experiences.length
  const educationCount = profile ? profile.educations.length : candidateProfile.educations.length
  const skillCount = profile ? profile.skills.length : candidateProfile.skills.length
  const hasCv = profile ? !!profile.cv_file_url : true

  return (
    <div className="px-4 pt-4 pb-8 lg:mx-auto lg:max-w-2xl lg:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text-primary lg:text-2xl">Mon profil</h1>
        <button onClick={() => navigate(`${basePath}/settings`)} className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted">
          <Settings className="size-[18px]" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Avatar name={name} src={profile?.photo_url ? resolveUploadUrl(profile.photo_url) : candidateProfile.avatar} size={76} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-text-primary">{name}</h2>
          <p className="truncate text-sm text-text-secondary">{headline || 'Titre professionnel non renseigné'}</p>
        </div>
        <ProgressRing value={completion} size={60} label="complété" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat icon={Briefcase} label="Expériences" value={String(experienceCount)} />
        <MiniStat icon={Star} label="Formations" value={String(educationCount)} />
        <MiniStat icon={Shield} label="Compétences" value={String(skillCount)} />
      </div>

      <button
        onClick={() => navigate(`${basePath}/profile/cv`)}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-3.5"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <FileText className="size-4" />
        </span>
        <span className="flex-1 text-left text-sm font-semibold text-text-primary">Voir mon CV</span>
        <span
          className={
            hasCv
              ? 'rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-600'
              : 'rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-tertiary'
          }
        >
          {hasCv ? 'À jour' : 'Non ajouté'}
        </span>
        <ChevronRight className="size-4 text-text-tertiary" />
      </button>

      {about && (
        <div className="mt-5 rounded-2xl border border-surface-border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">À propos de moi</h3>
            <button onClick={() => navigate(`${basePath}/profile/edit`)} className="text-xs font-semibold text-brand-blue-600">
              Modifier
            </button>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{about}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-surface-border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Informations personnelles</h3>
          <button onClick={() => navigate(`${basePath}/profile/edit`)} className="text-xs font-semibold text-brand-blue-600">
            Modifier
          </button>
        </div>
        <div className="space-y-2.5">
          {profile?.email && <InfoLine label="Email" value={profile.email} />}
          {phone && <InfoLine label="Téléphone" value={phone} />}
          {languages && <InfoLine label="Langues" value={languages} />}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-bold text-text-primary">Mon activité</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <MiniStat icon={Send} label="Candidatures" value={String(applicationsCount)} small />
          <MiniStat icon={User} label="Favoris" value={String(favorites.length)} small />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <ProfileLink icon={Sliders} label="Préférences" onClick={() => navigate(`${basePath}/settings`)} />
        <ProfileLink icon={LogOut} label="Se déconnecter" danger onClick={logout} />
      </div>

      <Button fullWidth size="lg" className="mt-5" onClick={() => navigate(`${basePath}/profile/edit`)}>
        Compléter mon profil
      </Button>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, small }: { icon?: typeof Briefcase; label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white py-3 text-center">
      {Icon && <Icon className="mx-auto mb-1 size-4 text-brand-blue-500" />}
      <p className={small ? 'text-sm font-bold text-text-primary' : 'text-base font-bold text-text-primary'}>{value}</p>
      <p className="px-1 text-[10px] leading-tight text-text-tertiary">{label}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="truncate text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}

function ProfileLink({ icon: Icon, label, onClick, danger }: { icon: typeof Settings; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${danger ? 'text-red-600 hover:bg-red-50' : 'text-text-primary hover:bg-surface-muted'}`}
    >
      <Icon className="size-[18px]" />
      {label}
    </button>
  )
}
