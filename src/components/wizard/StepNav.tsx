import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

interface StepNavProps {
  onBack: () => void
  /** Si el paso es un <form>, el botón envía; si no, ejecuta este manejador. */
  submit?: boolean
  onContinue?: () => void
  continueLabel?: string
  /** Acción alternativa del paso: "Omitir por ahora", "No tengo experiencia…". */
  secondary?: ReactNode
}

/**
 * Navegación del paso. Se queda pegada abajo para que en móvil el botón
 * principal esté siempre a la vista, sin tener que hacer scroll hasta el final.
 * El borde superior es un separador estructural, por eso es borde y no sombra.
 */
export function StepNav({
  onBack,
  submit = false,
  onContinue,
  continueLabel = 'Continuar',
  secondary,
}: StepNavProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="pr-4 pl-3">
          <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4" />
          Atrás
        </Button>
        <div className="flex-1" />
        {secondary}
        <Button
          variant="primary"
          size="lg"
          type={submit ? 'submit' : 'button'}
          onClick={submit ? undefined : onContinue}
          // Padding óptico: 2 px menos del lado del icono.
          className="pr-[22px] pl-6"
        >
          {continueLabel}
          <ArrowRight aria-hidden strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </div>
  )
}
