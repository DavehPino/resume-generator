import { z } from 'zod'

import { MONTH_YEAR_PATTERN } from '@/lib/formatDate'
import { endIsAfterStart } from '@/schemas/common'
import { EDUCATION_LEVELS } from '@/types/cv'

/** Paso 4 — un estudio. Las fechas son opcionales: mucha gente no las recuerda. */
export const educationSchema = z
  .object({
    level: z.enum(EDUCATION_LEVELS),
    title: z.string().trim().min(2, 'Escribe el nombre del título o del curso'),
    institution: z.string().trim().min(2, 'Escribe dónde estudiaste'),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    isInProgress: z.boolean(),
  })
  .superRefine((value, ctx) => {
    for (const field of ['startDate', 'endDate'] as const) {
      const raw = value[field]
      if (raw && !MONTH_YEAR_PATTERN.test(raw)) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Escribe la fecha como MM/AAAA, por ejemplo 12/2020',
        })
      }
    }
    if (!value.isInProgress && !endIsAfterStart(value.startDate, value.endDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'La fecha de término no puede ser anterior a la de inicio',
      })
    }
  })

export type EducationForm = z.infer<typeof educationSchema>
