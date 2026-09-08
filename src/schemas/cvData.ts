import { z } from 'zod'

import { DEFAULT_PALETTE, PALETTE_IDS, type PaletteId } from '@/lib/palettes'
import {
  EDUCATION_LEVELS,
  LANGUAGE_LEVELS,
  MODALITIES,
  SHIFTS,
  START_AVAILABILITIES,
} from '@/types/cv'

/**
 * Esquema estructural del CV completo. Se usa al importar un `.json` de
 * respaldo: valida la forma, no la calidad del contenido (de eso se encargan
 * los esquemas por paso y `lib/audit.ts`). Es deliberadamente tolerante para
 * que un respaldo antiguo o incompleto se pueda recuperar igualmente.
 */

const newId = () => crypto.randomUUID()

export const cvDataSchema = z.object({
  // Un respaldo anterior al selector de paletas no trae este campo.
  palette: z.enum(PALETTE_IDS as [PaletteId, ...PaletteId[]]).catch(DEFAULT_PALETTE),
  personal: z.object({
    fullName: z.string().default(''),
    targetRole: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().default(''),
    city: z.string().default(''),
    country: z.string().default(''),
    linkedin: z.string().optional(),
    willingToRelocate: z.boolean().optional(),
  }),
  profile: z.object({ text: z.string().default('') }),
  experience: z
    .array(
      z.object({
        id: z.string().default(newId),
        role: z.string().default(''),
        company: z.string().default(''),
        city: z.string().optional(),
        country: z.string().optional(),
        startDate: z.string().default(''),
        endDate: z.string().optional(),
        isCurrent: z.boolean().default(false),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        id: z.string().default(newId),
        level: z.enum(EDUCATION_LEVELS).catch('Otro'),
        title: z.string().default(''),
        institution: z.string().default(''),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isInProgress: z.boolean().default(false),
      }),
    )
    .default([]),
  skills: z.object({
    technical: z.array(z.string()).default([]),
    soft: z.array(z.string()).default([]),
  }),
  languages: z
    .array(
      z.object({
        id: z.string().default(newId),
        name: z.string().default(''),
        level: z.enum(LANGUAGE_LEVELS).catch('Básico'),
        certification: z.string().optional(),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        id: z.string().default(newId),
        name: z.string().default(''),
        issuer: z.string().default(''),
        date: z.string().optional(),
      }),
    )
    .default([]),
  availability: z
    .object({
      modality: z.array(z.enum(MODALITIES)).optional(),
      shifts: z.array(z.enum(SHIFTS)).optional(),
      startAvailability: z.enum(START_AVAILABILITIES).optional(),
      hasOwnEquipment: z.boolean().optional(),
      hasStableInternet: z.boolean().optional(),
      hasDrivingLicense: z.boolean().optional(),
    })
    .default({}),
  referencesOnRequest: z.boolean().default(true),
  meta: z
    .object({
      createdAt: z.string(),
      updatedAt: z.string(),
      version: z.literal(1),
    })
    .default(() => {
      const now = new Date().toISOString()
      return { createdAt: now, updatedAt: now, version: 1 as const }
    }),
})
