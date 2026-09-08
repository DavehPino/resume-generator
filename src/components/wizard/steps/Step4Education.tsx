import { GraduationCap, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EducationForm } from '@/components/wizard/forms/EducationForm'
import { StepNav } from '@/components/wizard/StepNav'
import { ItemRow, StepHeading } from '@/components/wizard/StepShell'
import { byMostRecent, formatRange } from '@/lib/formatDate'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string }

export function Step4Education() {
  const education = useCvStore((state) => state.data.education)
  const addEducation = useCvStore((state) => state.addEducation)
  const updateEducation = useCvStore((state) => state.updateEducation)
  const removeEducation = useCvStore((state) => state.removeEducation)
  const { next, back } = useWizardStore()

  const [editing, setEditing] = useState<Editing>({ mode: 'closed' })
  const [error, setError] = useState<string | null>(null)

  const items = [...education].sort(byMostRecent)
  const editingItem =
    editing.mode === 'edit' ? education.find((item) => item.id === editing.id) : undefined

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Tu educación"
        description="Agrega al menos un estudio. La enseñanza media completa también cuenta y es lo que piden muchos avisos."
      />

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              subject="este estudio"
              title={item.title}
              meta={[
                item.institution,
                item.isInProgress
                  ? [item.startDate, 'En curso'].filter(Boolean).join(' – ')
                  : formatRange(item.startDate, item.endDate, false),
              ]
                .filter(Boolean)
                .join(' · ')}
              onEdit={() => setEditing({ mode: 'edit', id: item.id })}
              onRemove={() => removeEducation(item.id)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && editing.mode === 'closed' && (
        <EmptyState
          icon={GraduationCap}
          title="Todavía no agregaste ningún estudio"
          description="Incluye tu nivel más alto: enseñanza media, un técnico, una carrera o un curso que hayas terminado."
        />
      )}

      {editing.mode !== 'closed' ? (
        <EducationForm
          key={editing.mode === 'edit' ? editing.id : 'new'}
          initial={editingItem}
          onCancel={() => setEditing({ mode: 'closed' })}
          onSave={(values) => {
            if (editing.mode === 'edit') updateEducation(editing.id, values)
            else addEducation(values)
            setEditing({ mode: 'closed' })
            setError(null)
          }}
        />
      ) : (
        <Button
          variant="secondary"
          className="self-start pr-4 pl-3.5"
          onClick={() => setEditing({ mode: 'new' })}
        >
          <Plus aria-hidden strokeWidth={1.5} className="size-4" />
          {items.length > 0 ? 'Agregar otro estudio' : 'Agregar estudio'}
        </Button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <StepNav
        onBack={back}
        onContinue={() => {
          if (education.length === 0) {
            setError('Agrega al menos un estudio para continuar.')
            return
          }
          setError(null)
          next()
        }}
      />
    </div>
  )
}
