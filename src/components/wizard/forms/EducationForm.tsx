import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { CheckOption } from '@/components/ui/Chip'
import { Input, Select } from '@/components/ui/Field'
import { MonthYearInput } from '@/components/ui/MonthYearInput'
import { educationSchema, type EducationForm as EducationValues } from '@/schemas/education'
import { EDUCATION_LEVELS, type Education } from '@/types/cv'

interface EducationFormProps {
  initial?: Education
  onSave: (values: EducationValues) => void
  onCancel: () => void
}

export function EducationForm({ initial, onSave, onCancel }: EducationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      level: initial?.level ?? 'Secundario',
      title: initial?.title ?? '',
      institution: initial?.institution ?? '',
      startDate: initial?.startDate ?? '',
      endDate: initial?.endDate ?? '',
      isInProgress: initial?.isInProgress ?? false,
    },
  })

  const isInProgress = watch('isInProgress')

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSave)}
      className="enter-up flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-border"
    >
      <Select label="Nivel" error={errors.level?.message} {...register('level')}>
        {EDUCATION_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </Select>

      <Input
        label="Título o carrera"
        placeholder="Tecnicatura Superior en Administración de Empresas"
        error={errors.title?.message}
        {...register('title')}
      />
      <Input
        label="Institución"
        placeholder="Instituto Superior de Formación Técnica N.º 12"
        error={errors.institution?.message}
        {...register('institution')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <MonthYearInput
          label="Desde"
          optional
          error={errors.startDate?.message}
          registration={register('startDate')}
        />
        <MonthYearInput
          label="Hasta"
          optional
          disabled={isInProgress}
          error={errors.endDate?.message}
          registration={register('endDate')}
        />
      </div>

      <CheckOption
        label="Todavía estoy estudiando"
        checked={isInProgress}
        onChange={(checked) => {
          setValue('isInProgress', checked)
          if (checked) setValue('endDate', '')
        }}
      />

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initial ? 'Guardar cambios' : 'Agregar estudio'}
        </Button>
      </div>
    </form>
  )
}
