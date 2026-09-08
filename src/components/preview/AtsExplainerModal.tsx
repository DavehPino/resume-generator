import { FileSearch, ScanLine, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

/**
 * Explica qué es un CV compatible con ATS y por qué el documento se ve así.
 *
 * Se abre solo la primera vez que alguien llega a la revisión, y después queda
 * disponible desde la tarjeta de compatibilidad.
 *
 * Deliberadamente sin estadísticas: circulan cifras muy citadas sobre el
 * porcentaje de CV descartados por filtros automáticos que no tienen una
 * fuente seria detrás. Se explica el mecanismo, que es verificable, en vez de
 * un número que suena contundente y no se puede sostener.
 */

const SECTIONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ScanLine,
    title: '¿Qué es un ATS?',
    body: 'Es el software que usan las empresas para recibir postulaciones. Cuando mandás tu CV a un portal de empleo o a una empresa mediana o grande, lo más probable es que primero lo procese un programa y no una persona.',
  },
  {
    icon: FileSearch,
    title: 'Qué hace con tu CV',
    body: 'Intenta convertir tu archivo en datos ordenados: nombre, contacto, dónde trabajaste, cuándo y qué estudiaste. Después el reclutador busca entre los candidatos filtrando por esos campos y por las palabras del aviso. Si el programa no logra leer tu CV, tus datos quedan incompletos y no aparecés en esa búsqueda.',
  },
  {
    icon: UserCheck,
    title: 'Por qué tu CV se ve así',
    body: 'Los diseños con dos columnas, tablas, foto o texto dentro de imágenes confunden al lector automático: mezcla el orden de las frases o directamente no encuentra nada. Por eso este CV va en una sola columna, con texto real, títulos de sección estándar y fechas en formato MM/AAAA.',
  },
]

export function AtsExplainerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Por qué tu CV se ve así">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <section key={title} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-bg/60 text-accent-hover">
                <Icon aria-hidden strokeWidth={1.5} className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="text-sm font-medium text-ink">{title}</h3>
                <p className="text-sm text-muted">{body}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="rounded-2xl px-4 py-3 shadow-border">
          <p className="text-sm text-muted">
            <strong className="font-medium text-ink">¿Y si lo lee una persona?</strong> Funciona
            igual de bien. Un CV ordenado, sin adornos y con la información donde se espera
            encontrarla se lee más rápido. En atención al cliente, retail y operaciones, un CV
            sobrio transmite prolijidad.
          </p>
        </div>

        <div className="flex justify-end">
          {/* Sin esto el foco cae en la «X» de cerrar. */}
          <Button variant="primary" autoFocus onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  )
}
