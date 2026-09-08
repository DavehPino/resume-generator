import { ArrowRight, Clock, FileCheck2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { hasSavedProgress, useCvStore } from '@/store/cvStore'
import { STEP_TITLES, useWizardStore } from '@/store/wizardStore'

const BENEFITS = [
  { icon: Clock, label: 'Listo en 10 minutos' },
  { icon: FileCheck2, label: 'Compatible con filtros automáticos' },
  { icon: ShieldCheck, label: 'Sin registro' },
]

export function Landing() {
  const hasProgress = useCvStore(hasSavedProgress)
  const reset = useCvStore((state) => state.reset)
  const savedStep = useWizardStore((state) => state.step)
  const { start, resume, resetWizard } = useWizardStore()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-10 px-5 py-16">
      <div className="flex flex-col gap-5">
        <p className="enter-up text-sm font-medium text-accent-hover">Generador de CV</p>

        <h1 className="enter-up enter-delay-1 text-4xl leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl">
          Tu currículum, hecho para pasar el primer filtro
        </h1>

        <p className="enter-up enter-delay-2 max-w-xl text-base text-muted">
          Te hacemos las preguntas justas y armamos un CV optimizado para filtros ATS: el
          software que lee tu currículum antes que una persona. Pensado para call center,
          atención al cliente, retail y trabajos similares.
        </p>
      </div>

      <div className="enter-up enter-delay-3 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            className="pr-[22px] pl-6"
            onClick={hasProgress ? resume : start}
          >
            {hasProgress ? 'Continuar donde lo dejé' : 'Crear mi CV'}
            <ArrowRight aria-hidden strokeWidth={2} className="size-4" />
          </Button>

          {hasProgress && (
            <Button
              variant="quiet"
              onClick={() => {
                const confirmed = window.confirm(
                  '¿Seguro que quieres empezar de cero? Se borrarán los datos guardados en este navegador.',
                )
                if (!confirmed) return
                reset()
                resetWizard()
                start()
              }}
            >
              Empezar de cero
            </Button>
          )}
        </div>

        {hasProgress && (
          <p className="text-xs text-muted">
            Tienes un CV a medio hacer, guardado en este navegador. Quedaste en «
            {STEP_TITLES[savedStep]}».
          </p>
        )}
      </div>

      <ul className="enter-up enter-delay-3 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
        {BENEFITS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm text-muted">
            <Icon aria-hidden strokeWidth={1.5} className="size-4 text-accent-hover" />
            {label}
          </li>
        ))}
      </ul>
    </main>
  )
}
