import { useEffect, type ComponentType } from 'react'

import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { Progress } from '@/components/ui/Progress'
import { Step1Personal } from '@/components/wizard/steps/Step1Personal'
import { Step2Profile } from '@/components/wizard/steps/Step2Profile'
import { Step3Experience } from '@/components/wizard/steps/Step3Experience'
import { Step4Education } from '@/components/wizard/steps/Step4Education'
import { Step5Skills } from '@/components/wizard/steps/Step5Skills'
import { Step6Languages } from '@/components/wizard/steps/Step6Languages'
import { Step7Certifications } from '@/components/wizard/steps/Step7Certifications'
import { Step8Availability } from '@/components/wizard/steps/Step8Availability'
import { REVIEW_STEP, STEP_TITLES, TOTAL_STEPS, useWizardStore } from '@/store/wizardStore'

const STEPS: Record<number, ComponentType> = {
  1: Step1Personal,
  2: Step2Profile,
  3: Step3Experience,
  4: Step4Education,
  5: Step5Skills,
  6: Step6Languages,
  7: Step7Certifications,
  8: Step8Availability,
  9: PreviewPanel,
}

export function Wizard() {
  const step = useWizardStore((state) => state.step)
  const toLanding = useWizardStore((state) => state.toLanding)

  // Cada paso empieza arriba: en móvil, si no, el usuario aparece a media página.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const CurrentStep = STEPS[step] ?? Step1Personal
  const isReview = step === REVIEW_STEP

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div
          className={`mx-auto flex w-full flex-col gap-2 px-4 py-3 ${
            isReview ? 'max-w-6xl' : 'max-w-2xl'
          }`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <button
              type="button"
              onClick={toLanding}
              className="text-sm font-medium text-ink transition-[color] duration-150 ease-swift hover:text-accent-hover"
            >
              Generador de CV
            </button>
            <p className="text-xs text-muted tabular-nums">
              Paso {step} de {TOTAL_STEPS} · {STEP_TITLES[step]}
            </p>
          </div>
          <Progress current={step} total={TOTAL_STEPS} />
        </div>
      </header>

      <main
        className={`mx-auto w-full px-4 pt-8 pb-4 ${isReview ? 'max-w-6xl' : 'max-w-2xl'}`}
      >
        {/* La `key` reinicia la animación de entrada en cada paso. */}
        <div key={step} className="enter-up">
          <CurrentStep />
        </div>
      </main>
    </div>
  )
}
