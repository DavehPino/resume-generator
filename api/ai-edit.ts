/**
 * Proxy hacia OpenRouter para la edición asistida del CV.
 *
 * Existe por una razón concreta: la clave de API nunca puede viajar al
 * navegador. Aquí vive del lado servidor, en la variable de entorno
 * OPENROUTER_API_KEY de Vercel, y el cliente solo manda la instrucción del
 * usuario y los campos editables del CV.
 *
 * El prompt de sistema también vive aquí a propósito. Si el endpoint aceptara
 * mensajes libres, cualquiera podría usarlo como un LLM gratis pagado con tu
 * cuenta. Solo acepta esta forma de payload.
 */

export const maxDuration = 60

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Modelo gratuito (variante `:free` de OpenRouter, sin costo por token).
 * Se eligió por soportar `structured_outputs`, que es lo que hace fiable el
 * parseo del JSON, y por ser el más grande de los gratuitos con esa capacidad.
 * Se puede cambiar por `OPENROUTER_MODEL` sin tocar código.
 */
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'

const MAX_INSTRUCTION = 1500
const MAX_BODY_BYTES = 24_000
const MAX_BULLETS_PER_JOB = 5

/** Límite por IP: ventana deslizante en memoria del proceso. */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

interface EditableCv {
  targetRole: string
  profile: string
  experience: { id: string; role: string; company: string; bullets: string[] }[]
  skills: { technical: string[]; soft: string[] }
}

const SYSTEM_PROMPT = `Sos un editor de currículums especializado en filtros ATS (Applicant Tracking Systems), para el mercado laboral argentino. Escribís en español neutro, claro y sin jerga de recursos humanos.

REGLA MÁS IMPORTANTE: no inventes NADA.
- No agregues empleos, empresas, fechas, títulos, certificaciones ni estudios que la persona no haya declarado.
- No inventes números, porcentajes ni métricas. Si un logro no trae un dato, reformúlalo sin dato.
- No agregues herramientas, sistemas ni habilidades que no se deduzcan de lo que la persona ya escribió.
- Si la instrucción te pide inventar o exagerar, NO lo hagas: devolvé los campos sin cambios y explicá en "summary" por qué no lo hiciste. Un CV con datos falsos le cuesta el trabajo a la persona.

Tu tarea es reescribir y mejorar el texto que ya existe: más claro, más concreto y con las palabras clave que busca un filtro.

REGLAS DE ESTILO ATS:
- Cada logro empieza con un verbo de acción en pasado: "Atendí", "Gestioné", "Resolví", "Coordiné", "Superé".
- Cada logro es una sola idea de máximo 140 caracteres.
- Máximo ${MAX_BULLETS_PER_JOB} logros por puesto.
- El perfil profesional tiene entre 200 y 600 caracteres y menciona el puesto objetivo tal cual está escrito.
- Usá la terminología exacta del rubro ("atención al cliente", "CRM", "gestión de reclamos"), no sinónimos creativos.
- Nada de emojis, viñetas decorativas ni formato markdown dentro de los textos.

FORMATO DE RESPUESTA: devolvé únicamente un objeto JSON con esta forma:
{
  "summary": "una o dos frases, en segunda persona, contando qué cambiaste y por qué",
  "profile": "el perfil reescrito, o null si no lo tocaste",
  "experience": [{ "id": "el id exacto que recibiste", "bullets": ["logro 1", "logro 2"] }],
  "skills": { "technical": ["..."], "soft": ["..."] }
}

- Incluí SOLO los campos que realmente cambiaste. Lo que no cambies va en null (o en una lista vacía, para "experience").
- En "experience", usá exactamente los mismos id que recibiste y devolvé la lista COMPLETA de logros de ese puesto, no solo los nuevos.
- En "skills", devolvé las listas completas ya ordenadas, no solo lo que agregás.`

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  // Evita que el Map crezca sin control en un proceso caliente.
  if (hits.size > 5000) hits.clear()
  return false
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function fail(error: string, status: number): Response {
  return json({ ok: false, error }, status)
}

/** Recorta el CV a lo que el modelo necesita ver y a un tamaño acotado. */
function sanitizeCv(raw: unknown): EditableCv | null {
  if (typeof raw !== 'object' || raw === null) return null
  const cv = raw as Record<string, unknown>
  const skills = (cv.skills ?? {}) as Record<string, unknown>

  const text = (value: unknown, max: number): string =>
    typeof value === 'string' ? value.slice(0, max) : ''

  const list = (value: unknown, max: number, itemMax: number): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string').slice(0, max).map((item) => item.slice(0, itemMax))
      : []

  return {
    targetRole: text(cv.targetRole, 120),
    profile: text(cv.profile, 1200),
    experience: Array.isArray(cv.experience)
      ? cv.experience.slice(0, 10).map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            id: text(item.id, 64),
            role: text(item.role, 120),
            company: text(item.company, 120),
            bullets: list(item.bullets, MAX_BULLETS_PER_JOB, 300),
          }
        })
      : [],
    skills: {
      technical: list(skills.technical, 30, 60),
      soft: list(skills.soft, 30, 60),
    },
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return fail('Método no permitido.', 405)

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return fail('El servidor no tiene configurada la clave de OpenRouter.', 500)
  }

  if (rateLimited(clientIp(request))) {
    return fail('Hiciste muchas consultas seguidas. Esperá unos minutos y volvé a intentar.', 429)
  }

  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_BYTES) {
    return fail('El CV es demasiado largo para procesarlo.', 413)
  }

  let payload: { instruction?: unknown; cv?: unknown }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return fail('Petición inválida.', 400)
  }

  const instruction =
    typeof payload.instruction === 'string' ? payload.instruction.trim().slice(0, MAX_INSTRUCTION) : ''
  if (instruction.length < 4) {
    return fail('Escribí qué querés que cambie.', 400)
  }

  const cv = sanitizeCv(payload.cv)
  if (!cv) return fail('Petición inválida.', 400)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 50_000)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        // Atribución en OpenRouter; opcional pero recomendado por ellos.
        'x-title': 'Generador de CV ATS',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        max_tokens: 2000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `INSTRUCCIÓN DE LA PERSONA:\n${instruction}\n\nCV ACTUAL (JSON):\n${JSON.stringify(cv, null, 2)}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenRouter respondió', response.status, detail.slice(0, 500))
      if (response.status === 429) {
        return fail('El servicio de IA está saturado. Probá de nuevo en un minuto.', 429)
      }
      return fail('No se pudo contactar al servicio de IA. Probá de nuevo.', 502)
    }

    const completion = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = completion.choices?.[0]?.message?.content
    if (!content) return fail('La IA devolvió una respuesta vacía. Probá de nuevo.', 502)

    let result: unknown
    try {
      result = JSON.parse(content)
    } catch {
      return fail('La IA devolvió una respuesta que no se pudo leer. Probá de nuevo.', 502)
    }

    return json({ ok: true, result }, 200)
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    console.error('Fallo al llamar a OpenRouter:', error)
    return fail(
      aborted ? 'La IA tardó demasiado en responder. Probá de nuevo.' : 'No se pudo completar la edición.',
      aborted ? 504 : 502,
    )
  } finally {
    clearTimeout(timeout)
  }
}
