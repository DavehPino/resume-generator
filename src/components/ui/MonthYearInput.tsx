import type { UseFormRegisterReturn } from 'react-hook-form'

import { Input } from '@/components/ui/Field'
import { maskMonthYear } from '@/lib/formatDate'

interface MonthYearInputProps {
  label: string
  error?: string
  optional?: boolean
  disabled?: boolean
  hint?: string
  registration: UseFormRegisterReturn
}

/**
 * Campo de mes/año. Inserta la barra sola mientras se escribe, así el usuario
 * teclea "032021" y el CV recibe siempre "03/2021", que es el formato de fecha
 * que los ATS reconocen sin ambigüedad.
 */
export function MonthYearInput({ registration, ...rest }: MonthYearInputProps) {
  return (
    <Input
      {...rest}
      inputMode="numeric"
      placeholder="MM/AAAA"
      maxLength={7}
      {...registration}
      onChange={(event) => {
        event.target.value = maskMonthYear(event.target.value)
        void registration.onChange(event)
      }}
    />
  )
}
