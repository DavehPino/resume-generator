import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
}

/** Estado vacío con forma propia: nunca un hueco en blanco. */
export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center shadow-border">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-muted">
        <Icon aria-hidden strokeWidth={1.5} className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}
