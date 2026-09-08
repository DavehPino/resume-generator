import { AlertTriangle, Check, Info, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { diffProposal, requestAiEdit, type AiChange, type AiResult } from '@/lib/aiEdit'
import { useCvStore } from '@/store/cvStore'

const MAX_INSTRUCTION = 1500

const QUICK_PROMPTS = [
  'Mejorá la redacción de mi perfil profesional.',
  'Hacé que todos mis logros empiecen con un verbo de acción.',
  'Acortá los logros que sean demasiado largos.',
  'Sumá palabras clave que busque un filtro para este puesto.',
]

type Phase =
  | { step: 'writing' }
  | { step: 'thinking' }
  /** `notice` es la IA respondiendo que no cambió nada; no es un fallo. */
  | { step: 'message'; text: string; tone: 'error' | 'notice' }
  | { step: 'review'; summary: string; changes: AiChange[] }

export function AiEditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cv = useCvStore((state) => state.data)
  const setProfile = useCvStore((state) => state.setProfile)
  const updateExperience = useCvStore((state) => state.updateExperience)
  const updateEducation = useCvStore((state) => state.updateEducation)
  const updateCertification = useCvStore((state) => state.updateCertification)
  const setSkills = useCvStore((state) => state.setSkills)

  const [instruction, setInstruction] = useState('')
  const [phase, setPhase] = useState<Phase>({ step: 'writing' })
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [proposal, setProposal] = useState<AiResult | null>(null)

  const reset = () => {
    setPhase({ step: 'writing' })
    setProposal(null)
    setAccepted(new Set())
  }

  const close = () => {
    reset()
    setInstruction('')
    onClose()
  }

  const send = async () => {
    const text = instruction.trim()
    if (text.length < 4) return
    setPhase({ step: 'thinking' })

    const response = await requestAiEdit(text, cv)
    if (!response.ok) {
      setPhase({ step: 'message', tone: 'error', text: response.error })
      return
    }

    const changes = diffProposal(cv, response.result)
    if (changes.length === 0) {
      setPhase({
        step: 'message',
        tone: 'notice',
        text:
          response.result.summary ||
          'La IA no propuso ningún cambio. Probá pidiéndole algo más concreto.',
      })
      return
    }

    setProposal(response.result)
    setAccepted(new Set(changes.map((change) => change.key)))
    setPhase({ step: 'review', summary: response.result.summary, changes })
  }

  const apply = () => {
    if (!proposal) return

    if (accepted.has('profile') && proposal.profile) {
      setProfile(proposal.profile.trim())
    }

    for (const entry of proposal.experience ?? []) {
      if (!accepted.has(`experience:${entry.id}`)) continue
      const current = cv.experience.find((item) => item.id === entry.id)
      if (!current) continue
      const { id: _id, ...rest } = current
      updateExperience(entry.id, {
        ...rest,
        bullets: entry.bullets.map((bullet) => bullet.trim()).filter(Boolean),
      })
    }

    for (const entry of proposal.education ?? []) {
      if (!accepted.has(`education:${entry.id}`)) continue
      const current = cv.education.find((item) => item.id === entry.id)
      if (!current) continue
      const { id: _id, ...rest } = current
      updateEducation(entry.id, { ...rest, title: entry.title.trim() })
    }

    for (const entry of proposal.certifications ?? []) {
      if (!accepted.has(`certification:${entry.id}`)) continue
      const current = cv.certifications.find((item) => item.id === entry.id)
      if (!current) continue
      const { id: _id, ...rest } = current
      updateCertification(entry.id, { ...rest, name: entry.name.trim() })
    }

    if (proposal.skills) {
      const technical = accepted.has('skills:technical')
        ? proposal.skills.technical.map((item) => item.trim()).filter(Boolean)
        : cv.skills.technical
      const soft = accepted.has('skills:soft')
        ? proposal.skills.soft.map((item) => item.trim()).filter(Boolean)
        : cv.skills.soft
      if (accepted.has('skills:technical') || accepted.has('skills:soft')) {
        setSkills({ technical, soft })
      }
    }

    close()
  }

  return (
    <Modal open={open} onClose={close} title="Editar con IA">
      {phase.step === 'review' ? (
        <ReviewStep
          summary={phase.summary}
          changes={phase.changes}
          accepted={accepted}
          onToggle={(key) =>
            setAccepted((current) => {
              const next = new Set(current)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              return next
            })
          }
          onApply={apply}
          onBack={reset}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Pedile cambios sobre <strong className="text-ink">tu propio texto</strong>: mejorar la
            redacción, acortar logros o sumar palabras clave. No inventa empleos, fechas ni datos, y
            vos aprobás cada cambio antes de que se aplique.
          </p>

          <Textarea
            label="¿Qué querés cambiar?"
            rows={4}
            // `showModal()` enfoca este campo por el autofocus; sin él el foco
            // cae en el botón de cerrar y hay que tabular para escribir.
            autoFocus
            maxLength={MAX_INSTRUCTION}
            value={instruction}
            disabled={phase.step === 'thinking'}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Ej.: mejorá la redacción de mi perfil y hacelo más orientado a call center"
          />

          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted">O empezá con una de estas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={phase.step === 'thinking'}
                  onClick={() => setInstruction(prompt)}
                  className="min-h-10 rounded-full px-3.5 py-1.5 text-left text-sm text-muted shadow-border transition-[scale,box-shadow,color] duration-150 ease-swift hover:text-ink hover:shadow-border-hover active:scale-[0.96] disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {phase.step === 'message' && (
            <p className="flex items-start gap-2 rounded-2xl px-3 py-3 text-sm text-ink shadow-border">
              {phase.tone === 'error' ? (
                <AlertTriangle
                  aria-hidden
                  strokeWidth={2}
                  className="mt-0.5 size-4 shrink-0 text-danger"
                />
              ) : (
                <Info aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-muted" />
              )}
              {phase.text}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={send}
              disabled={instruction.trim().length < 4 || phase.step === 'thinking'}
              className="pr-4 pl-3.5"
            >
              {phase.step === 'thinking' ? (
                <>
                  <Loader2 aria-hidden strokeWidth={2} className="size-4 animate-spin" />
                  Pensando…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden strokeWidth={2} className="size-4" />
                  Pedir cambios
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ReviewStep({
  summary,
  changes,
  accepted,
  onToggle,
  onApply,
  onBack,
}: {
  summary: string
  changes: AiChange[]
  accepted: Set<string>
  onToggle: (key: string) => void
  onApply: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <p className="flex items-start gap-2 text-sm text-muted">
          <Sparkles aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-accent-hover" />
          {summary}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {changes.map((change) => (
          <div key={change.key} className="rounded-3xl p-4 shadow-border">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={accepted.has(change.key)}
                onChange={() => onToggle(change.key)}
                className="size-4 shrink-0 accent-[var(--color-accent-hover)]"
              />
              <span className="text-sm font-medium text-ink">{change.label}</span>
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TextBlock title="Antes" lines={change.before} muted />
              <TextBlock title="Después" lines={change.after} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onBack}>
          Pedir otra cosa
        </Button>
        <Button
          variant="primary"
          onClick={onApply}
          disabled={accepted.size === 0}
          className="pr-4 pl-3.5"
        >
          <Check aria-hidden strokeWidth={2} className="size-4" />
          Aplicar {accepted.size === changes.length ? 'cambios' : `${accepted.size} de ${changes.length}`}
        </Button>
      </div>
    </div>
  )
}

function TextBlock({
  title,
  lines,
  muted = false,
}: {
  title: string
  lines: string[]
  muted?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{title}</p>
      <div className={`flex flex-col gap-1 text-sm ${muted ? 'text-muted' : 'text-ink'}`}>
        {lines.length > 1 ? (
          lines.map((line, index) => (
            <p key={index} className="flex gap-1.5">
              <span aria-hidden className="text-muted/60">
                •
              </span>
              <span className="min-w-0">{line}</span>
            </p>
          ))
        ) : (
          <p>{lines[0] ?? '—'}</p>
        )}
      </div>
    </div>
  )
}
