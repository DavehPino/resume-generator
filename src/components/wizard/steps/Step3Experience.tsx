import { Briefcase, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExperienceForm } from '@/components/wizard/forms/ExperienceForm'
import { StepNav } from '@/components/wizard/StepNav'
import { ItemRow, StepHeading } from '@/components/wizard/StepShell'
import { byMostRecent, formatRange } from '@/lib/formatDate'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string }

export function Step3Experience() {
  const experience = useCvStore((state) => state.data.experience)
  const noExperience = useCvStore((state) => state.noExperience)
  const addExperience = useCvStore((state) => state.addExperience)
  const updateExperience = useCvStore((state) => state.updateExperience)
  const removeExperience = useCvStore((state) => state.removeExperience)
  const setNoExperience = useCvStore((state) => state.setNoExperience)
  const { next, back } = useWizardStore()

  const [editing, setEditing] = useState<Editing>({ mode: 'closed' })
  const items = [...experience].sort(byMostRecent)
  const editingItem =
    editing.mode === 'edit' ? experience.find((item) => item.id === editing.id) : undefined

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Tu experiencia laboral"
        description="Agrega los trabajos que has tenido, empezando por el más reciente. Si aún no tienes ninguno, puedes saltar este paso."
      />

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              subject="esta experiencia"
              title={`${item.role} · ${item.company}`}
              meta={formatRange(item.startDate, item.endDate, item.isCurrent)}
              lines={item.bullets.filter(Boolean)}
              onEdit={() => setEditing({ mode: 'edit', id: item.id })}
              onRemove={() => removeExperience(item.id)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && editing.mode === 'closed' && !noExperience && (
        <EmptyState
          icon={Briefcase}
          title="Todavía no agregaste ninguna experiencia"
          description="Cuenta también prácticas, trabajos por temporada, negocios familiares o voluntariados: todo eso suma."
        />
      )}

      {noExperience && items.length === 0 && editing.mode === 'closed' && (
        <div className="rounded-3xl bg-surface p-4 text-sm text-muted shadow-border">
          <p className="text-ink">Sin experiencia laboral por ahora.</p>
          <p className="mt-1">
            Tu CV pondrá el foco en tu educación y tus habilidades. Puedes agregar una
            experiencia cuando quieras.
          </p>
        </div>
      )}

      {editing.mode !== 'closed' ? (
        <ExperienceForm
          key={editing.mode === 'edit' ? editing.id : 'new'}
          initial={editingItem}
          onCancel={() => setEditing({ mode: 'closed' })}
          onSave={(values) => {
            if (editing.mode === 'edit') updateExperience(editing.id, values)
            else addExperience(values)
            setEditing({ mode: 'closed' })
          }}
        />
      ) : (
        <Button variant="secondary" className="self-start pr-4 pl-3.5" onClick={() => setEditing({ mode: 'new' })}>
          <Plus aria-hidden strokeWidth={1.5} className="size-4" />
          {items.length > 0 ? 'Agregar otra experiencia' : 'Agregar experiencia'}
        </Button>
      )}

      <StepNav
        onBack={back}
        onContinue={next}
        secondary={
          items.length === 0 && editing.mode === 'closed' && !noExperience ? (
            <Button
              variant="quiet"
              onClick={() => {
                setNoExperience(true)
                next()
              }}
            >
              No tengo experiencia aún
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
