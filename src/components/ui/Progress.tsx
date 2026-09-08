interface ProgressProps {
  current: number
  total: number
}

/**
 * Barra de progreso del wizard. Se anima con `scaleX` en vez de `width`:
 * el compositor lo resuelve sin recalcular el layout en cada frame.
 */
export function Progress({ current, total }: ProgressProps) {
  const ratio = Math.min(Math.max(current / total, 0), 1)
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Paso ${current} de ${total}`}
      className="h-1 w-full overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-swift"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  )
}
