import type { CandidateProfile, RecruiterCandidate } from '@/types'
import avatarYassine from '@/assets/avatar-yassine.svg'
import avatarSarah from '@/assets/avatar-sarah.svg'

export const candidateProfile: CandidateProfile = {
  firstName: 'Yassine',
  lastName: 'Ben Amor',
  title: 'Développeur Full Stack',
  location: 'Tunis, Tunisie',
  email: 'yassine.benamor@gmail.com',
  phone: '+216 20 123 456',
  birthDate: '12 Mars 1996',
  languages: ['Français', 'Anglais', 'Arabe'],
  about:
    "Développeur passionné avec plus de 3 ans d'expérience dans la conception et le développement d'applications web et mobiles. J'aime relever de nouveaux défis et créer des solutions innovantes.",
  avatar: avatarYassine,
  completion: 85,
  experiences: [
    {
      id: 'e1',
      title: 'Développeur Full Stack',
      company: 'Vermeg — Tunis',
      period: '2023 — Présent',
      description: "Développement d'applications bancaires avec React, Node.js et PostgreSQL au sein d'une équipe agile.",
    },
    {
      id: 'e2',
      title: 'Développeur Front-End',
      company: 'Instadeep — Tunis',
      period: '2021 — 2023',
      description: 'Conception d’interfaces pour des produits IA, intégration API et optimisation des performances.',
    },
  ],
  educations: [
    { id: 'ed1', degree: 'Master en Génie Logiciel', school: 'ENSI', period: '2019 — 2021' },
    { id: 'ed2', degree: 'Licence en Informatique', school: 'FST', period: '2016 — 2019' },
    { id: 'ed3', degree: 'Baccalauréat Sciences Techniques', school: 'Lycée Pilote Tunis', period: '2016' },
  ],
  skills: [
    'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git',
    'REST API', 'Agile / Scrum', 'Tests unitaires', 'Flutter', 'CI/CD', 'Figma',
  ],
  certifications: ['AWS Certified Cloud Practitioner', 'Scrum Fundamentals Certified', 'TOEIC 895/990'],
}

export const recruiterProfile = {
  name: 'Sarah Ben Ali',
  title: 'Responsable RH · BNA Bank',
  avatar: avatarSarah,
}

export const recruiterCandidates: RecruiterCandidate[] = [
  { id: 'c1', name: 'Yassine Kheribi', avatarColor: '#2F6FED', role: 'Développeur Full Stack', stage: 'new', appliedAt: 'il y a 2j', matchScore: 92 },
  { id: 'c2', name: 'Meriem Trabelsi', avatarColor: '#7C3AED', role: 'UX/UI Designer', stage: 'new', appliedAt: 'il y a 3j', matchScore: 85 },
  { id: 'c3', name: 'Sarah Jendoubi', avatarColor: '#EA580C', role: 'Chef de projet Digital', stage: 'interview', appliedAt: 'il y a 5j', matchScore: 88 },
  { id: 'c4', name: 'Mehdi Bouzidi', avatarColor: '#0EA5A4', role: 'Data Analyst', stage: 'interview', appliedAt: 'il y a 6j', matchScore: 79 },
  { id: 'c5', name: 'Rania Slimani', avatarColor: '#16A34A', role: 'Développeur Full Stack', stage: 'final', appliedAt: 'il y a 1 sem', matchScore: 95 },
  { id: 'c6', name: 'Ahmed Ben Salah', avatarColor: '#DC2626', role: 'DevOps Engineer', stage: 'new', appliedAt: 'il y a 8j', matchScore: 74 },
]
