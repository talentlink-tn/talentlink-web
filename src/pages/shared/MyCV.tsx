import { useEffect, useRef, useState } from 'react'
import { FileText, Download, RefreshCcw, Upload, Sparkles, ChevronDown, User, Briefcase, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import {
  getMyCandidateProfile,
  uploadMyCv,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  type CandidateProfileRaw,
  type ExperienceRaw,
  type ExperienceInput,
  type EducationRaw,
  type EducationInput,
  type CertificationRaw,
  type CertificationInput,
} from '@/api/candidates'
import { useApp } from '@/context/AppContext'
import { ApiError, resolveUploadUrl } from '@/api/client'
import { cn } from '@/utils/cn'

type SectionKey = 'experiences' | 'educations' | 'skills' | 'languages' | 'certifications'

const educationLevelOptions: { value: string; label: string }[] = [
  { value: 'none', label: 'Non précisé' },
  { value: 'bac', label: 'Baccalauréat' },
  { value: 'bac2', label: 'Bac+2' },
  { value: 'bac3', label: 'Bac+3' },
  { value: 'bac5', label: 'Bac+5' },
  { value: 'doctorate', label: 'Doctorat' },
]

function educationLevelLabel(level: string | null): string {
  return educationLevelOptions.find((o) => o.value === level)?.label ?? ''
}

function formatPeriod(start: string | null, end: string | null, isCurrent?: boolean): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  if (!start) return ''
  if (isCurrent) return `${fmt(start)} - Aujourd'hui`
  if (!end) return fmt(start)
  return `${fmt(start)} - ${fmt(end)}`
}

export function MyCV() {
  const { showToast } = useApp()
  const [openSection, setOpenSection] = useState<SectionKey | null>(null)
  const [profile, setProfile] = useState<CandidateProfileRaw | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [experienceSheet, setExperienceSheet] = useState<{ open: boolean; editing: ExperienceRaw | null }>({ open: false, editing: null })
  const [educationSheet, setEducationSheet] = useState<{ open: boolean; editing: EducationRaw | null }>({ open: false, editing: null })
  const [certificationSheet, setCertificationSheet] = useState<{ open: boolean; editing: CertificationRaw | null }>({ open: false, editing: null })

  const loadProfile = () => {
    getMyCandidateProfile()
      .then(setProfile)
      .catch(() => {
        // No CV card shown below just falls back to "aucun CV" state.
      })
  }

  useEffect(loadProfile, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      showToast('Le CV doit être un fichier PDF.')
      return
    }
    setUploading(true)
    try {
      const updated = await uploadMyCv(file)
      setProfile(updated)
      showToast('CV mis à jour avec succès !')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'envoyer le CV pour le moment.")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Supprimer cette expérience ?')) return
    try {
      setProfile(await deleteExperience(id))
      showToast('Expérience supprimée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Suppression impossible.')
    }
  }

  const handleDeleteEducation = async (id: string) => {
    if (!window.confirm('Supprimer cette formation ?')) return
    try {
      setProfile(await deleteEducation(id))
      showToast('Formation supprimée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Suppression impossible.')
    }
  }

  const handleDeleteCertification = async (id: string) => {
    if (!window.confirm('Supprimer cette certification ?')) return
    try {
      setProfile(await deleteCertification(id))
      showToast('Certification supprimée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Suppression impossible.')
    }
  }

  if (!profile) {
    return (
      <div className="px-4 pt-4 pb-8">
        <PageHeader title="Mon CV" action={<Download className="size-[18px] text-text-secondary" />} />
        <p className="mt-8 text-center text-sm text-text-tertiary">Chargement…</p>
      </div>
    )
  }

  const sections: { key: SectionKey; label: string; count: number }[] = [
    { key: 'experiences', label: 'Expériences professionnelles', count: profile.experiences.length },
    { key: 'educations', label: 'Formations', count: profile.educations.length },
    { key: 'skills', label: 'Compétences', count: profile.skills.length },
    { key: 'languages', label: 'Langues', count: profile.languages.length },
    { key: 'certifications', label: 'Certifications', count: profile.certifications.length },
  ]

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Mon CV" action={<Download className="size-[18px] text-text-secondary" />} />

      <p className="mt-4 text-sm text-text-secondary">Gardez votre CV à jour pour augmenter vos chances d’être sélectionné.</p>

      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

      {profile.cv_file_url ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text-primary">{profile.cv_file_name ?? 'CV.pdf'}</p>
            <p className="text-xs text-text-tertiary">
              {profile.cv_uploaded_at ? `Mis à jour le ${new Date(profile.cv_uploaded_at).toLocaleDateString('fr-FR')}` : ''}
            </p>
          </div>
          <a
            href={resolveUploadUrl(profile.cv_file_url)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
          >
            Télécharger
          </a>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-surface-border bg-white p-4 text-center">
          <p className="text-sm text-text-secondary">Aucun CV enregistré pour le moment.</p>
          <p className="mt-1 text-xs text-text-tertiary">Un CV est requis pour postuler à une offre.</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <ActionTile
          icon={profile.cv_file_url ? RefreshCcw : Upload}
          label={profile.cv_file_url ? 'Remplacer le fichier' : 'Ajouter mon CV'}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <ActionTile icon={Sparkles} label="Créer un nouveau CV" onClick={() => showToast('Bientôt disponible.')} />
      </div>

      <div className="mt-5 rounded-2xl border border-surface-border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Résumé des informations</h3>
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-3">
          <ResumeItem icon={User} label="Nom complet" value={`${profile.first_name} ${profile.last_name}`} />
          <ResumeItem icon={Briefcase} label="Poste actuel" value={profile.headline || '-'} />
          <ResumeItem icon={User} label="Téléphone" value={profile.phone || '-'} />
          <ResumeItem icon={Briefcase} label="Niveau d'études" value={profile.educations[0]?.degree ?? '-'} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-surface-border bg-white">
        <h3 className="px-4 pt-4 pb-2 text-sm font-bold text-text-primary">Contenu de mon CV</h3>
        {sections.map((s) => (
          <div key={s.key} className="border-t border-surface-border">
            <button onClick={() => setOpenSection(openSection === s.key ? null : s.key)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted">
              <span className="flex-1 text-sm font-medium text-text-primary">
                {s.label} <span className="text-text-tertiary">({s.count})</span>
              </span>
              <ChevronDown className={cn('size-4 text-text-tertiary transition-transform', openSection === s.key && 'rotate-180')} />
            </button>
            {openSection === s.key && (
              <div className="space-y-2 px-4 pb-4">
                {s.key === 'experiences' && (
                  <>
                    {profile.experiences.map((e) => (
                      <div key={e.id} className="flex items-start gap-2 rounded-xl bg-surface-muted p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">{e.title}</p>
                          <p className="text-xs text-text-secondary">
                            {e.company_name} · {formatPeriod(e.start_date, e.end_date, e.is_current)}
                          </p>
                          {e.location && <p className="text-xs text-text-tertiary">{e.location}</p>}
                        </div>
                        <RowActions
                          onEdit={() => setExperienceSheet({ open: true, editing: e })}
                          onDelete={() => handleDeleteExperience(e.id)}
                        />
                      </div>
                    ))}
                    <AddRowButton label="Ajouter une expérience" onClick={() => setExperienceSheet({ open: true, editing: null })} />
                  </>
                )}
                {s.key === 'educations' && (
                  <>
                    {profile.educations.map((e) => (
                      <div key={e.id} className="flex items-start gap-2 rounded-xl bg-surface-muted p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">{e.degree}</p>
                          <p className="text-xs text-text-secondary">
                            {e.school} · {formatPeriod(e.start_date, e.end_date)}
                          </p>
                          {e.level && <p className="text-xs text-text-tertiary">{educationLevelLabel(e.level)}</p>}
                        </div>
                        <RowActions
                          onEdit={() => setEducationSheet({ open: true, editing: e })}
                          onDelete={() => handleDeleteEducation(e.id)}
                        />
                      </div>
                    ))}
                    <AddRowButton label="Ajouter une formation" onClick={() => setEducationSheet({ open: true, editing: null })} />
                  </>
                )}
                {s.key === 'skills' && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.length === 0 && <p className="text-xs text-text-tertiary">Aucune compétence renseignée.</p>}
                    {profile.skills.map((sk) => (
                      <span key={sk.skill_name} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-primary">
                        {sk.skill_name}
                      </span>
                    ))}
                  </div>
                )}
                {s.key === 'languages' && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languages.length === 0 && <p className="text-xs text-text-tertiary">Aucune langue renseignée.</p>}
                    {profile.languages.map((l) => (
                      <span key={l.language} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-primary">
                        {l.language}
                      </span>
                    ))}
                  </div>
                )}
                {s.key === 'certifications' && (
                  <>
                    {profile.certifications.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 rounded-xl bg-surface-muted p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                          {c.issuing_organization && <p className="text-xs text-text-secondary">{c.issuing_organization}</p>}
                          {c.issue_date && (
                            <p className="text-xs text-text-tertiary">
                              Obtenue en {new Date(c.issue_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <RowActions
                          onEdit={() => setCertificationSheet({ open: true, editing: c })}
                          onDelete={() => handleDeleteCertification(c.id)}
                        />
                      </div>
                    ))}
                    <AddRowButton label="Ajouter une certification" onClick={() => setCertificationSheet({ open: true, editing: null })} />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-blue-50/60 p-4">
        <Sparkles className="size-5 shrink-0 text-brand-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Conseil pour améliorer votre CV</p>
          <p className="text-xs text-text-secondary">Ajoutez des compétences populaires et des réalisations chiffrées pour vous démarquer.</p>
        </div>
      </div>

      <ExperienceFormSheet
        open={experienceSheet.open}
        editing={experienceSheet.editing}
        nextOrder={profile.experiences.length}
        onClose={() => setExperienceSheet({ open: false, editing: null })}
        onSaved={(updated) => {
          setProfile(updated)
          setExperienceSheet({ open: false, editing: null })
        }}
      />
      <EducationFormSheet
        open={educationSheet.open}
        editing={educationSheet.editing}
        nextOrder={profile.educations.length}
        onClose={() => setEducationSheet({ open: false, editing: null })}
        onSaved={(updated) => {
          setProfile(updated)
          setEducationSheet({ open: false, editing: null })
        }}
      />
      <CertificationFormSheet
        open={certificationSheet.open}
        editing={certificationSheet.editing}
        onClose={() => setCertificationSheet({ open: false, editing: null })}
        onSaved={(updated) => {
          setProfile(updated)
          setCertificationSheet({ open: false, editing: null })
        }}
      />
    </div>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button onClick={onEdit} className="flex size-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-white hover:text-brand-blue-600" aria-label="Modifier">
        <Pencil className="size-3.5" />
      </button>
      <button onClick={onDelete} className="flex size-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-white hover:text-red-600" aria-label="Supprimer">
        <Trash2 className="size-3.5" />
      </button>
    </span>
  )
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border py-2.5 text-xs font-semibold text-brand-blue-600 hover:bg-brand-blue-50/40">
      <Plus className="size-3.5" />
      {label}
    </button>
  )
}

function ActionTile({
  icon: Icon,
  label,
  onClick,
  danger,
  loading,
}: {
  icon: typeof Upload
  label: string
  onClick: () => void
  danger?: boolean
  loading?: boolean
}) {
  return (
    <button onClick={onClick} disabled={loading} className="flex flex-col items-center gap-1.5 rounded-xl border border-surface-border bg-white py-3 text-center disabled:opacity-60">
      <Icon className={cn('size-[18px]', danger ? 'text-red-500' : 'text-brand-blue-600')} />
      <span className="px-1 text-[10px] leading-tight text-text-secondary">{loading ? 'Envoi…' : label}</span>
    </button>
  )
}

function ResumeItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-text-tertiary" />
      <span className="min-w-0">
        <span className="block text-[11px] text-text-tertiary">{label}</span>
        <span className="block truncate text-sm font-semibold text-text-primary">{value}</span>
      </span>
    </div>
  )
}

// ── Experience form ──────────────────────────────────────────────────

function ExperienceFormSheet({
  open,
  editing,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: ExperienceRaw | null
  nextOrder: number
  onClose: () => void
  onSaved: (profile: CandidateProfileRaw) => void
}) {
  const { showToast } = useApp()
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setCompanyName(editing?.company_name ?? '')
    setLocation(editing?.location ?? '')
    setStartDate(editing?.start_date ?? '')
    setEndDate(editing?.end_date ?? '')
    setIsCurrent(editing?.is_current ?? false)
    setDescription(editing?.description ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!title.trim() || !companyName.trim() || !startDate) {
      showToast('Veuillez indiquer un intitulé, une entreprise et une date de début.')
      return
    }
    const payload: ExperienceInput = {
      title: title.trim(),
      company_name: companyName.trim(),
      location: location.trim() || null,
      start_date: startDate,
      end_date: isCurrent ? null : endDate || null,
      is_current: isCurrent,
      description: description.trim() || null,
      display_order: editing?.display_order ?? nextOrder,
    }
    setSaving(true)
    try {
      const updated = editing ? await updateExperience(editing.id, payload) : await addExperience(payload)
      onSaved(updated)
      showToast(editing ? 'Expérience mise à jour.' : 'Expérience ajoutée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'enregistrer cette expérience.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Modifier l'expérience" : 'Ajouter une expérience'}>
      <div className="space-y-4">
        <Input label="Intitulé du poste" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Entreprise" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <Input label="Lieu (optionnel)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date de début" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Date de fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-surface-border bg-white p-3.5">
          <span className="text-sm font-medium text-text-primary">Poste actuel</span>
          <Switch checked={isCurrent} onChange={(v) => { setIsCurrent(v); if (v) setEndDate('') }} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Description (optionnel)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          />
        </label>
        <Button fullWidth onClick={handleSave} loading={saving}>
          Enregistrer
        </Button>
      </div>
    </Sheet>
  )
}

// ── Education form ───────────────────────────────────────────────────

function EducationFormSheet({
  open,
  editing,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: EducationRaw | null
  nextOrder: number
  onClose: () => void
  onSaved: (profile: CandidateProfileRaw) => void
}) {
  const { showToast } = useApp()
  const [degree, setDegree] = useState('')
  const [school, setSchool] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [level, setLevel] = useState('none')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDegree(editing?.degree ?? '')
    setSchool(editing?.school ?? '')
    setFieldOfStudy(editing?.field_of_study ?? '')
    setLevel(editing?.level ?? 'none')
    setStartDate(editing?.start_date ?? '')
    setEndDate(editing?.end_date ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!degree.trim() || !school.trim()) {
      showToast('Veuillez indiquer un diplôme et un établissement.')
      return
    }
    const payload: EducationInput = {
      degree: degree.trim(),
      school: school.trim(),
      field_of_study: fieldOfStudy.trim() || null,
      level: (level as EducationInput['level']) || null,
      start_date: startDate || null,
      end_date: endDate || null,
      display_order: editing?.display_order ?? nextOrder,
    }
    setSaving(true)
    try {
      const updated = editing ? await updateEducation(editing.id, payload) : await addEducation(payload)
      onSaved(updated)
      showToast(editing ? 'Formation mise à jour.' : 'Formation ajoutée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'enregistrer cette formation.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Modifier la formation' : 'Ajouter une formation'}>
      <div className="space-y-4">
        <Input label="Diplôme" value={degree} onChange={(e) => setDegree(e.target.value)} />
        <Input label="Établissement" value={school} onChange={(e) => setSchool(e.target.value)} />
        <Input label="Domaine d'étude (optionnel)" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Niveau</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          >
            {educationLevelOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date de début (optionnel)" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Date de fin (optionnel)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button fullWidth onClick={handleSave} loading={saving}>
          Enregistrer
        </Button>
      </div>
    </Sheet>
  )
}

// ── Certification form ───────────────────────────────────────────────

function CertificationFormSheet({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: CertificationRaw | null
  onClose: () => void
  onSaved: (profile: CandidateProfileRaw) => void
}) {
  const { showToast } = useApp()
  const [name, setName] = useState('')
  const [issuingOrganization, setIssuingOrganization] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [credentialUrl, setCredentialUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setIssuingOrganization(editing?.issuing_organization ?? '')
    setIssueDate(editing?.issue_date ?? '')
    setExpiryDate(editing?.expiry_date ?? '')
    setCredentialUrl(editing?.credential_url ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Veuillez indiquer un nom de certification.')
      return
    }
    const payload: CertificationInput = {
      name: name.trim(),
      issuing_organization: issuingOrganization.trim() || null,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      credential_url: credentialUrl.trim() || null,
    }
    setSaving(true)
    try {
      const updated = editing ? await updateCertification(editing.id, payload) : await addCertification(payload)
      onSaved(updated)
      showToast(editing ? 'Certification mise à jour.' : 'Certification ajoutée.')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'enregistrer cette certification.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Modifier la certification' : 'Ajouter une certification'}>
      <div className="space-y-4">
        <Input label="Nom de la certification" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Organisme (optionnel)" value={issuingOrganization} onChange={(e) => setIssuingOrganization(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date d'obtention (optionnel)" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          <Input label="Date d'expiration (optionnel)" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        <Input label="Lien (optionnel)" placeholder="https://…" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} />
        <Button fullWidth onClick={handleSave} loading={saving}>
          Enregistrer
        </Button>
      </div>
    </Sheet>
  )
}
