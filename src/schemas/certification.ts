import { z } from 'zod'

import { MONTH_YEAR_PATTERN } from '@/lib/formatDate'

/** Paso 7 — una certificación o curso. */
export const certificationSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del curso o certificación'),
  issuer: z.string().trim().min(2, 'Escribe quién lo impartió'),
  date: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || MONTH_YEAR_PATTERN.test(value),
      'Escribe la fecha como MM/AAAA, por ejemplo 08/2022',
    ),
})

export type CertificationForm = z.infer<typeof certificationSchema>
