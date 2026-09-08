import type { MonthYear } from '@/types/cv'

export const MONTH_YEAR_PATTERN = /^(0[1-9]|1[0-2])\/(19|20)\d{2}$/

export function isValidMonthYear(value: string | undefined): value is MonthYear {
  return typeof value === 'string' && MONTH_YEAR_PATTERN.test(value)
}

/**
 * Convierte "MM/AAAA" en un entero comparable (AAAAMM). Devuelve null si la
 * fecha no es válida, para que quien compare decida qué hacer.
 */
export function toSortKey(value: string | undefined): number | null {
  if (!isValidMonthYear(value)) return null
  const [month, year] = value.split('/')
  return Number(year) * 100 + Number(month)
}

/**
 * Formatea el rango de fechas tal y como debe salir en el CV: "MM/AAAA – MM/AAAA".
 * Un trabajo en curso termina en "Actualidad" (nunca en una fecha vacía).
 */
export function formatRange(
  start: string | undefined,
  end: string | undefined,
  isOngoing: boolean,
): string {
  const from = start?.trim() ?? ''
  const to = isOngoing ? 'Actualidad' : (end?.trim() ?? '')
  if (!from && !to) return ''
  if (!from) return to
  if (!to) return from
  return `${from} – ${to}`
}

/** Autoformatea lo que el usuario teclea en un campo de mes/año: "032021" -> "03/2021". */
export function maskMonthYear(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Ordena de más reciente a más antiguo; lo que está en curso va primero. */
export function byMostRecent<T extends { startDate?: string; endDate?: string }>(
  a: T & { isCurrent?: boolean; isInProgress?: boolean },
  b: T & { isCurrent?: boolean; isInProgress?: boolean },
): number {
  const ongoing = (item: typeof a) => item.isCurrent === true || item.isInProgress === true
  if (ongoing(a) !== ongoing(b)) return ongoing(a) ? -1 : 1
  const keyA = toSortKey(a.endDate) ?? toSortKey(a.startDate) ?? 0
  const keyB = toSortKey(b.endDate) ?? toSortKey(b.startDate) ?? 0
  return keyB - keyA
}
