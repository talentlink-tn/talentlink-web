import { useState } from 'react'
import { Search, ChevronDown, MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

const faqs = [
  { q: 'Comment postuler à une offre ?', a: 'Ouvrez une offre, vérifiez les détails puis appuyez sur "Postuler maintenant". Votre CV et vos documents seront envoyés automatiquement au recruteur.' },
  { q: 'Quels sont les types de contrats ?', a: 'Talent Link propose des offres en CDI, CDD, Stage et Freelance. Vous pouvez filtrer les résultats par type de contrat.' },
  { q: 'Comment modifier mon profil ?', a: 'Rendez-vous dans "Mon profil" puis appuyez sur "Modifier" à côté de la section que vous souhaitez mettre à jour.' },
  { q: 'Comment suivre ma candidature ?', a: 'Consultez l’onglet "Candidatures" pour voir l’état d’avancement de chacune de vos candidatures en temps réel.' },
  { q: 'Comment fonctionnent les alertes ?', a: 'Activez les alertes depuis vos offres favorites pour être notifié dès qu’une offre correspondant à vos critères est publiée.' },
  { q: 'Comment contacter le support ?', a: 'Utilisez le bouton "Contacter" ci-dessous ou écrivez-nous à support@talentlink.tn, nous répondons sous 24h.' },
]

export function Help() {
  const { showToast } = useApp()
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Aide et support" />

      <h2 className="mt-4 text-lg font-bold text-text-primary">Centre d'aide</h2>
      <p className="text-sm text-text-secondary">Comment pouvons-nous vous aider ?</p>

      <span className="relative mt-4 flex items-center">
        <Search className="pointer-events-none absolute left-3.5 size-[18px] text-text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une question…"
          className="h-11 w-full rounded-xl border border-surface-border bg-white pr-4 pl-11 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
        />
      </span>

      <h3 className="mt-6 mb-2 text-sm font-bold text-text-primary">Questions fréquentes</h3>
      <div className="divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-white">
        {filtered.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted">
              <span className="flex-1 text-sm font-medium text-text-primary">{f.q}</span>
              <ChevronDown className={cn('size-4 shrink-0 text-text-tertiary transition-transform', openIndex === i && 'rotate-180')} />
            </button>
            {openIndex === i && <p className="px-4 pb-4 text-sm leading-relaxed text-text-secondary">{f.a}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="px-4 py-6 text-center text-sm text-text-tertiary">Aucun résultat trouvé.</p>}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-blue-50/60 p-4">
        <MessageCircle className="size-5 shrink-0 text-brand-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Besoin d'aide ?</p>
          <p className="text-xs text-text-secondary">Contactez notre équipe, nous vous répondrons rapidement.</p>
        </div>
      </div>
      <Button fullWidth className="mt-3" onClick={() => showToast('Message envoyé à notre équipe support !')}>
        Contacter le support
      </Button>
    </div>
  )
}
