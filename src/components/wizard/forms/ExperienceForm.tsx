import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button, IconButton } from '@/components/ui/Button'
import { CheckOption } from '@/components/ui/Chip'
import { ComboInput } from '@/components/ui/ComboInput'
import { Input } from '@/components/ui/Field'
import { MonthYearInput } from '@/components/ui/MonthYearInput'
import { citiesFor, COUNTRIES } from '@/lib/locations'
import {
  experienceSchema,
  type ExperienceInput,
  type ExperienceOutput,
} from '@/schemas/experience'
import type { Experience } from '@/types/cv'

const MAX_BULLETS = 5

interface ExperienceFormProps {
  initial?: Experience
  onSave: (values: ExperienceOutput) => void
  onCancel: () => void
}

function toFormValues(item?: Experience): ExperienceInput {
  return {
    role: item?.role ?? '',
    company: item?.company ?? '',
    city: item?.city ?? '',
    country: item?.country ?? '',
    startDate: item?.startDate ?? '',
    endDate: item?.endDate ?? '',
    isCurrent: item?.isCurrent ?? false,
    bullets: (item?.bullets.length ? item.bullets : ['']).map((value) => ({ value })),
  }
}

export function ExperienceForm({ initial, onSave, onCancel }: ExperienceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceInput, unknown, ExperienceOutput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: toFormValues(initial),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'bullets' })
  const isCurrent = watch('isCurrent')
  const country = watch('country') ?? ''

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSave)}
      className="enter-up flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-border"
    >
      <Input
        label="Cargo"
        placeholder="Ejecutiva de atención al cliente"
        error={errors.role?.message}
        {...register('role')}
      />
      <Input
        label="Empresa"
        placeholder="Telecom Argentina"
        error={errors.company?.message}
        {...register('company')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ComboInput
          label="Ciudad"
          optional
          placeholder="Ciudad Autónoma de Buenos Aires"
          options={citiesFor(country)}
          {...register('city')}
        />
        <ComboInput
          label="País"
          optional
          placeholder="Argentina"
          options={COUNTRIES}
          {...register('country')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MonthYearInput
          label="Desde"
          error={errors.startDate?.message}
          registration={register('startDate')}
        />
        <MonthYearInput
          label="Hasta"
          disabled={isCurrent}
          error={errors.endDate?.message}
          registration={register('endDate')}
        />
      </div>

      <CheckOption
        label="Sigo trabajando aquí"
        checked={isCurrent}
        onChange={(checked) => {
          setValue('isCurrent', checked)
          if (checked) setValue('endDate', '')
        }}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Qué hacías en este puesto</legend>
        <p className="text-xs text-muted">
          Empieza cada línea con un verbo: «Atendí…», «Gestioné…», «Superé…». Si puedes,
          agrega un número.
        </p>

        <div className="mt-1 flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <Input
                  label={`Logro ${index + 1}`}
                  hideLabel
                  placeholder="Atendí un promedio de 80 llamadas diarias…"
                  error={errors.bullets?.[index]?.value?.message}
                  {...register(`bullets.${index}.value` as const)}
                />
              </div>
              {fields.length > 1 && (
                <IconButton
                  label={`Quitar logro ${index + 1}`}
                  tone="danger"
                  onClick={() => remove(index)}
                >
                  <X aria-hidden strokeWidth={2} className="size-4" />
                </IconButton>
              )}
            </div>
          ))}
        </div>

        {errors.bullets?.message && (
          <p className="text-xs text-danger">{errors.bullets.message}</p>
        )}

        {fields.length < MAX_BULLETS && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start pr-3.5 pl-3"
            onClick={() => append({ value: '' })}
          >
            <Plus aria-hidden strokeWidth={1.5} className="size-4" />
            Agregar otro logro
          </Button>
        )}
      </fieldset>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initial ? 'Guardar cambios' : 'Agregar experiencia'}
        </Button>
      </div>
    </form>
  )
}
