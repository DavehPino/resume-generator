import { z } from 'zod'

/** Paso 5 — Habilidades. Mínimo 3 entre técnicas y blandas. */
export const skillsSchema = z
  .object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
  })
  .refine(
    (value) => value.technical.length + value.soft.length >= 3,
    'Agrega al menos 3 habilidades: es la sección donde el filtro busca coincidencias exactas',
  )

export type SkillsForm = z.infer<typeof skillsSchema>
