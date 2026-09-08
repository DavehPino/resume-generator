import { z } from 'zod'

/** Paso 1 — Datos personales. */
export const personalSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Escribe tu nombre completo')
    .refine((value) => value.split(/\s+/).length >= 2, 'Incluye tu nombre y tu apellido'),
  targetRole: z
    .string()
    .trim()
    .min(3, 'Escribe el puesto al que quieres postular'),
  email: z.email('Revisa tu correo: parece que falta algo'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{8,}$/, 'Escribe tu teléfono con característica, por ejemplo +54 9 11 1234 5678'),
  city: z.string().trim().min(2, 'Escribe tu ciudad'),
  country: z.string().trim().min(2, 'Escribe tu país'),
  linkedin: z.string().trim().optional(),
  willingToRelocate: z.boolean().optional(),
})

export type PersonalForm = z.infer<typeof personalSchema>
