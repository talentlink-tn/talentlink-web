import { useEffect, useState } from 'react'
import { Users2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { getTalentPool, type TalentPoolEntryRaw } from '@/api/companies'
import { timeAgoFr } from '@/api/enums'

// "Talent Pool intelligent" (HR director feedback): candidates from a
// closed offer who weren't hired, kept with their consent
// (CandidateProfile.talent_pool_opt_in) — populated automatically when a
// company closes an offer (see talent_pool_service.py), notified about
// automatically when a ≥90% match appears on a newly published offer.
export function TalentPool() {
  const { showToast } = useApp()
  const [entries, setEntries] = useState<TalentPoolEntryRaw[] | null>(null)

  useEffect(() => {
    getTalentPool()
      .then(setEntries)
      .catch(() => showToast('Impossible de charger le vivier de talents.'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-8">
      <PageHeader title="Vivier de talents" />
      <div className="px-4 pt-4">
        <p className="mb-4 text-sm text-text-secondary">
          Candidats ayant accepté d'être recontactés pour de futures opportunités, issus d'offres clôturées.
        </p>

        {entries === null ? (
          <p className="text-sm text-text-tertiary">Chargement…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-white p-8 text-center">
            <Users2 className="mx-auto size-8 text-text-tertiary" />
            <p className="mt-2 text-sm text-text-tertiary">Aucun candidat dans le vivier pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
                <Avatar name={`${e.candidate.first_name} ${e.candidate.last_name}`} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {e.candidate.first_name} {e.candidate.last_name}
                  </p>
                  <p className="truncate text-xs text-text-secondary">{e.candidate.headline || 'Profil candidat'}</p>
                  {e.source_job_offer_title && (
                    <p className="truncate text-xs text-text-tertiary">Issu de : {e.source_job_offer_title}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-text-tertiary">{timeAgoFr(e.added_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
