import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Eye, XCircle, Archive, RotateCcw, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import { ApiError } from '@/api/client'
import {
  archiveJobOffer,
  closeJobOffer,
  createJobOffer,
  getMyJobOffer,
  listMyJobOffers,
  publishJobOffer,
  restoreJobOffer,
  updateJobOffer,
  type JobOfferReadRaw,
} from '@/api/jobOffers'
import type { BackendContractType, BackendExperienceLevel } from '@/api/enums'
import { contractTypeToFr } from '@/api/enums'

type ListItem = {
  id: string
  title: string
  location: string
  contract: string
  status: JobOfferReadRaw['status']
}

const statusConfig: Record<ListItem['status'], { label: string; tone: 'green' | 'gray' | 'red' | 'blue' | 'orange' }> = {
  draft: { label: 'Brouillon', tone: 'gray' },
  scheduled: { label: 'Programmée', tone: 'blue' },
  published: { label: 'Active', tone: 'green' },
  closed: { label: 'Clôturée', tone: 'red' },
  archived: { label: 'Archivée', tone: 'gray' },
}

const contractOptions: { value: BackendContractType; label: string }[] = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'alternance', label: 'Alternance' },
]
const experienceOptions: { value: BackendExperienceLevel; label: string }[] = [
  { value: 'junior', label: 'Junior (0-2 ans)' },
  { value: 'confirmed', label: 'Confirmé (2-5 ans)' },
  { value: 'senior', label: 'Senior (5-10 ans)' },
  { value: 'expert', label: 'Expert (10+ ans)' },
]

export function JobsManagement() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('Tunis, Tunisie')
  const [contract, setContract] = useState<BackendContractType>('cdi')
  const [experienceLevel, setExperienceLevel] = useState<BackendExperienceLevel>('confirmed')
  const [submitting, setSubmitting] = useState(false)
  const [loadingOfferToEdit, setLoadingOfferToEdit] = useState(false)

  const [jobs, setJobs] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    listMyJobOffers()
      .then(({ items }) =>
        setJobs(items.map((j) => ({ id: j.id, title: j.title, location: j.location, contract: contractTypeToFr(j.contract_type), status: j.status }))),
      )
      .catch(() => showToast('Impossible de charger les offres.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLocation('Tunis, Tunisie')
    setContract('cdi')
    setExperienceLevel('confirmed')
  }

  const openCreateSheet = () => {
    setEditingId(null)
    resetForm()
    setSheetOpen(true)
  }

  // The list only carries summary fields (title/location/contract/status)
  // to keep that response light — fetch the full offer for the fields
  // this form needs (description, experience level) before pre-filling.
  const openEditSheet = async (id: string) => {
    setLoadingOfferToEdit(true)
    try {
      const offer = await getMyJobOffer(id)
      setTitle(offer.title)
      setDescription(offer.description ?? '')
      setLocation(offer.location)
      setContract(offer.contract_type)
      setExperienceLevel(offer.experience_level)
      setEditingId(id)
      setSheetOpen(true)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible de charger l'offre.")
    } finally {
      setLoadingOfferToEdit(false)
    }
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('Veuillez indiquer un titre et une description.')
      return
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await updateJobOffer(editingId, {
          title: title.trim(),
          description: description.trim(),
          experienceLevel,
          contractType: contract,
          location,
        })
        showToast('Offre mise à jour avec succès !')
      } else {
        const created = await createJobOffer({
          title: title.trim(),
          description: description.trim(),
          experienceLevel,
          contractType: contract,
          workMode: 'on_site',
          location,
        })
        await publishJobOffer(created.id)
        showToast('Offre publiée avec succès !')
      }
      closeSheet()
      resetForm()
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Une erreur est survenue.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async (id: string) => {
    try {
      await closeJobOffer(id)
      showToast('Offre clôturée.')
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveJobOffer(id)
      showToast('Offre archivée.')
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreJobOffer(id)
      showToast('Offre remise en brouillon.')
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action impossible.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">Gestion des offres</h1>
          <p className="text-sm text-text-secondary">{loading ? 'Chargement…' : `${jobs.length} offres`}</p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="size-[18px]" />
          Publier une offre
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-bold text-text-primary">{j.title}</p>
                <Badge tone={statusConfig[j.status].tone}>{statusConfig[j.status].label}</Badge>
              </div>
              <p className="text-xs text-text-secondary">
                {j.location} · {j.contract}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/recruiter/candidates', { state: { jobOfferId: j.id } })}
                className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted"
              >
                <Users className="size-3.5" />
                Candidatures
              </button>
              <button
                onClick={() => openEditSheet(j.id)}
                disabled={loadingOfferToEdit}
                className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-text-secondary hover:bg-surface-muted disabled:opacity-40"
                title="Modifier"
              >
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => showToast('Aperçu de l’offre')} className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-text-secondary hover:bg-surface-muted">
                <Eye className="size-3.5" />
              </button>
              {j.status === 'archived' ? (
                <button
                  onClick={() => handleRestore(j.id)}
                  className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-text-secondary hover:bg-surface-muted"
                  title="Remettre en brouillon"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleClose(j.id)}
                    disabled={j.status === 'closed'}
                    className="flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40"
                    title="Clôturer"
                  >
                    <XCircle className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(j.id)}
                    className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-text-secondary hover:bg-surface-muted"
                    title="Archiver"
                  >
                    <Archive className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={sheetOpen} onClose={closeSheet} title={editingId ? "Modifier l'offre" : 'Publier une nouvelle offre'}>
        <div className="space-y-4">
          <Input label="Titre du poste" placeholder="Ex. Développeur Full Stack" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Décrivez le poste, les missions principales…"
              className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            />
          </label>
          <Input label="Localisation" value={location} onChange={(e) => setLocation(e.target.value)} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Type de contrat</span>
            <select
              value={contract}
              onChange={(e) => setContract(e.target.value as BackendContractType)}
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            >
              {contractOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Niveau d’expérience</span>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as BackendExperienceLevel)}
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            >
              {experienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Button fullWidth onClick={handleSubmit} loading={submitting}>
            {editingId ? 'Enregistrer les modifications' : "Publier l'offre"}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
