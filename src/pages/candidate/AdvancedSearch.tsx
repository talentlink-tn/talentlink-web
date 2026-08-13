import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LocateFixed, Bookmark } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { jobs } from '@/data/jobs'
import { useApp } from '@/context/AppContext'

const posts = ['Développeur', 'UX/UI Designer', 'Chef de projet', 'Data Analyst', 'Responsable RH']
const sectors = ['Informatique', 'Banque', 'Design', 'Logistique', 'Ressources Humaines']
const contracts = ['CDI', 'CDD', 'Stage', 'Freelance']
const experiences = ['Débutant', '1 à 3 ans', '3 à 5 ans', '5 ans et plus']
const dates = ['Toutes les dates', '24 dernières heures', '7 derniers jours', '30 derniers jours']
const remoteOptions = ['Indifférent', 'Sur site', 'Hybride', 'Télétravail']

export function AdvancedSearch() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [keyword, setKeyword] = useState('')
  const [post, setPost] = useState('')
  const [sector, setSector] = useState('')
  const [location, setLocation] = useState('Tunis, Tunisie')
  const [contract, setContract] = useState('')
  const [experience, setExperience] = useState('')
  const [date, setDate] = useState(dates[0])
  const [remote, setRemote] = useState(remoteOptions[0])

  const resultsCount = jobs.filter((j) => {
    const matchesKeyword = !keyword || j.title.toLowerCase().includes(keyword.toLowerCase())
    const matchesPost = !post || j.title.toLowerCase().includes(post.toLowerCase())
    const matchesSector = !sector || j.category === sector
    const matchesContract = !contract || j.contract === contract
    const matchesRemote = remote === 'Indifférent' || j.mode === remote
    return matchesKeyword && matchesPost && matchesSector && matchesContract && matchesRemote
  }).length

  const reset = () => {
    setKeyword('')
    setPost('')
    setSector('')
    setLocation('Tunis, Tunisie')
    setContract('')
    setExperience('')
    setDate(dates[0])
    setRemote(remoteOptions[0])
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Recherche avancée"
        action={
          <button onClick={reset} className="text-xs font-semibold text-brand-blue-600">
            Réinitialiser
          </button>
        }
      />

      <div className="space-y-5 px-4 pt-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Mots-clés</label>
          <span className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 size-[18px] text-text-tertiary" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ex. : Développeur, Marketing, Comptabilité…"
              className="h-11 w-full rounded-xl border border-surface-border bg-white pr-4 pl-11 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Poste / Métier" value={post} onChange={setPost} options={posts} placeholder="Sélectionner un poste" />
          <Select label="Secteur d'activité" value={sector} onChange={setSector} options={sectors} placeholder="Sélectionner un secteur" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Localisation</label>
          <span className="relative flex items-center">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 w-full rounded-xl border border-surface-border bg-white pr-11 pl-4 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            />
            <LocateFixed className="pointer-events-none absolute right-3.5 size-[18px] text-brand-blue-500" />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Type de contrat" value={contract} onChange={setContract} options={contracts} placeholder="Sélectionner un type" />
          <Select label="Niveau d'expérience" value={experience} onChange={setExperience} options={experiences} placeholder="Sélectionner un niveau" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Salaire souhaité (TND)</label>
          <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
            <span className="rounded-lg border border-surface-border px-3 py-1.5">1000 TND</span>
            <span className="rounded-lg border border-surface-border px-3 py-1.5">5000+ TND</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-brand-gradient" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Date de publication" value={date} onChange={setDate} options={dates} placeholder="" />
          <Select label="Télétravail" value={remote} onChange={setRemote} options={remoteOptions} placeholder="" />
        </div>

        <div className="rounded-xl bg-brand-blue-50/60 p-3.5 text-xs text-brand-blue-700">
          💡 Plus vous affinez votre recherche, plus les résultats seront pertinents.
        </div>

        <Button size="lg" fullWidth onClick={() => navigate('/app/jobs', { state: { query: keyword || post } })}>
          <Search className="size-[18px]" />
          Voir les résultats ({resultsCount})
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => showToast('Recherche enregistrée !')}
        >
          <Bookmark className="size-[18px]" />
          Enregistrer cette recherche
        </Button>
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-primary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-text-primary focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
