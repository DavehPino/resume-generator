import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Chip, RemovableChip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Field'
import { StepNav } from '@/components/wizard/StepNav'
import { StepHeading } from '@/components/wizard/StepShell'
import { normalize, suggestionsFor } from '@/lib/keywords'
import { useCvStore } from '@/store/cvStore'
import { useWizardStore } from '@/store/wizardStore'

type Group = 'technical' | 'soft'

const GROUP_LABELS: Record<Group, { title: string; hint: string; placeholder: string }> = {
  technical: {
    title: 'Habilidades técnicas',
    hint: 'Herramientas, sistemas y tareas concretas. Son las que el filtro busca palabra por palabra.',
    placeholder: 'Ej. Manejo de CRM',
  },
  soft: {
    title: 'Habilidades personales',
    hint: 'Cómo trabajas y cómo tratas a las personas.',
    placeholder: 'Ej. Escucha activa',
  },
}

export function Step5Skills() {
  const skills = useCvStore((state) => state.data.skills)
  const targetRole = useCvStore((state) => state.data.personal.targetRole)
  const setSkills = useCvStore((state) => state.setSkills)
  const { next, back } = useWizardStore()

  const [error, setError] = useState<string | null>(null)
  const suggestions = suggestionsFor(targetRole)
  const total = skills.technical.length + skills.soft.length

  const toggle = (group: Group, label: string) => {
    const current = skills[group]
    const exists = current.some((item) => normalize(item) === normalize(label))
    setSkills({
      ...skills,
      [group]: exists
        ? current.filter((item) => normalize(item) !== normalize(label))
        : [...current, label],
    })
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Tus habilidades"
        description="Elige las que de verdad manejas. Copiar el lenguaje del aviso es lo que más sube tus posibilidades de pasar el filtro."
      />

      {(['technical', 'soft'] as const).map((group) => {
        const selected = skills[group]
        const options = suggestions[group].filter(
          (option) => !selected.some((item) => normalize(item) === normalize(option)),
        )
        return (
          <section key={group} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium text-ink">{GROUP_LABELS[group].title}</h2>
              <p className="text-xs text-muted">{GROUP_LABELS[group].hint}</p>
            </div>

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.map((item) => (
                  <RemovableChip key={item} label={item} onRemove={() => toggle(group, item)} />
                ))}
              </div>
            )}

            {options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    pressed={false}
                    onToggle={() => toggle(group, option)}
                  />
                ))}
              </div>
            )}

            <AddSkill
              placeholder={GROUP_LABELS[group].placeholder}
              label={`Agregar a ${GROUP_LABELS[group].title.toLowerCase()}`}
              onAdd={(value) => toggle(group, value)}
            />
          </section>
        )
      })}

      {error && <p className="text-sm text-danger">{error}</p>}

      <StepNav
        onBack={back}
        onContinue={() => {
          if (total < 3) {
            setError('Agrega al menos 3 habilidades para continuar.')
            return
          }
          setError(null)
          next()
        }}
      />
    </div>
  )
}

function AddSkill({
  label,
  placeholder,
  onAdd,
}: {
  label: string
  placeholder: string
  onAdd: (value: string) => void
}) {
  const [value, setValue] = useState('')

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        const clean = value.trim()
        if (!clean) return
        onAdd(clean)
        setValue('')
      }}
    >
      <div className="min-w-0 flex-1">
        <Input
          label={label}
          hideLabel
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Button variant="secondary" type="submit" disabled={!value.trim()} className="pr-4 pl-3.5">
        <Plus aria-hidden strokeWidth={1.5} className="size-4" />
        Agregar
      </Button>
    </form>
  )
}
