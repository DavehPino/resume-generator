/**
 * Modelo de datos del CV. Ver PROMPT-AGENTE-CV.md §5.
 *
 * Las listas `*_OPTIONS` existen para poblar selects y grupos de chips sin
 * duplicar los literales: cada union se deriva de su const array.
 */

import { DEFAULT_PALETTE, type PaletteId } from '@/lib/palettes'

/** Fecha en formato "MM/AAAA". */
export type MonthYear = string

/** Nomenclatura educativa argentina. */
export const EDUCATION_LEVELS = [
  'Secundario',
  'Terciario / Técnico',
  'Universitario',
  'Posgrado',
  'Curso o capacitación',
  'Otro',
] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

export const LANGUAGE_LEVELS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'] as const
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number]

export const MODALITIES = ['Presencial', 'Híbrido', 'Remoto'] as const
export type Modality = (typeof MODALITIES)[number]

export const SHIFTS = [
  'Diurno',
  'Vespertino',
  'Nocturno',
  'Turnos rotativos',
  'Fines de semana',
] as const
export type Shift = (typeof SHIFTS)[number]

export const START_AVAILABILITIES = [
  'Inmediata',
  'En 15 días',
  'En 30 días',
  'A convenir',
] as const
export type StartAvailability = (typeof START_AVAILABILITIES)[number]

export interface PersonalInfo {
  fullName: string
  /** Puesto al que aplica. Va bajo el nombre; es la palabra clave con más peso para el ATS. */
  targetRole: string
  email: string
  phone: string
  city: string
  country: string
  linkedin?: string
  willingToRelocate?: boolean
}

export interface ProfileSummary {
  text: string
}

export interface Experience {
  id: string
  role: string
  company: string
  city?: string
  country?: string
  startDate: MonthYear
  /** Vacío cuando `isCurrent` es true. */
  endDate?: MonthYear
  isCurrent: boolean
  bullets: string[]
}

export interface Education {
  id: string
  level: EducationLevel
  title: string
  institution: string
  startDate?: MonthYear
  endDate?: MonthYear
  isInProgress: boolean
}

export interface Language {
  id: string
  name: string
  level: LanguageLevel
  certification?: string
}

export interface Skills {
  /** Herramientas, software, sistemas. */
  technical: string[]
  soft: string[]
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date?: MonthYear
}

export interface Availability {
  modality?: Modality[]
  shifts?: Shift[]
  startAvailability?: StartAvailability
  /** Relevante para call center remoto. */
  hasOwnEquipment?: boolean
  hasStableInternet?: boolean
  hasDrivingLicense?: boolean
}

export interface CvData {
  /** Paleta de color del documento. Ver `lib/palettes.ts`. */
  palette: PaletteId
  personal: PersonalInfo
  profile: ProfileSummary
  experience: Experience[]
  education: Education[]
  skills: Skills
  languages: Language[]
  certifications: Certification[]
  availability: Availability
  referencesOnRequest: boolean
  meta: { createdAt: string; updatedAt: string; version: 1 }
}

export function createEmptyCv(): CvData {
  const now = new Date().toISOString()
  return {
    palette: DEFAULT_PALETTE,
    personal: {
      fullName: '',
      targetRole: '',
      email: '',
      phone: '',
      city: '',
      country: '',
    },
    profile: { text: '' },
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    languages: [],
    certifications: [],
    availability: {},
    referencesOnRequest: true,
    meta: { createdAt: now, updatedAt: now, version: 1 },
  }
}
