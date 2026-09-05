import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarPlus, Download, MessageCircle, XCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sheet } from '@/components/ui/Sheet'
import { useApp } from '@/context/AppContext'
import { SkeletonCompactRows } from '@/components/shared/SkeletonRows'
import { ApiError } from '@/api/client'
import { changeApplicationStatus, listApplications, mapApplicationToRecruiterCandidate } from '@/api/applications'
import { scheduleInterview, type InterviewReadRaw } from '@/api/interviews'
import { downloadApplicationsXlsx } from '@/api/jobOffers'
import type { BackendApplicationStatus } from '@/api/mappers'
import { educationLevelLabel, experienceLevelLabel } from '@/api/enums'
import type { MatchBreakdown, RecruiterCandidate } from '@/types'
import { cn } from '@/utils/cn'

const columns: { key: RecruiterCandidate['stage']; label: string; tone: 'blue' | 'orange' | 'green' }[] = [
  { key: 'new', label: 'Nouveau', tone: 'blue' },
  { key: 'interview', label: 'En entretien', tone: 'orange' },
  { key: 'final', label: 'Sélection finale', tone: 'green' },
]

// The pipeline board only shows 3 columns (module 3's real pipeline has
// 10 statuses — see api/applications.ts's STAGE_FOR_STATUS) — advancing
// a card picks one concrete representative status per column jump.
const ADVANCE_TARGET: Record<RecruiterCandidate['stage'], BackendApplicationStatus | null> = {
  new: 'hr_interview',
  interview: 'offer',
  final: null,
}

export function CandidatesPipeline() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { jobOfferId?: string } }
  const { showToast } = useApp()
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RecruiterCandidate | null>(null)
  const [acting, setActing] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [ivKind, setIvKind] = useState<InterviewReadRaw['kind']>('hr')
  const [ivFormat, setIvFormat] = useState<InterviewReadRaw['format']>('video')
  const [ivDate, setIvDate] = useState('')
  const [ivTime, setIvTime] = useState('')
  const [ivDuration, setIvDuration] = useState(60)
  const [ivLocation, setIvLocation] = useState('')
  const [scheduledOk, setScheduledOk] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const jobOfferId = location.state?.jobOfferId

  const load = () => {
    setLoading(true)
    listApplications({ jobOfferId: location.state?.jobOfferId })
      .then((raw) => setCandidates(raw.map(mapApplicationToRecruiterCandidate)))
      .catch(() => showToast('Impossible de charger les candidatures.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = async (id: string) => {
    const candidate = candidates.find((c) => c.id === id)
    const target = candidate ? ADVANCE_TARGET[candidate.stage] : null
    if (!target) return
    setActing(true)
    try {
      await changeApplicationStatus(id, target)
      showToast('Candidat avancé à l’étape suivante.')
      setSelected(null)
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    } finally {
      setActing(false)
    }
  }

  const openCandidate = (c: RecruiterCandidate) => {
    setSelected(c)
    setShowSchedule(false)
    setIvKind('hr')
    setIvFormat('video')
    setIvDate('')
    setIvTime('')
    setIvDuration(60)
    setIvLocation('')
    setScheduledOk(null)
  }

  const submitSchedule = async () => {
    if (!selected || !ivDate || !ivTime) return
    setActing(true)
    try {
      await scheduleInterview(selected.id, {
        kind: ivKind,
        format: ivFormat,
        scheduledAt: new Date(`${ivDate}T${ivTime}`).toISOString(),
        durationMinutes: ivDuration,
        location: ivLocation || undefined,
      })
      setScheduledOk('Entretien planifié avec succès.')
      setShowSchedule(false)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible de planifier l'entretien.")
    } finally {
      setActing(false)
    }
  }

  const handleExport = async () => {
    if (!jobOfferId) return
    setExporting(true)
    try {
      const blob = await downloadApplicationsXlsx(jobOfferId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidatures-${jobOfferId}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'exporter les candidatures.")
    } finally {
      setExporting(false)
    }
  }

  const reject = async (id: string) => {
    setActing(true)
    try {
      await changeApplicationStatus(id, 'rejected')
      showToast('Candidature refusée.')
      setSelected(null)
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    } finally {
      setActing(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">Gestion des candidatures</h1>
          <p className="text-sm text-text-secondary">{loading ? 'Chargement…' : `${candidates.length} candidatures`}</p>
        </div>
        {jobOfferId && (
          <Button variant="outline" loading={exporting} onClick={handleExport}>
            <Download className="size-[18px]" />
            Exporter
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const items = candidates.filter((c) => c.stage === col.key)
          return (
            <div key={col.key} className="rounded-2xl border border-surface-border bg-white p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                  <Badge tone={col.tone}>{items.length}</Badge>
                  {col.label}
                </span>
              </div>
              <div className="space-y-2.5">
                {loading ? (
                  <SkeletonCompactRows count={2} />
                ) : (
                  <>
                    {items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => openCandidate(c)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-surface-border bg-surface-muted/40 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue-200 hover:bg-white hover:shadow-md"
                      >
                        <Avatar name={c.name} color={c.avatarColor} size={38} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-text-primary">{c.name}</span>
                          <span className="block truncate text-xs text-text-tertiary">{c.role}</span>
                        </span>
                        <span className={cn('text-xs font-bold', c.matchScore >= 85 ? 'text-green-600' : 'text-orange-500')}>{c.matchScore}%</span>
                      </button>
                    ))}
                    {items.length === 0 && <p className="py-6 text-center text-xs text-text-tertiary">Aucun candidat</p>}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} color={selected.avatarColor} size={56} />
              <div>
                <p className="text-sm font-bold text-text-primary">{selected.role}</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-muted p-3.5 text-center">
              <p className="text-2xl font-extrabold text-green-600">{selected.matchScore}%</p>
              <p className="text-xs text-text-secondary">de compatibilité avec le poste (score IA)</p>
            </div>

            {selected.matchBreakdown && <MatchBreakdownDetail breakdown={selected.matchBreakdown} />}
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => navigate('/recruiter/messages')}>
                <MessageCircle className="size-[18px]" />
                Contacter
              </Button>
              <Button variant="danger" fullWidth loading={acting} onClick={() => reject(selected.id)}>
                <XCircle className="size-[18px]" />
                Refuser
              </Button>
            </div>
            {ADVANCE_TARGET[selected.stage] && (
              <Button fullWidth loading={acting} onClick={() => advance(selected.id)}>
                Avancer à l'étape suivante
                <ArrowRight className="size-[18px]" />
              </Button>
            )}

            {scheduledOk && (
              <p className="rounded-xl bg-green-50 p-3 text-center text-sm font-medium text-green-700">{scheduledOk}</p>
            )}

            {!showSchedule ? (
              <Button variant="outline" fullWidth onClick={() => setShowSchedule(true)}>
                <CalendarPlus className="size-[18px]" />
                Planifier un entretien
              </Button>
            ) : (
              <div className="space-y-3 rounded-xl border border-surface-border p-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-text-primary">Type</span>
                    <select
                      value={ivKind}
                      onChange={(e) => setIvKind(e.target.value as InterviewReadRaw['kind'])}
                      className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
                    >
                      <option value="hr">RH</option>
                      <option value="technical">Technique</option>
                      <option value="test">Test</option>
                      <option value="other">Autre</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-text-primary">Format</span>
                    <select
                      value={ivFormat}
                      onChange={(e) => setIvFormat(e.target.value as InterviewReadRaw['format'])}
                      className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
                    >
                      <option value="video">Visio</option>
                      <option value="phone">Téléphone</option>
                      <option value="on_site">Sur site</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Date" type="date" value={ivDate} onChange={(e) => setIvDate(e.target.value)} />
                  <Input label="Heure" type="time" value={ivTime} onChange={(e) => setIvTime(e.target.value)} />
                </div>
                <Input
                  label="Durée (min)"
                  type="number"
                  min={15}
                  step={15}
                  value={ivDuration}
                  onChange={(e) => setIvDuration(Number(e.target.value))}
                />
                <Input
                  label={ivFormat === 'video' ? 'Lien de visioconférence' : ivFormat === 'phone' ? 'Numéro à appeler' : 'Adresse'}
                  value={ivLocation}
                  onChange={(e) => setIvLocation(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setShowSchedule(false)}>
                    Annuler
                  </Button>
                  <Button fullWidth loading={acting} disabled={!ivDate || !ivTime} onClick={submitSchedule}>
                    Confirmer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}

// Rien de neuf ici — le matching détaillé est déjà calculé et renvoyé par
// le backend (MatchBreakdown) pour chaque candidature, il n'était juste
// jamais affiché côté recruteur.
const CRITERIA: { key: keyof MatchBreakdown; label: string }[] = [
  { key: 'skills_score', label: 'Compétences' },
  { key: 'experience_score', label: 'Expérience' },
  { key: 'education_score', label: 'Formation' },
  { key: 'languages_score', label: 'Langues' },
  { key: 'mobility_score', label: 'Mobilité' },
]

function MatchBreakdownDetail({ breakdown }: { breakdown: MatchBreakdown }) {
  return (
    <div className="space-y-3.5 rounded-xl border border-surface-border p-3.5">
      <p className="text-xs font-bold tracking-wide text-text-tertiary uppercase">Analyse du matching</p>

      <div className="space-y-2">
        {CRITERIA.map(({ key, label }) => {
          const score = Math.round(breakdown[key] as number)
          return (
            <div key={key} className="flex items-center gap-2.5">
              <span className="w-20 shrink-0 text-xs text-text-secondary">{label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <span
                  className={cn('block h-full rounded-full', score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-orange-400' : 'bg-red-400')}
                  style={{ width: `${score}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-xs font-semibold text-text-primary">{score}%</span>
            </div>
          )
        })}
      </div>

      {breakdown.matched_skills.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-secondary">Compétences correspondantes</p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.matched_skills.map((s) => (
              <Badge key={s} tone="green">{s}</Badge>
            ))}
          </div>
        </div>
      )}
      {(breakdown.missing_mandatory_skills.length > 0 || breakdown.missing_optional_skills.length > 0) && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-secondary">Compétences manquantes</p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.missing_mandatory_skills.map((s) => (
              <Badge key={s} tone="red">{s}</Badge>
            ))}
            {breakdown.missing_optional_skills.map((s) => (
              <Badge key={s} tone="orange">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-surface-muted p-2.5">
          <p className="text-text-tertiary">Expérience candidat</p>
          <p className="font-semibold text-text-primary">{breakdown.candidate_years_experience} ans · requis : {experienceLevelLabel(breakdown.required_experience_level)}</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-2.5">
          <p className="text-text-tertiary">Formation candidat</p>
          <p className="font-semibold text-text-primary">{educationLevelLabel(breakdown.candidate_education_level)} · requis : {educationLevelLabel(breakdown.required_education_level)}</p>
        </div>
      </div>

      {(breakdown.matched_languages.length > 0 || breakdown.missing_languages.length > 0) && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-secondary">Langues</p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.matched_languages.map((l) => (
              <Badge key={l} tone="green">{l}</Badge>
            ))}
            {breakdown.missing_languages.map((l) => (
              <Badge key={l} tone="red">{l}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
