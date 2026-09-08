import { z } from 'zod'

import { MONTH_YEAR_PATTERN, toSortKey } from '@/lib/formatDate'

export const monthYear = z
  .string()
  .trim()
  .regex(MONTH_YEAR_PATTERN, 'Escribe la fecha como MM/AAAA, por ejemplo 03/2021')

export const optionalMonthYear = z.union([monthYear, z.literal('')]).optional()

/** True si `end` es igual o posterior a `start`. Fechas incompletas no bloquean. */
export function endIsAfterStart(start?: string, end?: string): boolean {
  const from = toSortKey(start)
  const to = toSortKey(end)
  if (from === null || to === null) return true
  return to >= from
}
