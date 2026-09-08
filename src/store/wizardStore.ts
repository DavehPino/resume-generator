import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { debouncedLocalStorage } from '@/store/persistStorage'

export const TOTAL_STEPS = 9
export const REVIEW_STEP = 9

export const STEP_TITLES: Record<number, string> = {
  1: 'Datos personales',
  2: 'Perfil profesional',
  3: 'Experiencia laboral',
  4: 'Educación',
  5: 'Habilidades',
  6: 'Idiomas',
  7: 'Certificaciones y cursos',
  8: 'Disponibilidad',
  9: 'Revisión',
}

type View = 'landing' | 'wizard'

interface WizardState {
  view: View
  step: number
  /** Paso más lejano alcanzado, para permitir volver a saltar hacia adelante. */
  furthest: number
  /** El usuario vino desde la revisión a corregir algo: al continuar, vuelve allí. */
  returningToReview: boolean
  /** La explicación de qué es un CV ATS se muestra sola una única vez. */
  atsExplainerSeen: boolean
  markAtsExplainerSeen: () => void

  start: () => void
  resume: () => void
  goTo: (step: number, options?: { fromReview?: boolean }) => void
  next: () => void
  back: () => void
  toLanding: () => void
  resetWizard: () => void
}

const clamp = (step: number) => Math.min(Math.max(step, 1), TOTAL_STEPS)

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      view: 'landing',
      step: 1,
      furthest: 1,
      returningToReview: false,
      atsExplainerSeen: false,

      markAtsExplainerSeen: () => set({ atsExplainerSeen: true }),

      start: () => set({ view: 'wizard', step: 1, furthest: 1, returningToReview: false }),
      resume: () => set({ view: 'wizard', returningToReview: false }),

      goTo: (step, options) =>
        set((state) => {
          const target = clamp(step)
          return {
            view: 'wizard',
            step: target,
            furthest: Math.max(state.furthest, target),
            returningToReview: options?.fromReview ?? false,
          }
        }),

      next: () =>
        set((state) => {
          const target = state.returningToReview ? REVIEW_STEP : clamp(state.step + 1)
          return {
            step: target,
            furthest: Math.max(state.furthest, target),
            returningToReview: false,
          }
        }),

      // Desde el primer paso, "Atrás" sale a la landing en lugar de no hacer nada.
      back: () =>
        set((state) =>
          state.step <= 1
            ? { view: 'landing', returningToReview: false }
            : { step: clamp(state.step - 1), returningToReview: false },
        ),

      toLanding: () => set({ view: 'landing', returningToReview: false }),
      resetWizard: () =>
        set({ view: 'landing', step: 1, furthest: 1, returningToReview: false }),
    }),
    {
      name: 'cv-generator:wizard',
      version: 1,
      storage: createJSONStorage(() => debouncedLocalStorage),
    },
  ),
)
