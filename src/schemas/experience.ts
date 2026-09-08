import { z } from 'zod'

import { MONTH_YEAR_PATTERN } from '@/lib/formatDate'
import { endIsAfterStart, monthYear } from '@/schemas/common'

/**
 * Paso 3 — una experiencia laboral.
 *
 * Los logros entran como `{ value }` porque es lo que necesita `useFieldArray`,
 * y salen ya normalizados como `string[]`, que es lo que guarda el store.
 */
export const experienceSchema = z
  .object({
    role: z.string().trim().min(2, 'Escribe el cargo que tenías'),
    company: z.string().trim().min(2, 'Escribe el nombre de la empresa'),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    startDate: monthYear,
    endDate: z.string().trim().optional(),
    isCurrent: z.boolean(),
    bullets: z
      .array(
        z.object({
          value: z.string().trim().max(200, 'Deja cada logro en una sola idea'),
        }),
      )
      .transform((list) => list.map((item) => item.value).filter(Boolean))
      .pipe(
        z
          .array(z.string())
          .min(1, 'Agrega al menos una tarea o logro de este puesto')
          .max(5, 'Máximo 5 logros por puesto'),
      ),
  })
  .superRefine((value, ctx) => {
    if (value.isCurrent) return
    if (!value.endDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Indica cuándo terminaste, o marca que sigues trabajando aquí',
      })
      return
    }
    if (!MONTH_YEAR_PATTERN.test(value.endDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Escribe la fecha como MM/AAAA, por ejemplo 08/2023',
      })
      return
    }
    if (!endIsAfterStart(value.startDate, value.endDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'La fecha de término no puede ser anterior a la de inicio',
      })
    }
  })

export type ExperienceInput = z.input<typeof experienceSchema>
export type ExperienceOutput = z.output<typeof experienceSchema>
