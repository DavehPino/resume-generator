import { ChevronDown } from 'lucide-react'
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'

/**
 * Campos de formulario. Cada control lleva su <label> real asociado y enlaza
 * pista y error por `aria-describedby`, para que un lector de pantalla anuncie
 * el mismo contexto que ve el resto.
 *
 * Los inputs conservan borde (no sombra): en un formulario el borde comunica
 * el área editable y el estado de error, no solo profundidad.
 */

const CONTROL_BASE =
  'w-full rounded-lg border bg-surface px-3 py-2.5 text-ink placeholder:text-muted/60 ' +
  'transition-[border-color,background-color] duration-150 ease-swift ' +
  'disabled:opacity-50'

function controlClasses(hasError: boolean, extra = ''): string {
  return [
    CONTROL_BASE,
    hasError ? 'border-danger' : 'border-line hover:border-line/70 focus:border-accent-hover',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

interface LabelledProps {
  label: string
  hint?: ReactNode
  error?: string
  optional?: boolean
  /** Oculta la etiqueta a la vista pero la mantiene para lectores de pantalla. */
  hideLabel?: boolean
}

function FieldShell({
  label,
  hint,
  error,
  optional,
  hideLabel,
  controlId,
  hintId,
  errorId,
  children,
}: LabelledProps & {
  controlId: string
  hintId: string
  errorId: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={controlId}
        className={hideLabel ? 'sr-only' : 'text-sm font-medium text-ink'}
      >
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-muted">(opcional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(hint: ReactNode, error: string | undefined, hintId: string, errorId: string) {
  return [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
}

export function Input({
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  ...props
}: LabelledProps & ComponentPropsWithRef<'input'>) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        className={controlClasses(Boolean(error), `min-h-11 ${className ?? ''}`)}
        {...props}
      />
    </FieldShell>
  )
}

export function Textarea({
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  ...props
}: LabelledProps & ComponentPropsWithRef<'textarea'>) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        className={controlClasses(Boolean(error), `resize-y leading-relaxed ${className ?? ''}`)}
        {...props}
      />
    </FieldShell>
  )
}

export function Select({
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  children,
  ...props
}: LabelledProps & ComponentPropsWithRef<'select'>) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, hintId, errorId)}
          className={controlClasses(Boolean(error), `min-h-11 appearance-none pr-10 ${className ?? ''}`)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  )
}
