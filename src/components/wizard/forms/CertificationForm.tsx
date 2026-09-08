import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { MonthYearInput } from '@/components/ui/MonthYearInput'
import {
  certificationSchema,
  type CertificationForm as CertificationValues,
} from '@/schemas/certification'
import type { Certification } from '@/types/cv'

interface CertificationFormProps {
  initial?: Certification
  onSave: (values: CertificationValues) => void
  onCancel: () => void
}

export function CertificationForm({ initial, onSave, onCancel }: CertificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificationValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: initial?.name ?? '',
      issuer: initial?.issuer ?? '',
      date: initial?.date ?? '',
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSave)}
      className="enter-up flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-border"
    >
      <Input
        label="Nombre del curso o certificación"
        placeholder="Atención al cliente y manejo de conflictos"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Institución que lo impartió"
        placeholder="Ministerio de Trabajo"
        error={errors.issuer?.message}
        {...register('issuer')}
      />
      <MonthYearInput
        label="Fecha"
        optional
        error={errors.date?.message}
        registration={register('date')}
      />

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initial ? 'Guardar cambios' : 'Agregar certificación'}
        </Button>
      </div>
    </form>
  )
}
