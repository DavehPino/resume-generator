import { Check } from 'lucide-react'

import { PALETTES, PALETTE_IDS, type PaletteId } from '@/lib/palettes'
import { useCvStore } from '@/store/cvStore'

/**
 * Selector de color del documento.
 *
 * Usa radios nativos: dan navegación con flechas y semántica de grupo sin
 * escribir una línea de JavaScript. El input va oculto a la vista pero sigue
 * siendo el que recibe el foco, por eso el anillo se dibuja con `has-[...]`
 * sobre la etiqueta.
 *
 * El estado seleccionado no se comunica solo con color —que es justo lo que
 * varía entre opciones— sino también con el tilde y el fondo de la etiqueta.
 */
export function PalettePicker() {
  const selected = useCvStore((state) => state.data.palette)
  const setPalette = useCvStore((state) => state.setPalette)

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-border">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-ink">Color del CV</h2>
        <p className="text-xs text-muted">
          Cambia solo los títulos y detalles. El texto queda casi negro, y todos los tonos son
          oscuros para que el CV se siga leyendo impreso en blanco y negro.
        </p>
      </div>

      <div role="radiogroup" aria-label="Color del CV" className="flex flex-wrap gap-1">
        {PALETTE_IDS.map((id) => (
          <Swatch key={id} id={id} selected={selected === id} onSelect={setPalette} />
        ))}
      </div>
    </section>
  )
}

function Swatch({
  id,
  selected,
  onSelect,
}: {
  id: PaletteId
  selected: boolean
  onSelect: (id: PaletteId) => void
}) {
  const palette = PALETTES[id]

  return (
    <label
      className={[
        'flex min-h-11 cursor-pointer flex-col items-center gap-1.5 rounded-xl px-2 py-2',
        'transition-[scale,background-color,box-shadow] duration-150 ease-swift',
        'active:scale-[0.96] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
        'has-[:focus-visible]:outline-accent-hover',
        selected ? 'bg-bg/60 shadow-[0_0_0_1px_var(--color-accent)]' : 'hover:bg-bg/40',
      ].join(' ')}
    >
      <input
        type="radio"
        name="cv-palette"
        value={id}
        checked={selected}
        onChange={() => onSelect(id)}
        className="sr-only"
      />
      <span
        aria-hidden
        style={{ backgroundColor: palette.accent }}
        // Aro blanco muy tenue: sin él, «Grafito» casi desaparece contra el
        // fondo oscuro de la tarjeta.
        className="flex size-7 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.22)]"
      >
        <Check
          strokeWidth={2.5}
          className={`size-4 text-white transition-[scale,opacity] duration-150 ease-swift ${
            selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        />
      </span>
      <span className={`text-[11px] ${selected ? 'text-ink' : 'text-muted'}`}>
        {palette.label}
      </span>
    </label>
  )
}
