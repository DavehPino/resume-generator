import type { ReactNode } from 'react'

/**
 * Superficie para un elemento de lista (una experiencia, un estudio…).
 *
 * Radios concéntricos: 24 px por fuera con 16 px de padding deja 8 px para los
 * controles interiores (`rounded-lg`), que es lo que hace que las esquinas
 * anidadas no se vean pellizcadas.
 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        'rounded-3xl bg-surface p-4 shadow-border',
        'transition-[box-shadow] duration-150 ease-swift hover:shadow-border-hover',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
