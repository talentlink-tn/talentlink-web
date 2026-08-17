import { useEffect, useRef, useState } from 'react'
import { FileText, Download, RefreshCcw, Upload, Sparkles, ChevronDown, User, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { candidateProfile } from '@/data/profile'
import { getMyCandidateProfile, uploadMyCv, type CandidateProfileRaw } from '@/api/candidates'
import { useApp } from '@/context/AppContext'
import { ApiError, resolveUploadUrl } from '@/api/client'
import { cn } from '@/utils/cn'

type SectionKey = 'experiences' | 'educations' | 'skills' | 'languages' | 'certifications'

// The full profile editor (experiences/educations/skills/languages/
// certifications CRUD) isn't wired to the API yet — this screen only
// wires the one thing that actually gates applying to a job (module 3's
// "CV required to apply" rule): the CV *file* itself. The sections below
// still render from mocked candidateProfile data. See this repo's
// README "Décisions en attente de validation".
export function MyCV() {
  const { showToast } = useApp()
  const [openSection, setOpenSection] = useState<SectionKey | null>(null)
  const [profile, setProfile] = useState<CandidateProfileRaw | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const sections: { key: SectionKey; label: string; count: number }[] = [
    { key: 'experiences', label: 'Expériences professionnelles', count: candidateProfile.experiences.length },
    { key: 'educations', label: 'Formations', count: candidateProfile.educations.length },
    { key: 'skills', label: 'Compétences', count: candidateProfile.skills.length },
    { key: 'languages', label: 'Langues', count: candidateProfile.languages.length },
    { key: 'certifications', label: 'Certifications', count: candidateProfile.certifications.length },
  ]

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Mon CV" action={<Download className="size-[18px] text-text-secondary" />} />

      <p className="mt-4 text-sm text-text-secondary">Gardez votre CV à jour pour augmenter vos chances d’être sélectionné.</p>

      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

      {profile?.cv_file_url ? (
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
          icon={profile?.cv_file_url ? RefreshCcw : Upload}
          label={profile?.cv_file_url ? 'Remplacer le fichier' : 'Ajouter mon CV'}
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
          <ResumeItem icon={User} label="Nom complet" value={`${candidateProfile.firstName} ${candidateProfile.lastName}`} />
          <ResumeItem icon={Briefcase} label="Poste actuel" value={candidateProfile.title} />
          <ResumeItem icon={User} label="Localisation" value={candidateProfile.location} />
          <ResumeItem icon={Briefcase} label="Niveau d'études" value={candidateProfile.educations[0]?.degree ?? '-'} />
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
                {s.key === 'experiences' &&
                  candidateProfile.experiences.map((e) => (
                    <div key={e.id} className="rounded-xl bg-surface-muted p-3">
                      <p className="text-sm font-semibold text-text-primary">{e.title}</p>
                      <p className="text-xs text-text-secondary">
                        {e.company} · {e.period}
                      </p>
                    </div>
                  ))}
                {s.key === 'educations' &&
                  candidateProfile.educations.map((e) => (
                    <div key={e.id} className="rounded-xl bg-surface-muted p-3">
                      <p className="text-sm font-semibold text-text-primary">{e.degree}</p>
                      <p className="text-xs text-text-secondary">
                        {e.school} · {e.period}
                      </p>
                    </div>
                  ))}
                {s.key === 'skills' && (
                  <div className="flex flex-wrap gap-1.5">
                    {candidateProfile.skills.map((sk) => (
                      <span key={sk} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-primary">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
                {s.key === 'languages' && (
                  <div className="flex flex-wrap gap-1.5">
                    {candidateProfile.languages.map((l) => (
                      <span key={l} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-primary">
                        {l}
                      </span>
                    ))}
                  </div>
                )}
                {s.key === 'certifications' &&
                  candidateProfile.certifications.map((c) => (
                    <div key={c} className="rounded-xl bg-surface-muted p-3 text-sm text-text-primary">
                      {c}
                    </div>
                  ))}
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
    </div>
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
