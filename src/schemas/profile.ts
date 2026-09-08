import { z } from 'zod'

import { PROFILE_MAX } from '@/lib/audit'

/**
 * Paso 2 — Perfil profesional.
 * El mínimo duro son 80 caracteres para no bloquear a nadie; el auditor del
 * paso 9 es el que empuja hacia los 200–600 recomendados.
 */
export const profileSchema = z.object({
  text: z
    .string()
    .trim()
    .min(80, 'Escribe al menos un par de frases sobre ti (mínimo 80 caracteres)')
    .max(PROFILE_MAX, `Máximo ${PROFILE_MAX} caracteres`),
})

export type ProfileForm = z.infer<typeof profileSchema>
