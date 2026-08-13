export type ProfileType = 'candidate' | 'employee' | 'recruiter'

export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Alternance'
export type WorkMode = 'Sur site' | 'Hybride' | 'Télétravail'

export interface Company {
  id: string
  slug?: string
  name: string
  logo: string
  logoColor: string
  sector: string
  size: string
  location: string
  website: string
  founded: string
  about: string
  agencies?: number
  followers?: number
}

export interface Job {
  id: string
  publicSlug?: string
  title: string
  companyId: string
  location: string
  contract: ContractType
  mode: WorkMode
  postedAt: string
  isNew: boolean
  salaryMin: number
  salaryMax: number
  experience: string
  education: string
  startDate: string
  workTime: string
  skills: string[]
  description: string
  responsibilities: string[]
  profile: string[]
  benefits: { icon: string; label: string }[]
  applicants: number
  matchScore?: number
  category: string
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'technical_test'
  | 'decision'
  | 'accepted'
  | 'refused'

export interface ApplicationStep {
  key: 'submitted' | 'under_review' | 'interview' | 'technical_test' | 'decision'
  label: string
  date?: string
  state: 'done' | 'current' | 'upcoming'
}

export interface ApplicationDocument {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image'
  date: string
}

export interface Application {
  id: string
  jobId: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  steps: ApplicationStep[]
  evaluation: {
    overall: number
    technical: number
    experience: number
    training: number
    softSkills: number
    languages: number
  }
  documents: ApplicationDocument[]
  interview?: {
    type: string
    duration: string
    with: string
    format: string
    objective: string
    slots: { id: string; day: string; date: string; time: string }[]
    selectedSlotId?: string
  }
}

export interface NotificationItem {
  id: string
  category: 'application' | 'message' | 'offer' | 'system'
  icon: string
  title: string
  description: string
  time: string
  read: boolean
  href?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  period: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  period: string
}

export interface CandidateProfile {
  firstName: string
  lastName: string
  title: string
  location: string
  email: string
  phone: string
  birthDate: string
  languages: string[]
  about: string
  avatar: string
  completion: number
  experiences: Experience[]
  educations: Education[]
  skills: string[]
  certifications: string[]
}

export interface RecruiterCandidate {
  id: string
  name: string
  avatarColor: string
  role: string
  stage: 'new' | 'interview' | 'final'
  appliedAt: string
  matchScore: number
}
