import { z } from 'zod'

import { LANGUAGE_LEVELS } from '@/types/cv'

/** Paso 6 — un idioma. */
export const languageSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el idioma'),
  level: z.enum(LANGUAGE_LEVELS),
  certification: z.string().trim().optional(),
})

export type LanguageForm = z.infer<typeof languageSchema>
