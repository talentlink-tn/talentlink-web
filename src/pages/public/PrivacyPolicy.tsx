import { Logo } from '@/components/layout/Logo'

// Same disclaimer/structure rationale as Terms.tsx — see that file's
// top comment.
export function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center">
          <Logo size={32} textClassName="text-[16px]" to="/" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Modèle à titre indicatif.</strong> Ce document est un exemple générique de Politique de
          Confidentialité, fourni pour combler l'absence de mentions légales avant un lancement. Il doit être relu
          et validé par un professionnel du droit (notamment au regard de la réglementation applicable en matière
          de protection des données) avant toute mise en production réelle.
        </div>

        <h1 className="text-2xl font-extrabold text-text-primary">Politique de Confidentialité</h1>
        <p className="mt-1 text-sm text-text-tertiary">Dernière mise à jour : 1er septembre 2026</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-base font-bold text-text-primary">1. Données collectées</h2>
            <p className="mt-2">Selon votre profil, Talent Link collecte notamment :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Candidats :</strong> nom, prénom, adresse e-mail, téléphone, CV et documents associés,
                expériences professionnelles, formations, compétences, langues, prétentions salariales,
                localisation, historique de candidatures et de messages.
              </li>
              <li>
                <strong>Entreprises :</strong> nom de l'entreprise, informations de contact des membres de
                l'équipe, offres d'emploi publiées, historique des candidatures reçues.
              </li>
              <li>
                <strong>Données techniques :</strong> journaux de connexion, informations sur l'appareil et le
                navigateur, à des fins de sécurité et de bon fonctionnement du Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">2. Finalités du traitement</h2>
            <p className="mt-2">Ces données sont utilisées pour :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Permettre la mise en relation entre candidats et entreprises (candidatures, matching, messagerie, entretiens) ;</li>
              <li>Calculer un score de compatibilité entre un profil candidat et une offre d'emploi ;</li>
              <li>Gérer la création et la sécurité des comptes utilisateurs ;</li>
              <li>Envoyer des notifications relatives à l'activité du compte (candidatures, messages, entretiens) ;</li>
              <li>Améliorer le Service et assurer son bon fonctionnement technique.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">3. Isolation et sécurité des données</h2>
            <p className="mt-2">
              Les données de chaque entreprise et de chaque candidat sont techniquement isolées : une entreprise
              n'accède au profil d'un candidat que dans le cadre d'une candidature réelle à l'une de ses offres, et
              n'a jamais accès aux données des autres entreprises. Les mots de passe sont stockés sous forme
              chiffrée (hachage), jamais en clair.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">4. Partage des données</h2>
            <p className="mt-2">
              Les données d'un candidat ne sont partagées qu'avec les entreprises auprès desquelles il a
              explicitement postulé. Talent Link ne vend ni ne loue les données personnelles de ses utilisateurs à
              des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">5. Durée de conservation</h2>
            <p className="mt-2">
              Les données sont conservées pendant toute la durée de vie du compte, puis pendant une durée limitée
              après sa suppression à des fins de preuve et de conformité, avant suppression ou anonymisation
              définitive.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">6. Vos droits</h2>
            <p className="mt-2">
              Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données
              personnelles, ainsi que d'un droit d'opposition à leur traitement. Vous pouvez exercer ces droits
              directement depuis les paramètres de votre compte, ou en nous contactant à privacy@talentlink.tn.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">7. Cookies et traceurs</h2>
            <p className="mt-2">
              Le Service utilise uniquement les cookies strictement nécessaires à l'authentification et au bon
              fonctionnement de l'application (session de connexion). Aucun cookie publicitaire ou de suivi tiers
              n'est utilisé à ce jour.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">8. Contact</h2>
            <p className="mt-2">
              Pour toute question relative à la présente Politique de Confidentialité ou à l'exercice de vos
              droits : privacy@talentlink.tn
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
