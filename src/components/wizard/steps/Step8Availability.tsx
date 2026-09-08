import { Button } from '@/components/ui/Button'
import { CheckOption, Chip } from '@/components/ui/Chip'
import { StepNav } from '@/components/wizard/StepNav'
import { StepHeading } from '@/components/wizard/StepShell'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'
import {
  MODALITIES,
  SHIFTS,
  START_AVAILABILITIES,
  type Modality,
  type Shift,
  type StartAvailability,
} from '@/types/cv'

export function Step8Availability() {
  const availability = useCvStore((state) => state.data.availability)
  const setAvailability = useCvStore((state) => state.setAvailability)
  const { next, back } = useWizardStore()

  const toggleIn = <T extends string>(list: T[] | undefined, value: T): T[] => {
    const current = list ?? []
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Tu disponibilidad"
        description="En call center y retail esto se pregunta siempre. Decirlo desde el CV te ahorra una ronda de filtros."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink">Modalidad</h2>
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map((option) => (
            <Chip
              key={option}
              label={option}
              pressed={availability.modality?.includes(option) ?? false}
              onToggle={() =>
                setAvailability({
                  ...availability,
                  modality: toggleIn<Modality>(availability.modality, option),
                })
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink">Jornada</h2>
        <div className="flex flex-wrap gap-2">
          {SHIFTS.map((option) => (
            <Chip
              key={option}
              label={option}
              pressed={availability.shifts?.includes(option) ?? false}
              onToggle={() =>
                setAvailability({
                  ...availability,
                  shifts: toggleIn<Shift>(availability.shifts, option),
                })
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink">¿Cuándo podrías empezar?</h2>
        <div className="flex flex-wrap gap-2">
          {START_AVAILABILITIES.map((option) => (
            <Chip
              key={option}
              label={option}
              pressed={availability.startAvailability === option}
              onToggle={() =>
                setAvailability({
                  ...availability,
                  startAvailability:
                    availability.startAvailability === option
                      ? undefined
                      : (option as StartAvailability),
                })
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Otros datos útiles</h2>
        <CheckOption
          label="Tengo computador propio"
          hint="Lo piden casi siempre para trabajo remoto."
          checked={availability.hasOwnEquipment ?? false}
          onChange={(checked) => setAvailability({ ...availability, hasOwnEquipment: checked })}
        />
        <CheckOption
          label="Tengo conexión estable a internet"
          checked={availability.hasStableInternet ?? false}
          onChange={(checked) => setAvailability({ ...availability, hasStableInternet: checked })}
        />
        <CheckOption
          label="Tengo licencia de conducir vigente"
          checked={availability.hasDrivingLicense ?? false}
          onChange={(checked) => setAvailability({ ...availability, hasDrivingLicense: checked })}
        />
      </section>

      <StepNav
        onBack={back}
        onContinue={next}
        continueLabel="Ver mi CV"
        secondary={
          <Button variant="quiet" onClick={next}>
            Omitir por ahora
          </Button>
        }
      />
    </div>
  )
}
