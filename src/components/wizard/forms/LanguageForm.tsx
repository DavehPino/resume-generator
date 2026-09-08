import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { ComboInput } from '@/components/ui/ComboInput'
import { Input, Select } from '@/components/ui/Field'
import { LANGUAGES } from '@/lib/locations'
import { languageSchema, type LanguageForm as LanguageValues } from '@/schemas/language'
import { LANGUAGE_LEVELS, type Language } from '@/types/cv'

interface LanguageFormProps {
  initial?: Language
  onSave: (values: LanguageValues) => void
  onCancel: () => void
}

export function LanguageForm({ initial, onSave, onCancel }: LanguageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LanguageValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: initial?.name ?? '',
      level: initial?.level ?? 'Intermedio',
      certification: initial?.certification ?? '',
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSave)}
      className="enter-up flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-border"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ComboInput
          label="Idioma"
          placeholder="Inglés"
          options={LANGUAGES}
          error={errors.name?.message}
          {...register('name')}
        />
        <Select label="Nivel" error={errors.level?.message} {...register('level')}>
          {LANGUAGE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Certificación"
        optional
        hint="Si tienes una, escríbela tal cual: TOEFL 95, B2, IELTS 6.5…"
        placeholder="B2"
        {...register('certification')}
      />

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initial ? 'Guardar cambios' : 'Agregar idioma'}
        </Button>
      </div>
    </form>
  )
}
