import {
  AlertTriangle,
  ArrowLeft,
  Check,

  FileDown,
  Printer,
  RotateCcw,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AtsExplainerModal } from '@/components/preview/AtsExplainerModal'
import { CvDocument } from '@/components/preview/CvDocument'
import { EditCard } from '@/components/preview/EditCard'
import { PalettePicker } from '@/components/preview/PalettePicker'
import { Button } from '@/components/ui/Button'
import { runAudit } from '@/lib/audit'
import { downloadCvJson, printCv, readCvJson } from '@/lib/exportPdf'
import { useCvStore } from '@/store/cvStore'
import { flushStorage } from '@/store/persistStorage'
import { STEP_TITLES, useWizardStore } from '@/store/wizardStore'

/** Medidas de A4 en píxeles CSS (1 mm = 96/25.4 px). */
const MM = 96 / 25.4
const A4_WIDTH = 210 * MM
const PAGE_CONTENT_HEIGHT = (297 - 18 * 2) * MM
const VERTICAL_MARGINS = 18 * 2 * MM
/**
 * `offsetHeight` devuelve enteros, así que una página exacta mide 1123 px en
 * vez de 1122.52 y sin este margen se contaría como dos páginas.
 */
const ROUNDING_TOLERANCE = 2

const EDITABLE_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export function PreviewPanel() {
  const data = useCvStore((state) => state.data)
  const loadCv = useCvStore((state) => state.loadCv)
  const reset = useCvStore((state) => state.reset)
  const { back, goTo, resetWizard, markAtsExplainerSeen } = useWizardStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(297 * MM)
  const [importError, setImportError] = useState<string | null>(null)
  // La primera vez que alguien llega acá, se le explica por qué el CV se ve
  // así. Después queda a mano en la tarjeta de compatibilidad, sin volver a
  // interrumpir. Se lee del store al inicializar y no en un efecto: abrirlo no
  // es sincronizar con nada externo, es el estado inicial de esta pantalla.
  const [explainerOpen, setExplainerOpen] = useState(
    () => !useWizardStore.getState().atsExplainerSeen,
  )

  const closeExplainer = () => {
    setExplainerOpen(false)
    markAtsExplainerSeen()
  }

  const measure = useCallback(() => {
    const container = containerRef.current
    const doc = docRef.current
    if (!container || !doc) return
    setScale(Math.min(1, container.clientWidth / A4_WIDTH))
    setDocHeight(doc.offsetHeight)
  }, [])

  useEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    if (docRef.current) observer.observe(docRef.current)
    return () => observer.disconnect()
  }, [measure])

  const pages = Math.max(
    1,
    Math.ceil((docHeight - VERTICAL_MARGINS - ROUNDING_TOLERANCE) / PAGE_CONTENT_HEIGHT),
  )
  const audit = runAudit(data, pages)
  const warnings = audit.findings.filter((finding) => finding.level === 'warn')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Tu CV está listo</h1>
        <p className="text-sm text-muted">
          Revísalo, corrige lo que haga falta y descárgalo en PDF.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Vista previa. Los controles de edición viven fuera del documento a
            propósito: lo que se imprime es un clon exacto de #cv-document y no
            puede llevar dentro ni un botón. */}
        {/* `min-w-0` es imprescindible: sin él, el ancho A4 fijo del documento
            fija el mínimo de la columna y toda la rejilla se desborda en móvil. */}
        <div className="order-2 min-w-0 lg:order-1">
          <div
            ref={containerRef}
            className="overflow-hidden rounded-2xl bg-white/5 p-2 shadow-border"
          >
            <div style={{ height: docHeight * scale }} className="overflow-hidden">
              <div
                ref={docRef}
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                className="w-fit"
              >
                <CvDocument data={data} />
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted tabular-nums">
            A4 · {pages} {pages === 1 ? 'página' : 'páginas'}
          </p>
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
          <AuditCard
            score={audit.score}
            passed={audit.passed}
            total={audit.total}
            onExplain={() => setExplainerOpen(true)}
          />

          <EditCard />

          {warnings.length > 0 && (
            <section className="flex flex-col gap-2 rounded-3xl bg-surface p-2 shadow-border">
              {warnings.map((finding) => (
                <div key={finding.id} className="rounded-2xl px-3 py-3">
                  <p className="flex items-start gap-2 text-sm font-medium text-ink">
                    <AlertTriangle
                      aria-hidden
                      strokeWidth={2}
                      className="mt-0.5 size-4 shrink-0 text-accent-hover"
                    />
                    {finding.title}
                  </p>
                  <p className="mt-1 pl-6 text-sm text-muted">{finding.detail}</p>
                  {finding.step && (
                    <div className="pl-4">
                      <Button
                        variant="quiet"
                        size="sm"
                        onClick={() => goTo(finding.step!, { fromReview: true })}
                      >
                        Corregir en «{STEP_TITLES[finding.step]}»
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          <PalettePicker />

          <section className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-border">
            <h2 className="text-sm font-medium text-ink">Descargar</h2>
            <Button
              variant="primary"
              size="lg"
              className="w-full pr-6 pl-[22px]"
              onClick={() => {
                flushStorage()
                printCv(data.personal.fullName)
              }}
            >
              <Printer aria-hidden strokeWidth={2} className="size-4" />
              Descargar PDF
            </Button>
            <p className="text-xs text-muted">
              En el diálogo de impresión elige <strong className="text-ink">Guardar como PDF</strong>,
              tamaño A4, márgenes por defecto, y <strong className="text-ink">desactiva</strong>{' '}
              «Encabezados y pies de página».
            </p>
          </section>

          <section className="flex flex-col gap-2 rounded-3xl bg-surface p-4 shadow-border">
            <h2 className="text-sm font-medium text-ink">Respaldo de tus datos</h2>
            <p className="text-xs text-muted">
              Tus respuestas se guardan solo en este navegador. Descarga una copia si vas a
              limpiarlo o cambiar de equipo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="pr-3.5 pl-3" onClick={() => downloadCvJson(data)}>
                <FileDown aria-hidden strokeWidth={1.5} className="size-4" />
                Descargar datos
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="pr-3.5 pl-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload aria-hidden strokeWidth={1.5} className="size-4" />
                Cargar datos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (!file) return
                  const result = await readCvJson(file)
                  if (result.ok) {
                    loadCv(result.data)
                    setImportError(null)
                  } else {
                    setImportError(result.error)
                  }
                }}
              />
            </div>
            {importError && <p className="text-xs text-danger">{importError}</p>}
          </section>

          <section className="flex flex-col gap-2 rounded-3xl bg-surface p-2 shadow-border">
            <h2 className="px-2 pt-2 text-sm font-medium text-ink">Editar una sección</h2>
            <div className="flex flex-col">
              {EDITABLE_SECTIONS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => goTo(step, { fromReview: true })}
                  className="flex min-h-11 items-center justify-between rounded-2xl px-3 text-left text-sm text-muted transition-[background-color,color] duration-150 ease-swift hover:bg-bg/40 hover:text-ink"
                >
                  {STEP_TITLES[step]}
                  <span aria-hidden className="text-xs">
                    Editar
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={back} className="pr-4 pl-3">
              <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4" />
              Atrás
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                const confirmed = window.confirm(
                  '¿Seguro que quieres empezar de cero? Se borrarán todos los datos de este CV.',
                )
                if (!confirmed) return
                reset()
                resetWizard()
              }}
            >
              <RotateCcw aria-hidden strokeWidth={1.5} className="size-4" />
              Empezar de cero
            </Button>
          </div>
        </div>
      </div>

      <AtsExplainerModal open={explainerOpen} onClose={closeExplainer} />
    </div>
  )
}

function AuditCard({
  score,
  passed,
  total,
  onExplain,
}: {
  score: number
  passed: number
  total: number
  onExplain: () => void
}) {
  const strong = score >= 80
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-border">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Compatibilidad con filtros ATS</h2>
        <p className="text-2xl font-semibold text-ink tabular-nums">
          {score}
          <span className="text-sm text-muted">/100</span>
        </p>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full origin-left rounded-full transition-transform duration-300 ease-swift ${
            strong ? 'bg-accent' : 'bg-accent/60'
          }`}
          style={{ transform: `scaleX(${score / 100})` }}
        />
      </div>
      <p className="flex items-center gap-2 text-xs text-muted">
        {strong ? (
          <Check aria-hidden strokeWidth={2} className="size-3.5 text-accent-hover" />
        ) : (
          <AlertTriangle aria-hidden strokeWidth={2} className="size-3.5 text-accent-hover" />
        )}
        <span className="tabular-nums">
          {passed} de {total} revisiones superadas
        </span>
        <span>{strong ? '· listo para postular' : '· revisa los avisos de abajo'}</span>
      </p>
      <Button variant="quiet" size="sm" className="self-start px-0" onClick={onExplain}>
        ¿Qué es un CV compatible con ATS?
      </Button>
    </section>
  )
}

