import { useEffect, useState } from 'react'
import { UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { ApiError } from '@/api/client'
import { listRetentionDueApplications, setApplicationRetention, type ApplicationReadRaw } from '@/api/applications'

// The "rappel manuel" the HR director asked for: no background job
// checks employment status automatically (nothing in this system tracks
// that) — a recruiter answers for each hired candidate once 12 months
// have passed, and DashboardService aggregates those manual answers
// into the retention-rate KPI shown on Statistics.tsx.
export function RetentionChecks() {
  const { showToast } = useApp()
  const [applications, setApplications] = useState<ApplicationReadRaw[] | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = () => {
    listRetentionDueApplications()
      .then(setApplications)
      .catch(() => showToast('Impossible de charger les vérifications de rétention.'))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const answer = async (id: string, status: 'retained' | 'left') => {
    setActingId(id)
    try {
      await setApplicationRetention(id, status)
      setApplications((prev) => prev?.filter((a) => a.id !== id) ?? null)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="pb-8">
      <PageHeader title="Vérifications de rétention" />
      <div className="px-4 pt-4">
        <p className="mb-4 text-sm text-text-secondary">
          Ces candidats ont été embauchés il y a plus de 12 mois. Indiquez s'ils sont toujours en poste pour mettre à jour le taux de rétention.
        </p>

        {applications === null ? (
          <p className="text-sm text-text-tertiary">Chargement…</p>
        ) : applications.length === 0 ? (
          <p className="rounded-2xl border border-surface-border bg-white p-4 text-center text-sm text-text-tertiary">
            Aucune vérification en attente.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {a.candidate.first_name} {a.candidate.last_name}
                  </p>
                  <p className="truncate text-xs text-text-secondary">{a.job_offer.title}</p>
                </div>
                <Button size="sm" variant="outline" loading={actingId === a.id} onClick={() => answer(a.id, 'left')}>
                  <UserX className="size-3.5" />
                  Parti
                </Button>
                <Button size="sm" loading={actingId === a.id} onClick={() => answer(a.id, 'retained')}>
                  <UserCheck className="size-3.5" />
                  Toujours en poste
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
