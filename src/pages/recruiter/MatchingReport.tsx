import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { getApplication, type ApplicationReadRaw } from '@/api/applications'
import { educationLevelLabel, experienceLevelLabel } from '@/api/enums'
import type { MatchBreakdown } from '@/types'
import { cn } from '@/utils/cn'

// A more readable, "report" version of the matching data already shown
// inline in CandidatesPipeline.tsx's Sheet (HR director feedback: side-
// by-side requirement-vs-candidate comparison, one section per
// criterion, with a plain-language justification) — no new backend
// data, everything here is derived from the same MatchBreakdown.
export function MatchingReport() {
  const { applicationId } = useParams()
  const { showToast } = useApp()
  const [application, setApplication] = useState<ApplicationReadRaw | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!applicationId) return
    getApplication(applicationId)
      .then(setApplication)
      .catch(() => showToast('Impossible de charger le rapport de matching.'))
      .finally(() => setLoading(false))
  }, [applicationId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div>
        <PageHeader title="Rapport de matching" />
        <p className="p-4 text-sm text-text-tertiary">Chargement…</p>
      </div>
    )
  }

  const breakdown = application?.match_breakdown
  if (!application || !breakdown) {
    return (
      <div>
        <PageHeader title="Rapport de matching" />
        <p className="p-4 text-sm text-text-tertiary">Aucune analyse de matching disponible pour cette candidature.</p>
      </div>
    )
  }

  const candidateName = `${application.candidate.first_name} ${application.candidate.last_name}`

  return (
    <div className="pb-10">
      <PageHeader title="Rapport de matching" />

      <div className="mx-auto max-w-2xl px-4 pt-5">
        <div className="flex items-center gap-3.5 rounded-2xl border border-surface-border bg-white p-4">
          <Avatar name={candidateName} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text-primary">{candidateName}</p>
            <p className="truncate text-xs text-text-secondary">Candidature pour « {application.job_offer.title} »</p>
          </div>
          <div className="shrink-0 text-center">
            <p className={cn('text-2xl font-extrabold', breakdown.overall_score >= 70 ? 'text-green-600' : breakdown.overall_score >= 40 ? 'text-orange-500' : 'text-red-500')}>
              {Math.round(breakdown.overall_score)}%
            </p>
            <p className="text-[10px] text-text-tertiary">score global</p>
          </div>
        </div>

        <p className="mt-5 mb-3 text-xs font-bold tracking-wide text-text-tertiary uppercase">
          Comparaison exigences du poste / profil candidat
        </p>

        <div className="space-y-3">
          <CriterionSection
            title="Compétences"
            score={breakdown.skills_score}
            requirement={
              breakdown.matched_skills.length + breakdown.missing_mandatory_skills.length + breakdown.missing_optional_skills.length > 0 ? (
                <ChipList items={[...breakdown.matched_skills, ...breakdown.missing_mandatory_skills, ...breakdown.missing_optional_skills]} />
              ) : (
                <span className="text-text-tertiary">Aucune compétence spécifique requise.</span>
              )
            }
            candidateValue={
              breakdown.matched_skills.length > 0 ? (
                <ChipList items={breakdown.matched_skills} tone="green" />
              ) : (
                <span className="text-text-tertiary">Aucune des compétences requises n'est présente.</span>
              )
            }
            justification={skillsJustification(breakdown)}
          />

          <CriterionSection
            title="Expérience"
            score={breakdown.experience_score}
            requirement={experienceLevelLabel(breakdown.required_experience_level)}
            candidateValue={`${breakdown.candidate_years_experience} an${breakdown.candidate_years_experience >= 2 ? 's' : ''} d'expérience professionnelle`}
            justification={experienceJustification(breakdown)}
          />

          <CriterionSection
            title="Formation"
            score={breakdown.education_score}
            requirement={educationLevelLabel(breakdown.required_education_level)}
            candidateValue={educationLevelLabel(breakdown.candidate_education_level)}
            justification={educationJustification(breakdown)}
          />

          <CriterionSection
            title="Langues"
            score={breakdown.languages_score}
            requirement={
              breakdown.matched_languages.length + breakdown.missing_languages.length > 0 ? (
                <ChipList items={[...breakdown.matched_languages, ...breakdown.missing_languages]} />
              ) : (
                <span className="text-text-tertiary">Aucune langue spécifique requise.</span>
              )
            }
            candidateValue={
              breakdown.matched_languages.length > 0 ? (
                <ChipList items={breakdown.matched_languages} tone="green" />
              ) : (
                <span className="text-text-tertiary">Aucune des langues requises n'est maîtrisée.</span>
              )
            }
            justification={languagesJustification(breakdown)}
          />

          <CriterionSection
            title="Mobilité"
            score={breakdown.mobility_score}
            requirement="Lieu / mode de travail de l'offre"
            candidateValue="Zone et préférences de mobilité du candidat"
            justification={mobilityJustification(breakdown)}
          />
        </div>
      </div>
    </div>
  )
}

function skillsJustification(b: MatchBreakdown): string {
  const total = b.matched_skills.length + b.missing_mandatory_skills.length + b.missing_optional_skills.length
  if (total === 0) return "Le poste ne définit aucune compétence requise ; ce critère est neutre dans le score."
  const parts = [`${b.matched_skills.length} compétence(s) requise(s) sur ${total} sont présentes chez le candidat.`]
  if (b.missing_mandatory_skills.length > 0) {
    parts.push(`Il manque ${b.missing_mandatory_skills.length} compétence(s) obligatoire(s) : ${b.missing_mandatory_skills.join(', ')} — ce qui plafonne fortement le score.`)
  }
  if (b.missing_optional_skills.length > 0) {
    parts.push(`${b.missing_optional_skills.length} compétence(s) souhaitée(s) mais non obligatoire(s) manquent également.`)
  }
  return parts.join(' ')
}

function experienceJustification(b: MatchBreakdown): string {
  const label = experienceLevelLabel(b.required_experience_level).toLowerCase()
  if (b.experience_score >= 100) {
    return `Le poste requiert un profil ${label} ; avec ${b.candidate_years_experience} an(s) d'expérience, le candidat atteint ou dépasse ce seuil.`
  }
  return `Le poste requiert un profil ${label} ; avec ${b.candidate_years_experience} an(s) d'expérience, le candidat est en-deçà du seuil attendu, d'où un score réduit.`
}

function educationJustification(b: MatchBreakdown): string {
  const required = educationLevelLabel(b.required_education_level)
  const candidate = educationLevelLabel(b.candidate_education_level)
  if (b.education_score >= 100) return `Le niveau de formation du candidat (${candidate}) satisfait le niveau requis (${required}).`
  return `Le poste requiert un niveau ${required} ; le niveau du candidat (${candidate}) est inférieur, ce qui réduit le score sur ce critère.`
}

function languagesJustification(b: MatchBreakdown): string {
  const total = b.matched_languages.length + b.missing_languages.length
  if (total === 0) return "Le poste ne définit aucune exigence linguistique ; ce critère est neutre dans le score."
  if (b.missing_languages.length === 0) return `Toutes les langues requises (${b.matched_languages.join(', ')}) sont maîtrisées par le candidat au niveau attendu.`
  return `${b.matched_languages.length} langue(s) sur ${total} sont maîtrisées au niveau attendu. Manquent : ${b.missing_languages.join(', ')}.`
}

function mobilityJustification(b: MatchBreakdown): string {
  if (b.mobility_score >= 100) return "Le poste est en télétravail, ou la localisation du candidat correspond à celle de l'offre — aucune contrainte de mobilité identifiée."
  if (b.mobility_score >= 60) return "La compatibilité géographique est partielle : le candidat n'a pas indiqué cette zone parmi ses localisations préférées, mais sa mobilité déclarée reste compatible."
  return "Le candidat n'a pas indiqué de préférence de mobilité compatible avec la localisation de ce poste, ce qui réduit le score sur ce critère."
}

function CriterionSection({
  title,
  score,
  requirement,
  candidateValue,
  justification,
}: {
  title: string
  score: number
  requirement: React.ReactNode
  candidateValue: React.ReactNode
  justification: string
}) {
  const rounded = Math.round(score)
  const tone = rounded >= 70 ? 'green' : rounded >= 40 ? 'orange' : 'red'
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        <Badge tone={tone === 'green' ? 'green' : tone === 'orange' ? 'orange' : 'red'}>{rounded}%</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-text-tertiary uppercase">Exigence du poste</p>
          <div className="text-sm text-text-primary">{requirement}</div>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-text-tertiary uppercase">Profil du candidat</p>
          <div className="text-sm text-text-primary">{candidateValue}</div>
        </div>
      </div>
      <p className="mt-3 border-t border-surface-border pt-3 text-xs leading-relaxed text-text-secondary">{justification}</p>
    </div>
  )
}

function ChipList({ items, tone }: { items: string[]; tone?: 'green' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
            tone === 'green' ? 'bg-green-50 text-green-700' : 'bg-surface-muted text-text-secondary',
          )}
        >
          {tone === 'green' ? <CheckCircle2 className="size-3" /> : null}
          {item}
        </span>
      ))}
    </div>
  )
}
