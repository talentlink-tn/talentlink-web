import { Logo } from '@/components/layout/Logo'

// Generic-but-realistic placeholder content for a recruitment platform
// handling personal data (CVs, contact details, application history) —
// explicitly NOT legal advice, see the disclaimer banner below. Public,
// unauthenticated page: linked from the desktop landing page's footer
// and from the in-app Settings screen alike, so no AppShell/
// RecruiterShell chrome, matching CareerPage.tsx's own minimal header.
export function Terms() {
  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center">
          <Logo size={32} textClassName="text-[16px]" to="/" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Modèle à titre indicatif.</strong> Ce document est un exemple générique de Conditions Générales
          d'Utilisation, fourni pour combler l'absence de mentions légales avant un lancement. Il doit être relu et
          validé par un professionnel du droit avant toute mise en production réelle.
        </div>

        <h1 className="text-2xl font-extrabold text-text-primary">Conditions Générales d'Utilisation</h1>
        <p className="mt-1 text-sm text-text-tertiary">Dernière mise à jour : 1er septembre 2026</p>

        <div className="prose-legal mt-6 space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-base font-bold text-text-primary">1. Objet</h2>
            <p className="mt-2">
              Les présentes Conditions Générales d'Utilisation (« CGU ») ont pour objet de définir les modalités et
              conditions d'utilisation de la plateforme Talent Link (le « Service »), qui met en relation des
              candidats à l'emploi et des entreprises recruteuses. L'utilisation du Service implique l'acceptation
              pleine et entière des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">2. Accès au Service</h2>
            <p className="mt-2">
              Le Service est accessible aux candidats et aux entreprises via un compte créé lors de l'inscription.
              L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. La création d'un
              compte candidat est gratuite. L'accès aux fonctionnalités de recrutement (publication d'offres,
              consultation de candidatures) est réservé aux comptes entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">3. Comptes candidat et entreprise</h2>
            <p className="mt-2">
              Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute
              activité effectuée depuis son compte. Talent Link se réserve le droit de suspendre ou de supprimer un
              compte en cas de non-respect des présentes CGU, de fraude, ou d'usage abusif du Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">4. Contenu déposé par les utilisateurs</h2>
            <p className="mt-2">
              Les candidats restent seuls responsables de l'exactitude des informations et documents qu'ils
              déposent sur le Service (CV, lettres de motivation, expériences, formations). Les entreprises restent
              seules responsables du contenu des offres d'emploi qu'elles publient, qui doit être conforme à la
              législation du travail applicable et ne présenter aucun caractère discriminatoire.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">5. Matching et scoring automatisés</h2>
            <p className="mt-2">
              Talent Link propose un système de calcul de compatibilité entre un profil candidat et une offre
              d'emploi, basé sur des critères déclaratifs (compétences, expérience, formation, langues). Ce score
              est fourni à titre indicatif et n'emporte aucune garantie ni obligation d'embauche ; la décision de
              recrutement relève exclusivement de l'entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">6. Propriété intellectuelle</h2>
            <p className="mt-2">
              La marque Talent Link, son logo et l'ensemble des éléments graphiques et logiciels du Service sont
              protégés par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">7. Responsabilité</h2>
            <p className="mt-2">
              Talent Link agit en tant qu'intermédiaire technique entre candidats et entreprises et ne saurait être
              tenue responsable des échanges, décisions de recrutement, ou du contenu publié par ses utilisateurs.
              Le Service est fourni « en l'état », sans garantie de disponibilité continue.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">8. Données personnelles</h2>
            <p className="mt-2">
              Le traitement des données personnelles collectées dans le cadre du Service est décrit dans notre{' '}
              <a href="/privacy-policy" className="font-semibold text-brand-blue-600 hover:underline">
                Politique de Confidentialité
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">9. Modification des CGU</h2>
            <p className="mt-2">
              Talent Link se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
              informés de toute modification substantielle.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-text-primary">10. Contact</h2>
            <p className="mt-2">Pour toute question relative aux présentes CGU : contact@talentlink.tn</p>
          </section>
        </div>
      </main>
    </div>
  )
}
