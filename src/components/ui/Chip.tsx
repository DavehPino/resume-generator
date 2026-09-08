import { Check, Plus, X } from 'lucide-react'

/**
 * Chips de selección. El estado activo se comunica siempre por color y por
 * icono, no solo por la animación: el movimiento nunca es el único canal.
 */

interface ChipProps {
  label: string
  pressed: boolean
  onToggle: () => void
}

export function Chip({ label, pressed, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={[
        'inline-flex min-h-10 items-center gap-1.5 rounded-full py-1.5 pr-3.5 pl-3 text-sm',
        'transition-[scale,background-color,box-shadow,color] duration-150 ease-swift',
        'active:scale-[0.96]',
        pressed
          ? 'bg-accent/20 text-ink shadow-[0_0_0_1px_var(--color-accent-hover)]'
          : 'text-muted shadow-border hover:text-ink hover:shadow-border-hover',
      ].join(' ')}
    >
      {/* Los dos iconos viven en el DOM y se funden entre sí: así hay
          animación de entrada y de salida sin librería de motion. */}
      <span aria-hidden className="relative size-4 shrink-0">
        <Plus
          strokeWidth={1.5}
          className={[
            'absolute inset-0 size-4 transition-[scale,opacity,filter] duration-150 ease-swift',
            pressed ? 'scale-25 opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0',
          ].join(' ')}
        />
        <Check
          strokeWidth={2}
          className={[
            'absolute inset-0 size-4 transition-[scale,opacity,filter] duration-150 ease-swift',
            pressed ? 'scale-100 opacity-100 blur-0' : 'scale-25 opacity-0 blur-[4px]',
          ].join(' ')}
        />
      </span>
      {label}
    </button>
  )
}

interface RemovableChipProps {
  label: string
  onRemove: () => void
}

export function RemovableChip({ label, onRemove }: RemovableChipProps) {
  return (
    <span className="inline-flex min-h-10 items-center gap-1 rounded-full bg-accent/15 py-1.5 pr-1 pl-3.5 text-sm text-ink shadow-[0_0_0_1px_var(--color-accent)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${label}`}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-[scale,background-color,color] duration-150 ease-swift hover:bg-bg/40 hover:text-ink active:scale-[0.96]"
      >
        <X aria-hidden strokeWidth={2} className="size-3.5" />
      </button>
    </span>
  )
}

interface CheckOptionProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Casilla con área táctil completa: toda la fila es el objetivo. */
export function CheckOption({ label, hint, checked, onChange }: CheckOptionProps) {
  return (
    <label
      className={[
        'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5',
        'transition-[background-color,box-shadow] duration-150 ease-swift',
        checked ? 'bg-accent/10 shadow-[0_0_0_1px_var(--color-accent)]' : 'shadow-border hover:shadow-border-hover',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent-hover)]"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-ink">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  )
}
