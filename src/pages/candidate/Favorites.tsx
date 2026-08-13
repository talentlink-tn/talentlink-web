import { Bookmark, BellRing } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { JobCard } from '@/components/shared/JobCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { jobs } from '@/data/jobs'
import { useApp } from '@/context/AppContext'

export function Favorites() {
  const { favorites, showToast } = useApp()
  const favoriteJobs = jobs.filter((j) => favorites.includes(j.id))

  return (
    <div className="pb-6">
      <PageHeader title="Offres favorites" />

      <div className="px-4 pt-4">
        <p className="mb-4 text-sm text-text-secondary">Retrouvez toutes les offres que vous avez enregistrées.</p>

        {favoriteJobs.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="size-6" />}
            title="Aucune offre enregistrée"
            description="Ajoutez des offres à vos favoris pour les retrouver ici facilement."
          />
        ) : (
          <div className="space-y-3">
            {favoriteJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-green-50 p-4">
          <BellRing className="size-5 shrink-0 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Ne manquez aucune opportunité</p>
            <p className="text-xs text-text-secondary">Activez les notifications pour recevoir des offres qui correspondent à votre profil.</p>
          </div>
        </div>
        <Button variant="outline" fullWidth className="mt-3" onClick={() => showToast('Alertes activées !')}>
          Activer les alertes
        </Button>
      </div>
    </div>
  )
}
