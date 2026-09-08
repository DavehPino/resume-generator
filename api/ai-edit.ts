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

import type { IncomingMessage, ServerResponse } from 'node:http'

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

/**
 * Vercel invoca las funciones de Node con la firma clásica `(req, res)`, no
 * con `Request`/`Response` del estándar web. Por eso `req.headers` es un objeto
 * plano y hay que leer el cuerpo del stream a mano.
 */
type ApiRequest = IncomingMessage & { body?: unknown }
type ApiResponse = ServerResponse

function header(request: ApiRequest, name: string): string {
  const value = request.headers[name]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function clientIp(request: ApiRequest): string {
  const forwarded = header(request, 'x-forwarded-for')
  return forwarded.split(',')[0]?.trim() || header(request, 'x-real-ip') || 'desconocida'
}

class BodyTooLarge extends Error {}

/**
 * Vercel puede entregar el cuerpo ya parseado en `req.body`. Si no lo hace, se
 * lee del stream cortando en cuanto supera el máximo, para no cargar en memoria
 * un envío enorme.
 */
async function readBody(request: ApiRequest): Promise<string> {
  if (typeof request.body === 'string') return request.body
  if (request.body && typeof request.body === 'object') return JSON.stringify(request.body)

  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = chunk as Buffer
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new BodyTooLarge()
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
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

function json(response: ApiResponse, body: unknown, status: number): void {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function fail(response: ApiResponse, error: string, status: number): void {
  json(response, { ok: false, error }, status)
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

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
): Promise<void> {
  if (request.method !== 'POST') return fail(response, 'Método no permitido.', 405)

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return fail(response, 'El servidor no tiene configurada la clave de OpenRouter.', 500)
  }

  if (rateLimited(clientIp(request))) {
    return fail(
      response,
      'Hiciste muchas consultas seguidas. Esperá unos minutos y volvé a intentar.',
      429,
    )
  }

  let rawBody: string
  try {
    rawBody = await readBody(request)
  } catch (error) {
    if (error instanceof BodyTooLarge) {
      return fail(response, 'El CV es demasiado largo para procesarlo.', 413)
    }
    return fail(response, 'No se pudo leer la petición.', 400)
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return fail(response, 'El CV es demasiado largo para procesarlo.', 413)
  }

  let payload: { instruction?: unknown; cv?: unknown }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return fail(response, 'Petición inválida.', 400)
  }

  const instruction =
    typeof payload.instruction === 'string' ? payload.instruction.trim().slice(0, MAX_INSTRUCTION) : ''
  if (instruction.length < 4) {
    return fail(response, 'Escribí qué querés que cambie.', 400)
  }

  const cv = sanitizeCv(payload.cv)
  if (!cv) return fail(response, 'Petición inválida.', 400)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 50_000)

  try {
    const aiResponse = await fetch(OPENROUTER_URL, {
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

    if (!aiResponse.ok) {
      const detail = await aiResponse.text()
      console.error('OpenRouter respondió', aiResponse.status, detail.slice(0, 500))
      if (aiResponse.status === 429) {
        return fail(response, 'El servicio de IA está saturado. Probá de nuevo en un minuto.', 429)
      }
      return fail(response, 'No se pudo contactar al servicio de IA. Probá de nuevo.', 502)
    }

    const completion = (await aiResponse.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = completion.choices?.[0]?.message?.content
    if (!content) {
      return fail(response, 'La IA devolvió una respuesta vacía. Probá de nuevo.', 502)
    }

    let result: unknown
    try {
      result = JSON.parse(content)
    } catch {
      return fail(response, 'La IA devolvió una respuesta que no se pudo leer. Probá de nuevo.', 502)
    }

    return json(response, { ok: true, result }, 200)
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    console.error('Fallo al llamar a OpenRouter:', error)
    return fail(
      response,
      aborted ? 'La IA tardó demasiado en responder. Probá de nuevo.' : 'No se pudo completar la edición.',
      aborted ? 504 : 502,
    )
  } finally {
    clearTimeout(timeout)
  }
}
