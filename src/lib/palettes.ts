/**
 * Paletas del DOCUMENTO del CV (no de la interfaz de la app).
 *
 * Solo cambia el acento: títulos de sección, puesto objetivo, empresas y
 * viñetas. El cuerpo del texto sigue siendo casi negro en todas, porque es lo
 * que se lee y no hay color que mejore eso.
 *
 * Todos los acentos son tonos oscuros a propósito: en escala de grises caen a
 * un gris legible, así que el CV sigue funcionando impreso en blanco y negro.
 * Si agregás una paleta, mantené esa condición.
 *
 * `rule` es el acento aclarado (~35% sobre blanco) para la línea fina bajo los
 * títulos. Va explícito y no calculado para que el resultado impreso sea
 * exactamente el mismo en todos los navegadores.
 */

export const PALETTES = {
  terracota: { label: 'Terracota', accent: '#9a3412', rule: '#dcb8ac' },
  grafito: { label: 'Grafito', accent: '#1f2937', rule: '#b1b4b9' },
  azul: { label: 'Azul', accent: '#1e40af', rule: '#b0bce3' },
  verde: { label: 'Verde', accent: '#166534', rule: '#aec9b8' },
  bordo: { label: 'Bordó', accent: '#9f1239', rule: '#deacba' },
  violeta: { label: 'Violeta', accent: '#5b21b6', rule: '#c6b2e6' },
} as const

export type PaletteId = keyof typeof PALETTES

export const DEFAULT_PALETTE: PaletteId = 'terracota'

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[]

export function paletteOf(id: string | undefined) {
  return PALETTES[(id ?? '') as PaletteId] ?? PALETTES[DEFAULT_PALETTE]
}
