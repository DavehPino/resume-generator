import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

import { IconButton } from '@/components/ui/Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Diálogo modal sobre `<dialog>` nativo: el navegador ya resuelve el foco
 * atrapado, el cierre con Escape y el aislamiento del resto de la página.
 * Reimplementarlo a mano solo empeoraría la accesibilidad.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // Un clic en el fondo (el propio <dialog>, no su contenido) cierra.
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-auto w-[min(48rem,calc(100vw-1.5rem))] rounded-3xl bg-surface p-0 text-ink shadow-lift backdrop:bg-black/70"
    >
      <div className="flex max-h-[min(88dvh,52rem)] flex-col">
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <h2 id="modal-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Cerrar" onClick={onClose}>
            <X aria-hidden strokeWidth={1.5} className="size-4" />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </dialog>
  )
}
