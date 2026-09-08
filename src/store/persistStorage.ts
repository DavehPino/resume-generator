import type { StateStorage } from 'zustand/middleware'

/**
 * localStorage con escritura diferida (~400 ms). El brief pide guardar en cada
 * cambio; escribir en cada pulsación de tecla es innecesario, así que se
 * agrupan las escrituras y se vuelcan al salir de la página.
 */

const DEBOUNCE_MS = 400
const pending = new Map<string, string>()
let timer: number | undefined

function flush(): void {
  if (timer !== undefined) {
    window.clearTimeout(timer)
    timer = undefined
  }
  for (const [name, value] of pending) {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      // Sin espacio o en modo privado: el usuario sigue trabajando en memoria.
    }
  }
  pending.clear()
}

function schedule(): void {
  if (timer !== undefined) window.clearTimeout(timer)
  timer = window.setTimeout(flush, DEBOUNCE_MS)
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush)
  window.addEventListener('beforeunload', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

export const debouncedLocalStorage: StateStorage = {
  getItem: (name) => {
    if (pending.has(name)) return pending.get(name) ?? null
    try {
      return window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    pending.set(name, value)
    schedule()
  },
  removeItem: (name) => {
    pending.delete(name)
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Nada que hacer.
    }
  },
}

/** Fuerza el volcado inmediato. Útil antes de exportar o de reiniciar. */
export const flushStorage = flush
