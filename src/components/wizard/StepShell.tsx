import { Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function StepHeading({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="text-sm text-muted">{description}</p>
    </div>
  )
}

interface ItemRowProps {
  title: string
  meta?: string
  lines?: string[]
  onEdit: () => void
  onRemove: () => void
  /** Nombre accesible de los botones, ej. "esta experiencia". */
  subject: string
}

/** Fila de una lista (experiencia, estudio, idioma, certificación). */
export function ItemRow({ title, meta, lines, onEdit, onRemove, subject }: ItemRowProps) {
  return (
    <Card>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{title}</p>
          {meta && <p className="mt-0.5 text-sm text-muted tabular-nums">{meta}</p>}
          {lines && lines.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {lines.map((line, index) => (
                <li key={index} className="flex gap-2 text-sm text-muted">
                  <span aria-hidden className="text-muted/60">
                    •
                  </span>
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          <IconButton label={`Editar ${subject}`} onClick={onEdit}>
            <Pencil aria-hidden strokeWidth={1.5} className="size-4" />
          </IconButton>
          <IconButton label={`Eliminar ${subject}`} tone="danger" onClick={onRemove}>
            <Trash2 aria-hidden strokeWidth={1.5} className="size-4" />
          </IconButton>
        </div>
      </div>
    </Card>
  )
}
