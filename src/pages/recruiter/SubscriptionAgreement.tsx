import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { getMyCompany, type CompanyProfileRaw } from '@/api/companies'

// Generic, print-oriented placeholder for the annual subscription
// agreement — same "realistic template, explicitly not legal/commercial
// advice" approach as Terms.tsx/PrivacyPolicy.tsx, independent of the
// still-deferred real billing module. Nested under RecruiterShell (not
// public like Terms) so it can pull the signed-in company's own name.
export function SubscriptionAgreement() {
  const [company, setCompany] = useState<CompanyProfileRaw | null>(null)
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    getMyCompany().then(setCompany).catch(() => {})
  }, [])

  return (
    <div className="pb-8">
      <PageHeader
        title="Convention d'abonnement"
        action={
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600">
            <Printer className="size-4" />
            Imprimer
          </button>
        }
      />

      <div className="mx-auto max-w-3xl px-4 py-6 print:px-0 print:py-0">
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 print:hidden">
          <strong>Modèle à titre indicatif.</strong> Ce document est un exemple générique de convention d'abonnement,
          fourni pour permettre son impression avant la mise en place du module de facturation réel. Il doit être
          relu et validé par un professionnel du droit et adapté aux conditions commerciales effectives avant tout
          usage contractuel.
        </div>

        <h1 className="text-xl font-extrabold text-text-primary">Convention d'abonnement annuel</h1>
        <p className="mt-1 text-sm text-text-tertiary">Établie le {today}</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-base font-bold text-text-primary">Entre les soussignés</h2>
            <p className="mt-2">
              <strong>Talent Link</strong>, plateforme de recrutement en ligne, ci-après désignée « le Prestataire »,
            </p>
            <p className="mt-2">Et</p>
            <p className="mt-2">
              <strong>{company?.name || "l'Entreprise cliente"}</strong>
              {company?.address ? `, dont le siège est situé à ${company.address}` : ''}
              {company?.tax_id ? `, matricule fiscale n° ${company.tax_id}` : ''}, ci-après désignée « le Client ».
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">1. Objet</h2>
            <p className="mt-2">
              La présente convention a pour objet de définir les conditions dans lesquelles le Prestataire met à
              disposition du Client un accès annuel à la plateforme Talent Link, permettant la publication d'offres
              d'emploi, la gestion des candidatures et l'accès aux outils de matching et de suivi RH.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">2. Durée</h2>
            <p className="mt-2">
              La présente convention est conclue pour une durée d'un (1) an à compter de sa date de signature,
              renouvelable par tacite reconduction sauf dénonciation par l'une des parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">3. Conditions financières</h2>
            <p className="mt-2">
              Les conditions tarifaires applicables font l'objet d'un accord commercial distinct entre les parties,
              annexé à la présente convention.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">4. Obligations du Prestataire</h2>
            <p className="mt-2">
              Le Prestataire s'engage à maintenir la disponibilité de la plateforme, à assurer la confidentialité
              des données déposées par le Client et ses candidats, conformément à sa Politique de Confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">5. Obligations du Client</h2>
            <p className="mt-2">
              Le Client s'engage à utiliser la plateforme conformément aux Conditions Générales d'Utilisation, et à
              n'y publier que des offres d'emploi conformes à la législation du travail applicable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">6. Résiliation</h2>
            <p className="mt-2">
              Chaque partie peut résilier la présente convention avant son terme en cas de manquement grave de
              l'autre partie à ses obligations, après mise en demeure restée sans effet pendant trente (30) jours.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-6 pt-6">
            <div>
              <p className="font-semibold text-text-primary">Pour le Prestataire</p>
              <p className="mt-8 border-t border-surface-border pt-1 text-xs text-text-tertiary">Signature</p>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Pour le Client</p>
              <p className="mt-8 border-t border-surface-border pt-1 text-xs text-text-tertiary">Signature</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
