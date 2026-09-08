import { cvDataSchema } from '@/schemas/cvData'
import type { CvData } from '@/types/cv'

/**
 * Exportación a PDF (PROMPT-AGENTE-CV.md §8).
 *
 * El CV se imprime clonando el nodo real del documento dentro de un contenedor
 * que cuelga directamente de <body>. Así el resultado no depende de dónde esté
 * montado el preview ni de la escala que use para caber en móvil, y el PDF
 * conserva texto seleccionable: se imprime DOM, no una imagen.
 *
 * La preparación va enganchada a `beforeprint`, así que el resultado es el
 * mismo si el usuario pulsa el botón o si imprime con Ctrl+P.
 */

const SOURCE_ID = 'cv-document'
const PRINT_ROOT_ID = 'print-root'

let printRoot: HTMLElement | null = null
let previousTitle: string | null = null

/** "Camila Ayelén Ferreyra" -> "Camila_Ayelen_Ferreyra_CV" */
export function buildFileName(fullName: string): string {
  const clean = fullName
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join('_')
  return clean ? `${clean}_CV` : 'CV'
}

/** Deja en el <body> únicamente un clon del CV. Idempotente. */
export function preparePrintDom(): void {
  if (printRoot) return
  const source = document.getElementById(SOURCE_ID)
  if (!source) return

  printRoot = document.createElement('div')
  printRoot.id = PRINT_ROOT_ID

  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  printRoot.appendChild(clone)

  document.body.appendChild(printRoot)
  document.body.classList.add('printing')
}

function cleanupPrintDom(): void {
  printRoot?.remove()
  printRoot = null
  document.body.classList.remove('printing')
  if (previousTitle !== null) {
    document.title = previousTitle
    previousTitle = null
  }
}

/** Se instala una vez, al arrancar la app. */
export function installPrintHandlers(): void {
  window.addEventListener('beforeprint', preparePrintDom)
  window.addEventListener('afterprint', cleanupPrintDom)
}

/**
 * Abre el diálogo de impresión. El nombre de archivo que propone el navegador
 * sale de `document.title`, por eso se cambia justo antes y se restaura después.
 */
export function printCv(fullName: string): void {
  previousTitle = document.title
  document.title = buildFileName(fullName)
  preparePrintDom()
  window.print()
  // Safari en iOS no siempre dispara `afterprint`; red de seguridad.
  window.setTimeout(cleanupPrintDom, 60_000)
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Respaldo de los datos, por si el usuario limpia el navegador. */
export function downloadCvJson(cv: CvData): void {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `${buildFileName(cv.personal.fullName)}_datos.json`)
}

export type ImportResult = { ok: true; data: CvData } | { ok: false; error: string }

export async function readCvJson(file: File): Promise<ImportResult> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' }
  }

  const result = cvDataSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      error: 'El archivo no tiene el formato de un CV guardado por esta aplicación.',
    }
  }
  return { ok: true, data: result.data }
}
