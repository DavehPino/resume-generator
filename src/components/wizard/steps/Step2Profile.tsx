import { zodResolver } from '@hookform/resolvers/zod'
import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { StepNav } from '@/components/wizard/StepNav'
import { StepHeading } from '@/components/wizard/StepShell'
import { PROFILE_MAX, PROFILE_MIN } from '@/lib/audit'
import { profileTemplatesFor } from '@/lib/keywords'
import { profileSchema, type ProfileForm } from '@/schemas/profile'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

export function Step2Profile() {
  const profile = useCvStore((state) => state.data.profile)
  const targetRole = useCvStore((state) => state.data.personal.targetRole)
  const setProfile = useCvStore((state) => state.setProfile)
  const { next, back } = useWizardStore()
  const [showTemplates, setShowTemplates] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  })

  const text = watch('text') ?? ''
  const length = text.trim().length
  const inRange = length >= PROFILE_MIN && length <= PROFILE_MAX
  const templates = profileTemplatesFor(targetRole)

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setProfile(values.text)
        next()
      })}
      className="flex flex-col gap-6"
    >
      <StepHeading
        title="Tu perfil profesional"
        description="Son las 3 o 4 líneas del principio. Es lo que más pesa: menciona el puesto y tus habilidades principales."
      />

      <div className="flex flex-col gap-3">
        <Textarea
          label="Sobre ti"
          rows={7}
          maxLength={PROFILE_MAX}
          placeholder="Ejecutiva de atención al cliente con 3 años de experiencia en call center…"
          error={errors.text?.message}
          {...register('text')}
        />

        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs tabular-nums ${inRange ? 'text-ink' : 'text-muted'}`}>
            {length} / {PROFILE_MAX} caracteres
            <span className="text-muted"> · lo ideal son {PROFILE_MIN}–{PROFILE_MAX}</span>
          </p>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setShowTemplates((value) => !value)}
            aria-expanded={showTemplates}
          >
            {showTemplates ? 'Ocultar ejemplos' : 'Ver ejemplos'}
          </Button>
        </div>

        {showTemplates && (
          <div className="enter-up flex flex-col gap-2">
            <p className="flex items-center gap-2 text-xs text-muted">
              <Lightbulb aria-hidden strokeWidth={1.5} className="size-3.5" />
              Toca uno para usarlo y edítalo con tus datos reales.
            </p>
            {templates.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  setValue('text', template, { shouldValidate: true })
                  setShowTemplates(false)
                }}
                className="rounded-2xl bg-surface p-4 text-left text-sm text-muted shadow-border transition-[box-shadow,color] duration-150 ease-swift hover:text-ink hover:shadow-border-hover"
              >
                {template}
              </button>
            ))}
          </div>
        )}
      </div>

      <StepNav onBack={back} submit />
    </form>
  )
}
