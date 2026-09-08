import { Award, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CertificationForm } from '@/components/wizard/forms/CertificationForm'
import { StepNav } from '@/components/wizard/StepNav'
import { ItemRow, StepHeading } from '@/components/wizard/StepShell'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

type Editing = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string }

export function Step7Certifications() {
  const certifications = useCvStore((state) => state.data.certifications)
  const addCertification = useCvStore((state) => state.addCertification)
  const updateCertification = useCvStore((state) => state.updateCertification)
  const removeCertification = useCvStore((state) => state.removeCertification)
  const { next, back } = useWizardStore()

  const [editing, setEditing] = useState<Editing>({ mode: 'closed' })
  const editingItem =
    editing.mode === 'edit' ? certifications.find((item) => item.id === editing.id) : undefined

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Certificaciones y cursos"
        description="Cursos cortos, capacitaciones de una empresa anterior, diplomados… todo suma. Si no tienes ninguno, salta este paso."
      />

      {certifications.length > 0 && (
        <div className="flex flex-col gap-3">
          {certifications.map((item) => (
            <ItemRow
              key={item.id}
              subject="esta certificación"
              title={item.name}
              meta={[item.issuer, item.date].filter(Boolean).join(' · ')}
              onEdit={() => setEditing({ mode: 'edit', id: item.id })}
              onRemove={() => removeCertification(item.id)}
            />
          ))}
        </div>
      )}

      {certifications.length === 0 && editing.mode === 'closed' && (
        <EmptyState
          icon={Award}
          title="Todavía no agregaste ninguna certificación"
          description="Si hiciste un curso de atención al cliente, computación, manipulación de alimentos o similar, agrégalo."
        />
      )}

      {editing.mode !== 'closed' ? (
        <CertificationForm
          key={editing.mode === 'edit' ? editing.id : 'new'}
          initial={editingItem}
          onCancel={() => setEditing({ mode: 'closed' })}
          onSave={(values) => {
            if (editing.mode === 'edit') updateCertification(editing.id, values)
            else addCertification(values)
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
          {certifications.length > 0 ? 'Agregar otra' : 'Agregar certificación'}
        </Button>
      )}

      <StepNav
        onBack={back}
        onContinue={next}
        secondary={
          certifications.length === 0 ? (
            <Button variant="quiet" onClick={next}>
              Omitir por ahora
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
