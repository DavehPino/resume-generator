import { Languages, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LanguageForm } from '@/components/wizard/forms/LanguageForm'
import { StepNav } from '@/components/wizard/StepNav'
import { ItemRow, StepHeading } from '@/components/wizard/StepShell'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string }

export function Step6Languages() {
  const languages = useCvStore((state) => state.data.languages)
  const addLanguage = useCvStore((state) => state.addLanguage)
  const updateLanguage = useCvStore((state) => state.updateLanguage)
  const removeLanguage = useCvStore((state) => state.removeLanguage)
  const { next, back } = useWizardStore()

  const [editing, setEditing] = useState<Editing>({ mode: 'closed' })
  const editingItem =
    editing.mode === 'edit' ? languages.find((item) => item.id === editing.id) : undefined
  const hasSpanish = languages.some((item) => item.name.toLowerCase().startsWith('espa'))

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Idiomas que hablas"
        description="Aunque solo sea uno, decláralo: muchos avisos filtran por este campo."
      />

      {languages.length > 0 && (
        <div className="flex flex-col gap-3">
          {languages.map((item) => (
            <ItemRow
              key={item.id}
              subject="este idioma"
              title={item.name}
              meta={[item.level, item.certification].filter(Boolean).join(' · ')}
              onEdit={() => setEditing({ mode: 'edit', id: item.id })}
              onRemove={() => removeLanguage(item.id)}
            />
          ))}
        </div>
      )}

      {languages.length === 0 && editing.mode === 'closed' && (
        <EmptyState
          icon={Languages}
          title="Todavía no agregaste ningún idioma"
          description="Empieza por tu idioma materno y agrega cualquier otro que manejes, aunque sea a nivel básico."
        />
      )}

      {!hasSpanish && editing.mode === 'closed' && (
        <Button
          variant="quiet"
          size="sm"
          className="self-start"
          onClick={() => addLanguage({ name: 'Español', level: 'Nativo' })}
        >
          Agregar «Español — Nativo»
        </Button>
      )}

      {editing.mode !== 'closed' ? (
        <LanguageForm
          key={editing.mode === 'edit' ? editing.id : 'new'}
          initial={editingItem}
          onCancel={() => setEditing({ mode: 'closed' })}
          onSave={(values) => {
            if (editing.mode === 'edit') updateLanguage(editing.id, values)
            else addLanguage(values)
            setEditing({ mode: 'closed' })
          }}
        />
      ) : (
        <Button
          variant="secondary"
          className="self-start pr-4 pl-3.5"
          onClick={() => setEditing({ mode: 'new' })}
        >
          <Plus aria-hidden strokeWidth={1.5} className="size-4" />
          {languages.length > 0 ? 'Agregar otro idioma' : 'Agregar idioma'}
        </Button>
      )}

      <StepNav
        onBack={back}
        onContinue={next}
        secondary={
          languages.length === 0 ? (
            <Button variant="quiet" onClick={next}>
              Omitir por ahora
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
