# Talent Link — PWA

Talent Link est une plateforme qui connecte candidats, employés et
recruteurs autour de la recherche d'emploi, la gestion RH et le suivi
de carrière. Ce dépôt contient le **front-end** de l'application.

> **Statut : connecté à un vrai backend pour les profils candidat et
> recruteur.** Les écrans candidat et recruteur appellent l'API
> FastAPI du dépôt [`talentlink-backend`](../talentlink-backend)
> (PostgreSQL + RLS multi-tenant) — inscription/connexion réelles,
> offres, candidatures, pipeline, entretiens, etc. Le profil **Employé**
> reste une démo 100 % locale (`localStorage`, aucun appel réseau) :
> aucun module backend payroll/congés/pointage n'existe (hors du plan
> initial en 7 modules). Voir [Intégration backend](#intégration-backend)
> et [Décisions en attente de validation](#décisions-en-attente-de-validation)
> plus bas.

## Installation

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173` (ou le premier
port libre suivant).

### Backend

Les profils Candidat et Recruteur nécessitent que
[`talentlink-backend`](../talentlink-backend) tourne (voir son propre
README — `docker compose up`, exposé par défaut sur
`http://localhost:8002`). L'URL de l'API se configure via la variable
d'environnement `VITE_API_BASE_URL` (fichier `.env`, valeur par défaut
`http://localhost:8002/api/v1`). Sans backend démarré, seul le profil
**Employé** (démo locale) reste utilisable.

## Build de production

```bash
npm run build
npm run preview
```

## Stack technique

- **React 19** + **TypeScript** (strict)
- **Vite 8** (`@tailwindcss/vite`, `vite-plugin-pwa`)
- **Tailwind CSS v4** (design tokens CSS-first, voir `src/index.css`)
- **React Router 7** pour la navigation
- **Framer Motion** pour les transitions et micro-interactions
- **Lucide React** pour l'iconographie
- PWA installable (manifest + service worker via Workbox)
- Client API `fetch` maison (`src/api/`), sans librairie de
  data-fetching — voir [Intégration backend](#intégration-backend)

Les profils Candidat et Recruteur appellent l'API réelle
(`talentlink-backend`). Le profil Employé et quelques données d'appoint
(conversations de messagerie, favoris) restent des données statiques
côté client dans `src/data/*.ts`.

## Structure du projet

```
src/
  api/               Client fetch + auth token, mappers backend → types front, un module par ressource
                      (auth, jobOffers, candidates, companies, applications, interviews, publicApi, enums)
  assets/            Logo et icônes vectorielles (source des icônes PWA)
  components/
    ui/              Primitives réutilisables (Button, Input, Card, Badge, Sheet, Switch, ProgressRing…)
    layout/          Coquilles d'interface (Logo, TopHeader, BottomNav, SideDrawer, RecruiterSidebar…)
    shared/          Composants métier réutilisés entre écrans (JobCard, ApplicationCard, CompanyLogo…)
  layouts/           AppShell (candidat/employé, navigation basse) et RecruiterShell (RH, sidebar desktop)
  pages/
    auth/            Splash, Onboarding, Connexion, Inscription, Choix du profil
    candidate/       Dashboard, Recherche, Détail offre, Candidatures, Entretien, Favoris, Entreprise, Calendrier…
    employee/         Dashboard employé, Pointage, Congés, Documents & formations
    recruiter/        Dashboard RH, Gestion des offres, Pipeline de candidatures, Statistiques
    shared/           Messages, Conversation, Notifications, Profil, CV, Paramètres, Aide
  context/           AppContext — état global : auth réelle (candidat/recruteur) + démo locale (employé),
                      favoris, candidatures, messages, notifications, toasts
  data/              Données de démo statiques (offres, entreprises, messages, profil employé) + un
                      "registre runtime" par ressource (jobs, companies) qui accueille les vraies données
                      chargées depuis l'API — voir Intégration backend
  hooks/             useLocalStorage, useBasePath
  types/             Types TypeScript partagés
```

## Choix d'architecture

- **Un seul contexte global (`AppContext`)** gère l'état "métier" :
  authentification (réelle pour candidat/recruteur, démo locale pour
  employé), profil actif, favoris, candidatures envoyées,
  conversations, notifications et toasts. Cela évite le prop-drilling
  tout en restant simple à suivre.
- **Trois profils, deux coquilles d'interface** : les profils
  *Candidat* et *Employé* partagent `AppShell` (navigation basse,
  largeur mobile centrée) car ce sont des parcours orientés mobile ;
  le profil *RH / Recruteur* utilise `RecruiterShell`, une mise en
  page desktop avec sidebar, plus adaptée à un usage de gestion.
- **Persistance locale ciblée** : seuls les choix qui doivent survivre
  à un rafraîchissement pour une démo crédible (session, profil
  choisi, favoris, candidatures envoyées) sont sauvegardés dans
  `localStorage` via `useLocalStorage`. Les messages/notifications
  restent en mémoire pour garder le code simple.
- **Design system CSS-first** (Tailwind v4) : tous les tokens de
  couleur, la police et les animations sont définis dans un unique
  bloc `@theme` (`src/index.css`), ce qui centralise la charte
  graphique extraite des maquettes (dégradé bleu → vert, fond sombre
  du splash, cartes arrondies, badges de statut…).
- **Pas de librairie de graphiques** : les visualisations de la page
  Statistiques (RH) sont des barres CSS pilotées par les données, pour
  respecter la contrainte "aucune techno lourde".

## Intégration backend

Les écrans Candidat et Recruteur ont été reconnectés un par un à l'API
réelle (`talentlink-backend`), design visuel inchangé. Quelques
patterns transverses, utilisés partout dans cette passe :

- **Registre runtime** (`data/jobs.ts`, `data/companies.ts`) : les
  composants existants (`JobCard`, `ApplicationCard`, `CompanyLogo`…)
  attendaient un lookup synchrone `getJob(id)`/`getCompany(id)`. Plutôt
  que de les réécrire pour de l'async, chaque appel API qui récupère
  une offre ou une entreprise l'enregistre dans une `Map` en mémoire
  via `registerJob()`/`registerCompany()` ; les lookups existants
  consultent d'abord ce registre puis retombent sur les données mock.
  Conséquence assumée : la `Map` est vidée à chaque rechargement complet
  de page — voir plus bas la note sur `ApplicationReadForCandidate`.
- **Repli mock uniquement pendant le chargement, jamais après** : un
  écran qui affiche des données réelles doit distinguer "je n'ai pas
  encore reçu la réponse" de "j'ai reçu une réponse et le champ est
  vide". Le premier cas peut légitimement montrer une donnée mock le
  temps du chargement ; le second doit afficher un état vide, jamais
  substituer silencieusement la donnée de démo à la place d'une vraie
  donnée absente (bug trouvé et corrigé sur `Profile.tsx` : un nouveau
  candidat sans titre professionnel affichait "Développeur Full Stack"
  au lieu d'un état vide).
- **Garde anti-redirection prématurée** : plusieurs écrans (détail de
  candidature, détail d'entretien) affichent immédiatement une
  redirection si la ressource demandée est absente du contexte React.
  Sur une navigation directe (lien profond, rechargement, clic depuis
  une notification), le contexte n'a pas encore fini de charger au
  premier rendu — sans garde, l'écran redirige avant même d'avoir
  essayé. Le correctif (voir `ApplicationDetail.tsx`,
  `InterviewDetail.tsx`) : tant que le chargement est en cours ou
  qu'un fetch direct de secours n'a pas encore échoué, ne rien
  rediriger.
- **Collapsing documenté, pas une perte d'information** : le pipeline
  backend a 10 statuts de candidature (module 3) ; l'UI candidat en
  montre 5 (stepper) et le pipeline recruteur en montre 3 (colonnes).
  Le mapping est centralisé (`STATUS_TO_FR` dans `api/mappers.ts`,
  `STAGE_FOR_STATUS` dans `api/applications.ts`) plutôt que dispersé
  dans chaque écran.
- **Ce qui n'a pas de backend reste local, explicitement** : le profil
  Employé (aucun module payroll/congés/pointage), les favoris candidat,
  les conversations de messagerie. Aucun de ces trois n'a jamais fait
  partie du plan de 7 modules ; ce n'est pas une simplification pour la
  démo, c'est hors périmètre.
- **Les URLs de fichiers uploadés sont relatives à l'origine de l'API,
  pas du front** (`resolveUploadUrl` dans `api/client.ts`) :
  `photo_url`/`cv_file_url` reviennent en `/uploads/...` (servis par un
  mount `StaticFiles` du backend hors du routeur `/api/v1` — voir
  `talentlink-backend/app/main.py`), donc un `<img src>`/`<a href>` brut
  se résolvait contre `localhost:5174` (le serveur Vite) au lieu de
  `localhost:8002` (l'API) et échouait silencieusement (icône d'image
  cassée pour la photo de profil ; lien de téléchargement de CV mort).
  Bug réel trouvé en testant l'upload de photo en live, corrigé partout
  où ces deux champs sont affichés (`MyCV.tsx`, `Profile.tsx`,
  `ProfileEdit.tsx`, `Dashboard.tsx`, `SideDrawer.tsx`, `Settings.tsx`).

## Comptes de démonstration

Les profils **Candidat** et **Recruteur** nécessitent une inscription
ou connexion réelle (formulaires `/register`, `/login`) contre l'API —
il n'y a plus de bascule instantanée pour ces deux profils. Le profil
**Employé** reste accessible en un clic depuis l'écran de connexion
("Continuer en tant qu'employé") : c'est une démo locale, sans compte.

## Décisions en attente de validation

Décisions de fond (comportement métier, schéma de données, ou
sécurité) rencontrées pendant l'intégration, tranchées provisoirement
pour ne pas bloquer l'avancement, mais qui méritent une validation
explicite plutôt que de rester figées par défaut.

**Validées le 2026-08-09 :**

1. ~~`ApplicationReadForCandidate.job_offer` n'expose que `{id, title}`~~
   — **résolu.** Le schéma backend expose désormais aussi `location`,
   `contract_type`, `salary_min`, `salary_max` (`JobOfferSummary` dans
   `talentlink-backend/app/schemas/application.py`). `mapApplicationForCandidate`
   (`api/mappers.ts`) les utilise pour enrichir le job "stub" enregistré
   dans le registre runtime, donc `ApplicationDetail.tsx` affiche
   désormais le vrai lieu/salaire même quand le registre est vide
   (rechargement de page, lien profond). Détails côté backend dans
   `talentlink-backend/README.md` → "Found during frontend integration".
2. ~~`CandidateProfileRead` n'expose pas l'email du candidat~~ —
   **résolu.** Le champ `email` (lecture seule) est maintenant renvoyé
   par `/candidates/me` et consommé directement (`profile.email` dans
   `Profile.tsx`/`ProfileEdit.tsx`) à la place du contournement
   `localStorage`. Ce contournement (`api/client.ts`, `StoredAuth.email`)
   reste en place, mais uniquement pour un usage différent et toujours
   non résolu : résoudre le *propre nom* d'un recruteur (voir point 3
   des décisions mineures déjà documentées en commentaire dans
   `RecruiterSidebar.tsx`/`Profile.tsx` — pas de "who am I" endpoint côté
   entreprise, contourné en faisant correspondre l'email en cache avec
   `listMyTeam()`).
5. ~~Upload de photo de profil non câblé côté UI~~ — **résolu.**
   `ProfileEdit.tsx` a maintenant un vrai sélecteur de fichier
   (`<input type="file" accept="image/*">`) branché sur
   `uploadMyPhoto()` (`api/candidates.ts` → `POST /candidates/me/photo`).

**Toujours en attente :**

3. **Édition du profil candidat : champs de base + compétences
   uniquement, pas de CRUD complet pour expériences / formations /
   certifications.** Le backend expose déjà les endpoints complets
   (POST/PATCH/DELETE par ressource), mais construire les formulaires
   d'ajout/édition/suppression pour ces trois types est un chantier UI
   non trivial en soi. *Mon avis :* pas prioritaire avant lancement —
   `MyCV.tsx` + les champs de base couvrent le chemin critique
   (candidater avec un CV réel) ; ajouter ces éditeurs en fast-follow
   si le profil candidat doit être plus riche avant le lancement.
   → Validé (différé) le 2026-08-09.
4. **Changement d'email non permis depuis l'édition de profil**, faute
   de flux de vérification côté backend (l'email est l'identifiant de
   connexion). *Mon avis :* ne pas construire ce flux pour l'instant
   (vérification, double opt-in, etc. — coût disproportionné pour la
   v1) ; le champ reste affiché en lecture seule dans
   `ProfileEdit.tsx`. → Validé (ne pas construire) le 2026-08-09.

Rappel : la fuite cross-tenant RLS trouvée sur `job_offers` pendant
cette phase a été **corrigée immédiatement** (pas une décision en
attente — une régression d'un comportement déjà validé), et un
garde-fou automatisé (`scripts/check_rls_policy_overlap.py` côté
backend) a depuis été ajouté pour détecter toute policy RLS PERMISSIVE
qui se recombine de la même façon. Détails dans
`talentlink-backend/README.md` → "Found during frontend integration".

## PWA

Le manifeste et le service worker sont générés par `vite-plugin-pwa`.
En production (`npm run build && npm run preview`), l'application est
installable depuis le navigateur (icône d'installation dans la barre
d'adresse / menu "Ajouter à l'écran d'accueil").
