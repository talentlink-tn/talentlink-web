// Label maps between the backend's lowercase enum values and the
// French display strings the existing UI components/types expect.
import type { ContractType, WorkMode } from '@/types'

export type BackendContractType = 'cdi' | 'cdd' | 'stage' | 'freelance' | 'alternance'
export type BackendWorkMode = 'on_site' | 'hybrid' | 'remote'
export type BackendExperienceLevel = 'junior' | 'confirmed' | 'senior' | 'expert'
export type BackendEducationLevel = 'none' | 'bac' | 'bac2' | 'bac3' | 'bac5' | 'doctorate'
export type BackendLanguageProficiency = 'basic' | 'conversational' | 'professional' | 'fluent' | 'native'

const CONTRACT_TYPE_TO_FR: Record<BackendContractType, ContractType> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
  alternance: 'Alternance',
}
const CONTRACT_TYPE_TO_BACKEND: Record<ContractType, BackendContractType> = {
  CDI: 'cdi',
  CDD: 'cdd',
  Stage: 'stage',
  Freelance: 'freelance',
  Alternance: 'alternance',
}

const WORK_MODE_TO_FR: Record<BackendWorkMode, WorkMode> = {
  on_site: 'Sur site',
  hybrid: 'Hybride',
  remote: 'Télétravail',
}
const WORK_MODE_TO_BACKEND: Record<WorkMode, BackendWorkMode> = {
  'Sur site': 'on_site',
  Hybride: 'hybrid',
  Télétravail: 'remote',
}

const EXPERIENCE_LEVEL_LABEL: Record<BackendExperienceLevel, string> = {
  junior: 'Junior (0-2 ans)',
  confirmed: 'Confirmé (2-5 ans)',
  senior: 'Senior (5-10 ans)',
  expert: 'Expert (10+ ans)',
}

const EDUCATION_LEVEL_LABEL: Record<BackendEducationLevel, string> = {
  none: 'Non spécifié',
  bac: 'Bac',
  bac2: 'Bac+2',
  bac3: 'Bac+3',
  bac5: 'Bac+5',
  doctorate: 'Doctorat',
}

const LANGUAGE_PROFICIENCY_LABEL: Record<BackendLanguageProficiency, string> = {
  basic: 'Notions',
  conversational: 'Conversationnel',
  professional: 'Professionnel',
  fluent: 'Courant',
  native: 'Langue maternelle',
}

export const contractTypeToFr = (value: BackendContractType): ContractType => CONTRACT_TYPE_TO_FR[value]
export const contractTypeToBackend = (value: ContractType): BackendContractType => CONTRACT_TYPE_TO_BACKEND[value]
export const workModeToFr = (value: BackendWorkMode): WorkMode => WORK_MODE_TO_FR[value]
export const workModeToBackend = (value: WorkMode): BackendWorkMode => WORK_MODE_TO_BACKEND[value]
export const experienceLevelLabel = (value: BackendExperienceLevel): string => EXPERIENCE_LEVEL_LABEL[value]
export const educationLevelLabel = (value: BackendEducationLevel): string => EDUCATION_LEVEL_LABEL[value]
export const languageProficiencyLabel = (value: BackendLanguageProficiency): string =>
  LANGUAGE_PROFICIENCY_LABEL[value]

export function timeAgoFr(iso: string | null | undefined): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `Publié il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Publié il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Publié hier'
  if (days < 30) return `Publié il y a ${days} jours`
  const months = Math.floor(days / 30)
  return `Publié il y a ${months} mois`
}
