import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CheckOption } from '@/components/ui/Chip'
import { ComboInput } from '@/components/ui/ComboInput'
import { Input } from '@/components/ui/Field'
import { StepNav } from '@/components/wizard/StepNav'
import { StepHeading } from '@/components/wizard/StepShell'
import { citiesFor, COUNTRIES } from '@/lib/locations'
import { personalSchema, type PersonalForm } from '@/schemas/personal'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

export function Step1Personal() {
  const personal = useCvStore((state) => state.data.personal)
  const setPersonal = useCvStore((state) => state.setPersonal)
  const { next, back } = useWizardStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: personal,
  })

  const willingToRelocate = watch('willingToRelocate') ?? false
  // Las sugerencias de ciudad siguen al país que se acaba de escribir.
  const country = watch('country') ?? ''

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setPersonal(values)
        next()
      })}
      className="flex flex-col gap-6"
    >
      <StepHeading
        title="Empecemos por tus datos"
        description="Van en texto plano al principio del CV, que es donde el filtro los busca."
      />

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          autoComplete="name"
          placeholder="Camila Ayelén Ferreyra"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Puesto al que postulas"
          hint="Escríbelo igual que aparece en el aviso. Es la palabra clave con más peso."
          placeholder="Ejecutiva de atención al cliente"
          error={errors.targetRole?.message}
          {...register('targetRole')}
        />
        <Input
          label="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="camila.ferreyra@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Teléfono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hint="Con característica del país."
          placeholder="+54 9 11 1234 5678"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ComboInput
            label="Ciudad"
            autoComplete="address-level2"
            placeholder="Ciudad Autónoma de Buenos Aires"
            options={citiesFor(country)}
            error={errors.city?.message}
            {...register('city')}
          />
          <ComboInput
            label="País"
            autoComplete="country-name"
            placeholder="Argentina"
            options={COUNTRIES}
            error={errors.country?.message}
            {...register('country')}
          />
        </div>
        <Input
          label="LinkedIn"
          optional
          placeholder="linkedin.com/in/tuusuario"
          error={errors.linkedin?.message}
          {...register('linkedin')}
        />
        <CheckOption
          label="Tengo disponibilidad para cambiar de ciudad"
          checked={willingToRelocate}
          onChange={(checked) => setValue('willingToRelocate', checked)}
        />
      </div>

      <StepNav onBack={back} submit />
    </form>
  )
}
