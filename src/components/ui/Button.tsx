import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Desactiva el `scale` al pulsar cuando el movimiento distraería. */
  static?: boolean
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  // Relleno sólido: no necesita anillo, el color ya lo separa del fondo.
  primary: 'bg-accent text-white hover:bg-accent-hover',
  // Profundidad por sombra, no por borde (se adapta a cualquier fondo).
  secondary: 'bg-surface text-ink shadow-border hover:shadow-border-hover',
  ghost: 'bg-transparent text-muted hover:text-ink hover:bg-surface',
  quiet: 'bg-transparent text-muted underline underline-offset-4 hover:text-ink',
}

/** Alturas mínimas de 44 px en táctil; 40 px en el tamaño compacto de escritorio. */
const SIZES: Record<Size, string> = {
  sm: 'min-h-10 px-3 text-sm rounded-lg gap-1.5',
  md: 'min-h-11 px-4 text-sm rounded-lg gap-2',
  lg: 'min-h-12 px-6 text-base rounded-xl gap-2',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  static: noScale = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-[scale,background-color,box-shadow,color] duration-150 ease-swift',
        'disabled:pointer-events-none disabled:opacity-40',
        noScale ? '' : 'active:scale-[0.96]',
        SIZES[size],
        VARIANTS[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: un botón sin texto necesita nombre accesible. */
  label: string
  tone?: 'neutral' | 'danger'
  children: ReactNode
}

export function IconButton({
  label,
  tone = 'neutral',
  className = '',
  type = 'button',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[
        'inline-flex size-11 shrink-0 items-center justify-center rounded-lg',
        'transition-[scale,background-color,color] duration-150 ease-swift',
        'active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40',
        tone === 'danger'
          ? 'text-muted hover:bg-surface hover:text-danger'
          : 'text-muted hover:bg-surface hover:text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
