import { PencilLine, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { AiEditModal } from '@/components/preview/AiEditModal'
import { ManualEditModal } from '@/components/preview/ManualEditModal'
import { Button } from '@/components/ui/Button'

/** Dos caminos para retocar el texto del CV sin volver a recorrer el wizard. */
export function EditCard() {
  // `?demo=ai` abre el modal de IA directamente para poder revisarlo sin hacer
  // clic. Solo en desarrollo; en producción la condición se elimina en el build.
  const [aiOpen, setAiOpen] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'ai',
  )
  const [manualOpen, setManualOpen] = useState(
    () =>
      import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'manual',
  )

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-border">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-ink">Editar el contenido</h2>
        <p className="text-xs text-muted">
          Mejorá la redacción, acortá los logros o sumá palabras clave del aviso.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="pr-3.5 pl-3" onClick={() => setAiOpen(true)}>
          <Sparkles aria-hidden strokeWidth={2} className="size-4 text-accent-hover" />
          Con IA
        </Button>
        <Button variant="secondary" className="pr-3.5 pl-3" onClick={() => setManualOpen(true)}>
          <PencilLine aria-hidden strokeWidth={1.5} className="size-4" />
          A mano
        </Button>
      </div>

      <p className="text-xs text-muted">
        La IA trabaja solo sobre lo que ya escribiste: no inventa empleos ni datos, y vos aprobás
        cada cambio antes de aplicarlo.
      </p>

      <AiEditModal open={aiOpen} onClose={() => setAiOpen(false)} />
      <ManualEditModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </section>
  )
}
