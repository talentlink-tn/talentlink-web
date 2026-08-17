import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { MapPin, Briefcase, DollarSign, Calendar, ChevronRight, FileText, CheckCircle2, Lightbulb, Headphones } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { ApplicationStatusBadge } from '@/components/shared/ApplicationStatusBadge'
import { ApplicationStepper } from '@/components/shared/ApplicationStepper'
import { Button } from '@/components/ui/Button'
import { getApplication } from '@/data/applications'
import { getJob } from '@/data/jobs'
import { getCompany } from '@/data/companies'
import { useApp, getMyApplication } from '@/context/AppContext'
import type { Application } from '@/types'
import { cn } from '@/utils/cn'

const tabs = ['Aperçu', 'Messages', 'Documents', 'Activité'] as const

const statusMessages: Record<string, string> = {
  submitted: 'Votre candidature a bien été envoyée. Le recruteur va bientôt l’examiner.',
  under_review: 'Votre candidature est en cours d’examen. Le recruteur étudie votre profil.',
  interview: 'Le recruteur va vous proposer des créneaux pour un entretien.',
  technical_test: 'Vous avez un test technique à réaliser prochainement.',
  decision: 'Une décision finale sera bientôt communiquée.',
  accepted: 'Félicitations, votre candidature a été acceptée !',
  refused: 'Votre candidature n’a malheureusement pas été retenue cette fois.',
}

export function ApplicationDetail() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { applications, applicationsLoading, withdrawApplication, conversations } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Aperçu')
  const [fetched, setFetched] = useState<Application | null>(null)
  const [fetchFailed, setFetchFailed] = useState(false)

  const fromContext = applications.find((a) => a.id === applicationId)

  // On a direct nav (deep link, refresh, notification click) `applications`
  // hasn't loaded yet from the context's async refreshApplications() — fetch
  // this one application directly instead of redirecting away prematurely.
  useEffect(() => {
    if (fromContext || !applicationId) return
    getMyApplication(applicationId)
      .then(setFetched)
      .catch(() => setFetchFailed(true))
  }, [applicationId, fromContext])

  const application = fromContext ?? fetched ?? getApplication(applicationId ?? '')
  if (!application) {
    if (applicationsLoading || (!fetchFailed && !fromContext)) return null
    return <Navigate to="/app/applications" replace />
  }
  const job = getJob(application.jobId)
  if (!job) return <Navigate to="/app/applications" replace />
  const company = getCompany(job.companyId)
  const conversation = conversations.find((c) => c.application_id === application.id)

  const evalItems: { label: string; value: number }[] = [
    { label: 'Compétences techniques', value: application.evaluation.technical },
    { label: 'Expérience', value: application.evaluation.experience },
    { label: 'Formation', value: application.evaluation.training },
    { label: 'Soft skills', value: application.evaluation.softSkills },
  ]

  return (
    <div className="pb-6">
      <PageHeader title="Ma candidature" />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
          <CompanyLogo name={company?.logo ?? '?'} color={company?.logoColor ?? '#2F6FED'} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-text-primary">{job.title}</p>
            <p className="truncate text-sm text-text-secondary">{company?.name}</p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="mt-4 rounded-2xl border border-surface-border bg-white p-4">
          <ApplicationStepper steps={application.steps} />
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-2xl bg-brand-blue-50/60 p-3.5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-blue-600" />
          <p className="text-sm text-text-primary">{statusMessages[application.status]}</p>
        </div>

        {(application.status === 'interview' || application.status === 'technical_test') && (
          <button
            onClick={() => navigate(`/app/applications/${application.id}/interview`)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:shadow-sm"
          >
            <Calendar className="size-5 shrink-0 text-brand-blue-600" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary">Prochaine étape : Entretien</span>
              <span className="block text-xs text-text-secondary">Voir les détails de l'entretien</span>
            </span>
            <ChevronRight className="size-4 text-text-tertiary" />
          </button>
        )}
      </div>

      <div className="no-scrollbar mt-5 flex gap-5 border-b border-surface-border px-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('relative shrink-0 pb-3 text-sm font-semibold', tab === t ? 'text-brand-blue-600' : 'text-text-tertiary')}
          >
            {t}
            {tab === t && <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-brand-blue-600" />}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {tab === 'Aperçu' && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-2 text-[15px] font-bold text-text-primary">Détails de l'offre</h2>
              <div className="space-y-2 rounded-2xl border border-surface-border bg-white p-4">
                <DetailRow icon={Briefcase} label="Type de contrat" value={job.contract} />
                <DetailRow icon={MapPin} label="Lieu" value={job.location} />
                <DetailRow icon={DollarSign} label="Salaire" value={`${job.salaryMin} - ${job.salaryMax} TND`} />
              </div>
            </div>

            {application.evaluation.overall > 0 && (
              <div>
                <h2 className="mb-2 text-[15px] font-bold text-text-primary">Évaluation de votre profil</h2>
                <div className="rounded-2xl border border-surface-border bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-green-600">{application.evaluation.overall.toFixed(1)}</span>
                    <span className="text-sm text-text-tertiary">/ 5</span>
                    <span className="ml-auto text-sm font-semibold text-green-600">Très bon profil</span>
                  </div>
                  <div className="space-y-2.5">
                    {evalItems.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-text-secondary">{item.label}</span>
                          <span className="font-semibold text-text-primary">{item.value.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(item.value / 5) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-surface-border bg-white p-4">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Conseils pour avancer</p>
                <p className="mt-1 text-xs text-text-secondary">Préparez votre entretien et complétez votre profil pour augmenter vos chances.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Messages' && (
          <div>
            {conversation ? (
              <button
                onClick={() => navigate(`/app/messages/${conversation.application_id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-blue-50 text-sm font-bold text-brand-blue-600">
                  {conversation.counterpart_name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">{conversation.counterpart_name}</span>
                  <span className="block truncate text-xs text-text-secondary">{conversation.last_message_body}</span>
                </span>
                <ChevronRight className="size-4 text-text-tertiary" />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/app/messages/${application.id}`)}
                className="flex w-full items-center justify-center rounded-2xl border border-dashed border-surface-border bg-white py-8 text-sm font-semibold text-brand-blue-600"
              >
                Démarrer une conversation avec le recruteur
              </button>
            )}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="space-y-2">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">{doc.name}</span>
                  <span className="block text-xs text-text-tertiary">{doc.date}</span>
                </span>
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              </div>
            ))}
          </div>
        )}

        {tab === 'Activité' && (
          <div className="space-y-4">
            {application.steps
              .filter((s) => s.state !== 'upcoming')
              .map((s) => (
                <div key={s.key} className="flex gap-3">
                  <span className="mt-1 flex size-2 shrink-0 rounded-full bg-brand-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{s.label}</p>
                    {s.date && <p className="text-xs text-text-tertiary">{s.date}</p>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface-muted p-4">
        <Headphones className="size-5 shrink-0 text-text-secondary" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Besoin d'aide ?</p>
          <p className="text-xs text-text-secondary">Notre équipe est là pour vous accompagner.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          variant="outline"
          fullWidth
          disabled={application.status === 'refused'}
          onClick={() => {
            withdrawApplication(application.id)
            navigate('/app/applications')
          }}
        >
          Retirer ma candidature
        </Button>
        <Button fullWidth onClick={() => navigate(`/app/messages/${application.id}`)}>
          Contacter le recruteur
        </Button>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-text-tertiary" />
      <span className="flex-1 text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  )
}
