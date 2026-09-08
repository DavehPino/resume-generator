import { preparePrintDom } from '@/lib/exportPdf'
import { PALETTES, type PaletteId } from '@/lib/palettes'
import { buildSampleCv } from '@/lib/sampleData'
import { useCvStore } from '@/store/cvStore'
import { REVIEW_STEP, useWizardStore } from '@/store/wizardStore'

/**
 * Atajo de desarrollo para no teclear un CV completo cada vez que se revisa la
 * plantilla:
 *
 *   ?demo=1       carga el CV de ejemplo y salta a la revisión
 *   ?demo=stepN   carga el ejemplo y abre el paso N (para revisar su maqueta)
 *   ?demo=sinexp  el ejemplo sin experiencia laboral, para comprobar que el
 *                 documento se sostiene igual
 *   ?demo=ai      abre el modal de edición con IA ya desplegado
 *   ?demo=print   además deja el DOM listo para imprimir, lo que permite
 *                 validar el PDF con Chrome en headless
 *
 * Este módulo se importa dinámicamente y solo bajo `import.meta.env.DEV`, así
 * que no entra en el build de producción.
 */
export function applyDemoFromUrl(): void {
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (!demo) return

  const sample = buildSampleCv()
  if (demo === 'sinexp') sample.experience = []

  // `&palette=azul` para revisar una paleta concreta sin hacer clic.
  const palette = new URLSearchParams(window.location.search).get('palette')
  if (palette && palette in PALETTES) sample.palette = palette as PaletteId
  useCvStore.getState().loadCv(sample)

  const step = /^step(\d)$/.exec(demo)
  useWizardStore.getState().goTo(step ? Number(step[1]) : REVIEW_STEP)

  if (demo === 'print') {
    window.setTimeout(preparePrintDom, 300)
  }
}
