import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { AiEditModal } from '@/components/preview/AiEditModal'
import { Button } from '@/components/ui/Button'

export function AiEditCard() {
  // `?demo=ai` abre el modal directamente para poder revisarlo sin hacer clic.
  // Solo en desarrollo; en producción la condición se elimina en el build.
  const [open, setOpen] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'ai',
  )

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-border">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-ink">Editar con IA</h2>
        <p className="text-xs text-muted">
          Pedile que mejore la redacción, acorte los logros o sume palabras clave del aviso.
        </p>
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full pr-6 pl-[22px]"
        onClick={() => setOpen(true)}
      >
        <Sparkles aria-hidden strokeWidth={2} className="size-4 text-accent-hover" />
        Editar con IA
      </Button>

      <p className="text-xs text-muted">
        Trabaja solo sobre lo que ya escribiste: no inventa empleos ni datos, y vos aprobás cada
        cambio antes de aplicarlo.
      </p>

      <AiEditModal open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
