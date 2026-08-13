import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Calendar, Clock, Video, Phone, Building2, MapPin, Download, BookOpen, ListChecks, HelpCircle, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getJob } from '@/data/jobs'
import {
  downloadMyInterviewIcs,
  listMyApplicationInterviews,
  type InterviewForCandidateRaw,
} from '@/api/candidates'
import { useApp, getMyApplication } from '@/context/AppContext'

const prepItems = [
  { icon: BookOpen, title: 'Relisez la description du poste', desc: 'Comprenez bien les missions et responsabilités.' },
  { icon: Building2, title: "Découvrez l'entreprise", desc: 'Informez-vous sur ses valeurs et ses projets.' },
  { icon: ListChecks, title: 'Préparez des exemples', desc: 'Mettez en avant vos réalisations et compétences clés.' },
  { icon: HelpCircle, title: 'Questions fréquentes', desc: 'Consultez les questions les plus posées en entretien.' },
]

const kindLabel: Record<InterviewForCandidateRaw['kind'], string> = {
  hr: 'Entretien RH',
  technical: 'Entretien technique',
  test: 'Test',
  other: 'Entretien',
}
const formatLabel: Record<InterviewForCandidateRaw['format'], string> = {
  video: 'Visioconférence',
  phone: 'Téléphone',
  on_site: 'Sur site',
}
const formatIcon: Record<InterviewForCandidateRaw['format'], typeof Video> = {
  video: Video,
  phone: Phone,
  on_site: Building2,
}

// The mocked version of this screen let the candidate pick from several
// proposed time slots — the real backend (module 7) deliberately doesn't
// support that negotiation: a recruiter schedules one specific time
// directly, and the candidate's view is read-only plus a calendar
// export. See this repo's README decisions log.
export function InterviewDetail() {
  const { applicationId } = useParams()
  const { applications, showToast } = useApp()
  const [interview, setInterview] = useState<InterviewForCandidateRaw | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const [jobTitle, setJobTitle] = useState<string | undefined>(undefined)
  const applicationFromContext = applications.find((a) => a.id === applicationId)

  useEffect(() => {
    if (!applicationId) return
    listMyApplicationInterviews(applicationId)
      .then((list) => setInterview(list[list.length - 1] ?? null))
      .catch(() => setInterview(null))
      .finally(() => setLoading(false))
  }, [applicationId])

  // Same full-reload race as ApplicationDetail.tsx: on a direct nav the
  // `applications` context array may not be populated yet, so fall back
  // to fetching this one application directly for its job title.
  useEffect(() => {
    if (applicationFromContext) {
      setJobTitle(getJob(applicationFromContext.jobId)?.title)
      return
    }
    if (!applicationId) return
    getMyApplication(applicationId)
      .then((app) => setJobTitle(getJob(app.jobId)?.title))
      .catch(() => {})
  }, [applicationId, applicationFromContext])

  if (!loading && !interview) return <Navigate to="/app/applications" replace />
  if (loading) return null

  const handleDownload = async () => {
    if (!interview) return
    setDownloading(true)
    try {
      const blob = await downloadMyInterviewIcs(interview.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `entretien-${interview.id}.ics`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast("Impossible de télécharger l'événement.")
    } finally {
      setDownloading(false)
    }
  }

  const iv = interview!
  const Icon = formatIcon[iv.format]
  const scheduledAt = new Date(iv.scheduled_at)

  return (
    <div className="pb-6">
      <PageHeader title={kindLabel[iv.kind]} />

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-text-primary">{jobTitle}</h1>
          </div>
          <Badge tone={iv.status === 'scheduled' ? 'blue' : iv.status === 'completed' ? 'green' : 'red'}>
            {iv.status === 'scheduled' ? 'Confirmé' : iv.status === 'completed' ? 'Terminé' : 'Annulé'}
          </Badge>
        </div>

        <div className="mt-4 rounded-2xl border border-surface-border bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-text-primary">Informations sur l'entretien</h2>
          <div className="space-y-2.5">
            <InfoRow icon={Calendar} label="Date" value={scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} />
            <InfoRow icon={Clock} label="Heure" value={scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} />
            <InfoRow icon={Clock} label="Durée estimée" value={`${iv.duration_minutes} min`} />
            <InfoRow icon={Icon} label="Format" value={formatLabel[iv.format]} />
            {iv.location && <InfoRow icon={MapPin} label={iv.format === 'video' ? 'Lien' : 'Lieu'} value={iv.location} />}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-surface-border bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-text-primary">Préparez votre entretien</h2>
          <div className="space-y-3">
            {prepItems.map((item) => (
              <button key={item.title} className="flex w-full items-center gap-3 text-left">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-50 text-brand-blue-600">
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-text-primary">{item.title}</span>
                  <span className="block text-xs text-text-secondary">{item.desc}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>

        {iv.status === 'scheduled' && (
          <div className="mt-5">
            <Button fullWidth loading={downloading} onClick={handleDownload}>
              <Download className="size-[18px]" />
              Ajouter à mon calendrier (.ics)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-text-tertiary" />
      <span className="flex-1 text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-semibold text-text-primary">{value}</span>
    </div>
  )
}
