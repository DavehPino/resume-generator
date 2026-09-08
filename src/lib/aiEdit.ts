import { z } from 'zod'

import type { CvData } from '@/types/cv'

/**
 * Cliente de la edición asistida por IA.
 *
 * No habla con OpenRouter directamente: pega contra `/api/ai-edit`, la función
 * de Vercel que guarda la clave. Aquí solo se arma el payload, se valida lo que
 * vuelve y se calcula el diff que el usuario tiene que aprobar.
 *
 * Nada se aplica solo. El CV es de la persona: la IA propone y ella decide.
 */

const ENDPOINT = '/api/ai-edit'

const aiResultSchema = z.object({
  summary: z.string().catch(''),
  profile: z.string().nullish(),
  experience: z
    .array(z.object({ id: z.string(), bullets: z.array(z.string()) }))
    .nullish(),
  education: z.array(z.object({ id: z.string(), title: z.string() })).nullish(),
  certifications: z.array(z.object({ id: z.string(), name: z.string() })).nullish(),
  skills: z
    .object({ technical: z.array(z.string()), soft: z.array(z.string()) })
    .nullish(),
})

export type AiResult = z.infer<typeof aiResultSchema>

export type AiEditResponse = { ok: true; result: AiResult } | { ok: false; error: string }

/**
 * Se envían las secciones de texto que la IA puede reformular. Nombre,
 * contacto y fechas quedan fuera: no aportan nada y no tiene sentido
 * exponerlos. Instituciones y niveles sí viajan, pero solo como contexto: el
 * esquema de respuesta no tiene campo para devolverlos cambiados.
 */
function editablePayload(cv: CvData) {
  return {
    targetRole: cv.personal.targetRole,
    profile: cv.profile.text,
    experience: cv.experience.map((item) => ({
      id: item.id,
      role: item.role,
      company: item.company,
      bullets: item.bullets,
    })),
    education: cv.education.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
      institution: item.institution,
    })),
    certifications: cv.certifications.map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer,
    })),
    skills: cv.skills,
  }
}

export async function requestAiEdit(instruction: string, cv: CvData): Promise<AiEditResponse> {
  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instruction, cv: editablePayload(cv) }),
    })
  } catch {
    return { ok: false, error: 'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.' }
  }

  if (response.status === 404) {
    return {
      ok: false,
      error:
        'La función de IA no está disponible en este entorno. En local hay que levantar el proyecto con «vercel dev».',
    }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { ok: false, error: 'El servidor devolvió una respuesta ilegible.' }
  }

  const envelope = body as { ok?: boolean; error?: string; result?: unknown }
  if (!response.ok || !envelope.ok) {
    return { ok: false, error: envelope.error ?? 'No se pudo completar la edición.' }
  }

  const parsed = aiResultSchema.safeParse(envelope.result)
  if (!parsed.success) {
    return { ok: false, error: 'La IA devolvió algo que no se pudo interpretar. Probá de nuevo.' }
  }

  return { ok: true, result: parsed.data }
}

export interface AiChange {
  key: string
  label: string
  before: string[]
  after: string[]
}

const clean = (values: string[]) => values.map((value) => value.trim()).filter(Boolean)
const same = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Compara la propuesta con el CV actual y devuelve solo lo que cambia de
 * verdad, para que la pantalla de revisión no muestre ruido.
 */
export function diffProposal(cv: CvData, result: AiResult): AiChange[] {
  const changes: AiChange[] = []

  const profile = result.profile?.trim()
  if (profile && profile !== cv.profile.text.trim()) {
    changes.push({
      key: 'profile',
      label: 'Perfil profesional',
      before: [cv.profile.text.trim()],
      after: [profile],
    })
  }

  for (const proposal of result.experience ?? []) {
    const current = cv.experience.find((item) => item.id === proposal.id)
    if (!current) continue
    const after = clean(proposal.bullets)
    const before = clean(current.bullets)
    if (after.length === 0 || same(before, after)) continue
    changes.push({
      key: `experience:${proposal.id}`,
      label: `Logros · ${current.role || current.company}`,
      before,
      after,
    })
  }

  for (const proposal of result.education ?? []) {
    const current = cv.education.find((item) => item.id === proposal.id)
    const title = proposal.title?.trim()
    if (!current || !title || title === current.title.trim()) continue
    changes.push({
      key: `education:${proposal.id}`,
      label: `Título · ${current.institution || current.level}`,
      before: [current.title],
      after: [title],
    })
  }

  for (const proposal of result.certifications ?? []) {
    const current = cv.certifications.find((item) => item.id === proposal.id)
    const name = proposal.name?.trim()
    if (!current || !name || name === current.name.trim()) continue
    changes.push({
      key: `certification:${proposal.id}`,
      label: `Certificación · ${current.issuer}`,
      before: [current.name],
      after: [name],
    })
  }

  if (result.skills) {
    for (const group of ['technical', 'soft'] as const) {
      const after = clean(result.skills[group])
      const before = clean(cv.skills[group])
      if (after.length === 0 || same(before, after)) continue
      changes.push({
        key: `skills:${group}`,
        label: group === 'technical' ? 'Habilidades técnicas' : 'Habilidades personales',
        before,
        after,
      })
    }
  }

  return changes
}
