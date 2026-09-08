import { useId, type ComponentPropsWithRef } from 'react'

import { Input } from '@/components/ui/Field'

interface ComboInputProps extends Omit<ComponentPropsWithRef<'input'>, 'list'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  hideLabel?: boolean
  /** Sugerencias. No limitan lo que se puede escribir. */
  options: readonly string[]
}

/**
 * Campo de texto con sugerencias (`<datalist>`).
 *
 * Se usa `<datalist>` en vez de un `<select>` cerrado porque ninguna lista de
 * ciudades o idiomas es completa: el usuario elige de la lista y así escribe
 * el nombre correcto, pero puede teclear el suyo si no está.
 *
 * Es HTML nativo, así que funciona con teclado y en móvil sin librerías.
 */
export function ComboInput({ options, ...props }: ComboInputProps) {
  const listId = useId()
  return (
    <>
      <Input {...props} list={options.length > 0 ? listId : undefined} />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </>
  )
}
