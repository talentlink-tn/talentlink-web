import type { Company } from '@/types'

// Runtime registry for real companies fetched from the backend — lets
// existing components that resolve a company via `getCompany(id)` (JobCard,
// JobDetail, CompanyProfile...) keep working unchanged as screens are
// progressively wired to the real API, without discarding the static
// mock catalogue still used by screens not yet connected.
const liveCompanies = new Map<string, Company>()

export function registerCompany(company: Company) {
  liveCompanies.set(company.id, company)
}

export const companies: Company[] = [
  {
    id: 'bna',
    name: 'BNA Bank',
    logo: 'BNA',
    logoColor: '#0F7A3D',
    sector: 'Banque',
    size: '1000 - 5000 employés',
    location: 'Tunis, Tunisie',
    website: 'www.bna.tn',
    founded: '1959',
    about:
      "Acteur majeur du secteur bancaire en Tunisie, la BNA accompagne les particuliers et les entreprises dans leurs projets avec des solutions innovantes et responsables.",
    agencies: 45,
    followers: 12400,
  },
  {
    id: 'digitus',
    name: 'Digitus Solutions',
    logo: 'D',
    logoColor: '#0EA5A4',
    sector: 'Technologie',
    size: '50 - 200 employés',
    location: 'Ariana, Tunisie',
    website: 'www.digitus-solutions.tn',
    founded: '2014',
    about:
      "Digitus Solutions conçoit des produits digitaux sur-mesure pour les entreprises tunisiennes et internationales : web, mobile et data.",
    agencies: 2,
    followers: 3200,
  },
  {
    id: 'express',
    name: 'Express Logistics',
    logo: 'EXPRESS',
    logoColor: '#1E56D6',
    sector: 'Logistique & Transport',
    size: '500 - 1000 employés',
    location: 'Tunis, Tunisie',
    website: 'www.express-logistics.tn',
    founded: '2001',
    about:
      "Express Logistics est un leader régional de la logistique et de la distribution, au service de plus de 2000 entreprises partenaires.",
    agencies: 18,
    followers: 5100,
  },
  {
    id: 'mpbs',
    name: 'MPBS',
    logo: 'MPBS',
    logoColor: '#16A34A',
    sector: 'Pharmaceutique',
    size: '200 - 500 employés',
    location: 'Sousse, Tunisie',
    website: 'www.mpbs.tn',
    founded: '1998',
    about:
      "Modern Pharmaceutical Business Solutions développe et distribue des solutions pharmaceutiques innovantes sur le marché tunisien et africain.",
    agencies: 4,
    followers: 2100,
  },
  {
    id: 'sopal',
    name: 'Sopal Group',
    logo: 'SOPAL',
    logoColor: '#0F172A',
    sector: 'Industrie',
    size: '1000 - 5000 employés',
    location: 'Tunis, Tunisie',
    website: 'www.sopalgroup.tn',
    founded: '1975',
    about:
      "Sopal Group est un groupe industriel diversifié présent dans l'agroalimentaire, l'emballage et la distribution.",
    agencies: 9,
    followers: 6700,
  },
  {
    id: 'ooredoo',
    name: 'Ooredoo Tunisie',
    logo: 'OO',
    logoColor: '#E4032E',
    sector: 'Télécommunications',
    size: '1000+ employés',
    location: 'Tunis, Tunisie',
    website: 'www.ooredoo.tn',
    founded: '2002',
    about:
      "Ooredoo Tunisie est un opérateur télécom majeur, engagé dans la transformation digitale du pays.",
    agencies: 60,
    followers: 21000,
  },
  {
    id: 'biat',
    name: 'BIAT',
    logo: 'BIAT',
    logoColor: '#1E3A8A',
    sector: 'Banque',
    size: '1000+ employés',
    location: 'Tunis, Tunisie',
    website: 'www.biat.tn',
    founded: '1976',
    about:
      "La BIAT est la première banque privée de Tunisie, reconnue pour son excellence dans l'accompagnement des entreprises.",
    agencies: 200,
    followers: 18500,
  },
  {
    id: 'carrefour',
    name: 'Carrefour Tunisie',
    logo: 'CARR',
    logoColor: '#0A5DC2',
    sector: 'Grande distribution',
    size: '1000+ employés',
    location: 'Tunis, Tunisie',
    website: 'www.carrefour.tn',
    founded: '2001',
    about: "Carrefour Tunisie est un leader de la grande distribution avec un réseau national d'hypermarchés.",
    agencies: 30,
    followers: 9800,
  },
]

export const getCompany = (id: string) => liveCompanies.get(id) ?? companies.find((c) => c.id === id)
