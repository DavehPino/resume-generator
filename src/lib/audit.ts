import { normalize, startsWithActionVerb } from '@/lib/keywords'
import type { CvData } from '@/types/cv'

/**
 * Auditoría ATS local y determinista (PROMPT-AGENTE-CV.md §6.3).
 * Sin IA y sin llamadas de red: son reglas que se pueden explicar al usuario.
 */

export type AuditLevel = 'ok' | 'warn'

export interface AuditFinding {
  id: string
  level: AuditLevel
  title: string
  detail: string
  /** Paso del wizard al que saltar para corregirlo. */
  step?: number
  /** Peso en la puntuación de compatibilidad. */
  weight: number
}

export interface AuditResult {
  findings: AuditFinding[]
  passed: number
  total: number
  /** 0–100. El objetivo recomendado por la guía ATS es 80 o más. */
  score: number
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
/** Al menos 8 dígitos, permitiendo +, espacios, guiones y paréntesis. */
const PHONE_PATTERN = /^\+?[\d\s()-]{8,}$/
export const MAX_BULLET_LENGTH = 140

export const PROFILE_MIN = 200
export const PROFILE_MAX = 600

function allBullets(cv: CvData): string[] {
  return cv.experience.flatMap((item) => item.bullets.filter((bullet) => bullet.trim()))
}

/** Todo el texto del CV, para comprobar presencia de palabras clave. */
function cvBodyText(cv: CvData): string {
  return normalize(
    [
      cv.profile.text,
      ...cv.experience.flatMap((item) => [item.role, item.company, ...item.bullets]),
      ...cv.education.map((item) => `${item.title} ${item.institution}`),
      ...cv.skills.technical,
      ...cv.skills.soft,
      ...cv.certifications.map((item) => `${item.name} ${item.issuer}`),
    ].join(' '),
  )
}

export function runAudit(cv: CvData, estimatedPages: number): AuditResult {
  const findings: AuditFinding[] = []
  const bullets = allBullets(cv)

  // 1. Longitud del perfil profesional.
  const profileLength = cv.profile.text.trim().length
  findings.push(
    profileLength >= PROFILE_MIN && profileLength <= PROFILE_MAX
      ? {
          id: 'profile-length',
          level: 'ok',
          title: 'Perfil profesional con buena extensión',
          detail: `${profileLength} caracteres. Es el espacio donde más peso tienen tus palabras clave.`,
          weight: 2,
        }
      : {
          id: 'profile-length',
          level: 'warn',
          title:
            profileLength < PROFILE_MIN
              ? 'Tu perfil profesional es muy corto'
              : 'Tu perfil profesional es muy largo',
          detail:
            profileLength < PROFILE_MIN
              ? `Tiene ${profileLength} caracteres. Lo ideal son entre ${PROFILE_MIN} y ${PROFILE_MAX}: es lo primero que lee el filtro y donde conviene nombrar el puesto y tus habilidades principales.`
              : `Tiene ${profileLength} caracteres. Recórtalo a ${PROFILE_MAX} como máximo para que quepa lo importante sin diluirse.`,
          step: 2,
          weight: 2,
        },
  )

  // 2. El puesto objetivo debe aparecer también en el cuerpo, no solo en el encabezado.
  const targetRole = normalize(cv.personal.targetRole)
  const body = cvBodyText(cv)
  const roleInBody = targetRole.length > 0 && body.includes(targetRole)
  findings.push(
    roleInBody
      ? {
          id: 'target-role',
          level: 'ok',
          title: 'El puesto objetivo aparece en el cuerpo del CV',
          detail: `"${cv.personal.targetRole}" se repite dentro del contenido, que es lo que puntúa el filtro.`,
          weight: 3,
        }
      : {
          id: 'target-role',
          level: 'warn',
          title: 'Repite el puesto objetivo dentro del CV',
          detail: `"${cv.personal.targetRole || 'el puesto'}" solo aparece bajo tu nombre. Menciónalo también en el perfil profesional: los filtros puntúan cuántas veces coincide el texto del aviso con el de tu CV.`,
          step: 2,
          weight: 3,
        },
  )

  // 3. Densidad de bullets por experiencia.
  const thinExperiences = cv.experience.filter(
    (item) => item.bullets.filter((bullet) => bullet.trim()).length < 2,
  )
  if (cv.experience.length > 0) {
    findings.push(
      thinExperiences.length === 0
        ? {
            id: 'bullets-count',
            level: 'ok',
            title: 'Todas tus experiencias tienen al menos 2 logros',
            detail: 'Suficiente detalle para que el filtro encuentre contexto y palabras clave.',
            weight: 2,
          }
        : {
            id: 'bullets-count',
            level: 'warn',
            title: 'Hay experiencias con muy poco detalle',
            detail: `${thinExperiences.map((item) => item.company).join(', ')}: agrega al menos 2 tareas o logros. Una experiencia sin detalle no aporta palabras clave.`,
            step: 3,
            weight: 2,
          },
    )
  }

  // 4. Bullets que empiezan por verbo de acción.
  if (bullets.length > 0) {
    const weak = bullets.filter((bullet) => !startsWithActionVerb(bullet))
    findings.push(
      weak.length === 0
        ? {
            id: 'action-verbs',
            level: 'ok',
            title: 'Tus logros empiezan con verbos de acción',
            detail: 'Ese arranque ("Atendí", "Gestioné", "Superé") es el que mejor lee un reclutador.',
            weight: 2,
          }
        : {
            id: 'action-verbs',
            level: 'warn',
            title: `${weak.length} ${weak.length === 1 ? 'logro no empieza' : 'logros no empiezan'} con un verbo de acción`,
            detail: `Empieza cada línea con lo que hiciste: "Atendí…", "Gestioné…", "Resolví…". Por ejemplo, revisa: "${weak[0]!.slice(0, 60)}…".`,
            step: 3,
            weight: 2,
          },
    )

    // 5. Longitud de cada bullet.
    const longBullets = bullets.filter((bullet) => bullet.trim().length > MAX_BULLET_LENGTH)
    findings.push(
      longBullets.length === 0
        ? {
            id: 'bullets-length',
            level: 'ok',
            title: 'Tus logros son breves y legibles',
            detail: `Ninguno supera los ${MAX_BULLET_LENGTH} caracteres, así que cada uno cabe en una línea.`,
            weight: 1,
          }
        : {
            id: 'bullets-length',
            level: 'warn',
            title: `${longBullets.length} ${longBullets.length === 1 ? 'logro es demasiado largo' : 'logros son demasiado largos'}`,
            detail: `Deja cada línea en una idea de máximo ${MAX_BULLET_LENGTH} caracteres. Si necesitas más, sepárala en dos.`,
            step: 3,
            weight: 1,
          },
    )
  }

  // 6. Contacto legible por el parser.
  const emailOk = EMAIL_PATTERN.test(cv.personal.email.trim())
  const phoneOk = PHONE_PATTERN.test(cv.personal.phone.trim())
  findings.push(
    emailOk && phoneOk
      ? {
          id: 'contact',
          level: 'ok',
          title: 'Tus datos de contacto son legibles',
          detail: 'Correo y teléfono van en texto plano dentro del cuerpo del CV, como espera el filtro.',
          weight: 3,
        }
      : {
          id: 'contact',
          level: 'warn',
          title: 'Revisa tus datos de contacto',
          detail: !emailOk
            ? 'El correo no tiene un formato válido. Si el filtro no lo reconoce, nadie puede responderte.'
            : 'El teléfono parece incompleto. Escríbelo con característica, por ejemplo +54 9 11 1234 5678.',
          step: 1,
          weight: 3,
        },
  )

  // 7. Cantidad de habilidades declaradas.
  const skillCount = cv.skills.technical.length + cv.skills.soft.length
  findings.push(
    skillCount >= 6
      ? {
          id: 'skills-count',
          level: 'ok',
          title: `${skillCount} habilidades declaradas`,
          detail: 'La sección de habilidades es donde el filtro busca coincidencias exactas.',
          weight: 2,
        }
      : {
          id: 'skills-count',
          level: 'warn',
          title: 'Agrega más habilidades',
          detail: `Tienes ${skillCount}. Con 6 a 12 cubres mejor las palabras clave del aviso, sin llegar a rellenar por rellenar.`,
          step: 5,
          weight: 2,
        },
  )

  // 8. Extensión final del documento.
  findings.push(
    estimatedPages <= 2
      ? {
          id: 'pages',
          level: 'ok',
          title:
            estimatedPages <= 1 ? 'Tu CV cabe en una página' : 'Tu CV ocupa 2 páginas',
          detail:
            estimatedPages <= 1
              ? 'La extensión ideal para puestos de atención, retail y operaciones.'
              : 'Aceptable, aunque una sola página suele funcionar mejor en estos puestos.',
          weight: 2,
        }
      : {
          id: 'pages',
          level: 'warn',
          title: `Tu CV ocupa ${estimatedPages} páginas`,
          detail:
            'Recorta a 1 o 2 páginas: quita las experiencias más antiguas o acorta los logros más largos.',
          step: 3,
          weight: 2,
        },
  )

  const total = findings.reduce((sum, finding) => sum + finding.weight, 0)
  const passed = findings
    .filter((finding) => finding.level === 'ok')
    .reduce((sum, finding) => sum + finding.weight, 0)

  return {
    findings,
    passed: findings.filter((finding) => finding.level === 'ok').length,
    total: findings.length,
    score: total === 0 ? 100 : Math.round((passed / total) * 100),
  }
}
