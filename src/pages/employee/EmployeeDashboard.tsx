import { useNavigate } from 'react-router-dom'
import { Clock, CalendarDays, FolderOpen, GraduationCap, ChevronRight, CalendarClock } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { candidateProfile } from '@/data/profile'

const quickLinks = [
  { to: '/app/clock', icon: Clock, label: 'Pointage', value: 'Présent aujourd’hui', time: '08:45', tone: 'bg-blue-50 text-blue-600' },
  { to: '/app/leave', icon: CalendarDays, label: 'Congés', value: '12 jours restants', tone: 'bg-green-50 text-green-600' },
  { to: '/app/documents', icon: FolderOpen, label: 'Documents', value: '5 documents disponibles', tone: 'bg-purple-50 text-purple-600' },
  { to: '/app/documents', icon: GraduationCap, label: 'Formations', value: '2 en cours', tone: 'bg-orange-50 text-orange-600' },
]

export function EmployeeDashboard() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="flex items-center gap-3">
        <Avatar name={`${candidateProfile.firstName} ${candidateProfile.lastName}`} src={candidateProfile.avatar} size={52} />
        <div>
          <h1 className="text-lg font-bold text-text-primary">Bonjour, {candidateProfile.firstName} 👋</h1>
          <p className="text-sm text-text-secondary">Voici un aperçu de votre activité.</p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {quickLinks.map((l) => (
          <button key={l.label} onClick={() => navigate(l.to)} className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 text-left">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${l.tone}`}>
              <l.icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary">{l.label}</span>
              <span className="block text-xs text-text-secondary">{l.value}</span>
            </span>
            {l.time && <span className="text-sm font-bold text-text-primary">{l.time}</span>}
            <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-base font-bold text-text-primary">Prochain événement</h2>
        <div className="flex items-center gap-3 rounded-2xl bg-brand-blue-50/60 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue-600">
            <CalendarClock className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Entretien annuel</p>
            <p className="text-xs text-text-secondary">15 Mai à 10:00</p>
          </div>
          <button onClick={() => navigate('/app/calendar')} className="text-xs font-semibold text-brand-blue-600">
            Voir mon agenda
          </button>
        </div>
      </div>
    </div>
  )
}
