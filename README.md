# Generador de CV (ATS)

Aplicación web que genera currículums **legibles por filtros ATS** a partir de un
cuestionario progresivo. Sin backend, sin registro; los datos viven en el
`localStorage` del navegador.

El brief completo está en [`PROMPT-AGENTE-CV.md`](./PROMPT-AGENTE-CV.md).

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción
npm run preview  # sirve el build
npm run lint     # oxlint
```

### Atajos de desarrollo

Solo en `npm run dev`; no existen en el build de producción:

| URL | Qué hace |
| --- | --- |
| `/?demo=1` | Carga el CV de ejemplo y abre la revisión |
| `/?demo=stepN` | Carga el ejemplo y abre el paso N (1–9) |
| `/?demo=sinexp` | El ejemplo sin experiencia laboral |
| `/?demo=print` | Deja el DOM listo para imprimir, para validar el PDF con Chrome headless |

## Stack

- **Vite** + **React 19** + **TypeScript** (`strict`)
- **Tailwind CSS v4** — tokens de color en `src/styles/index.css` (`@theme`)
- **Zustand** (`persist`) — estado del CV y del wizard, persistido en localStorage
- **react-hook-form** + **zod** — validación por paso
- **lucide-react** — iconos, solo en la UI de la app
- Alias `@/` → `src/`
- **OpenRouter** vía una función serverless en `api/` — solo para «Editar con IA»

## Editar con IA

En el paso de revisión hay un botón que abre un asistente para pedir cambios puntuales
sobre el texto del CV. No inventa datos y nada se aplica sin que el usuario apruebe cada
cambio en una pantalla de antes/después.

La clave de API **nunca** llega al navegador: vive en la función `api/ai-edit.ts`.

### Configuración

1. Sacá una clave en [openrouter.ai/keys](https://openrouter.ai/keys).
2. En Vercel → *Settings* → *Environment Variables*, cargá:
   - `OPENROUTER_API_KEY` (obligatoria)
   - `OPENROUTER_MODEL` (opcional; por defecto `nvidia/nemotron-3-super-120b-a12b:free`,
     que no cobra por token. Alternativas gratuitas: `google/gemma-4-31b-it:free`,
     `dots-studio/dots-3-note-preview:free`)
3. Para probarlo en local hace falta `vercel dev` (`npm run dev` no sirve endpoints de
   `api/`; la app lo detecta y avisa en pantalla).

Ver `.env.example`. El endpoint limita a 10 consultas por IP cada 10 minutos. Los modelos
`:free` no cobran por token, pero OpenRouter les aplica su propio tope de peticiones por
minuto y por día: <https://openrouter.ai/docs/api-reference/limits>

## Color del CV

En el paso de revisión hay un selector con seis paletas (`src/lib/palettes.ts`). Cambia
solo el acento —títulos de sección, puesto, empresas y viñetas—; el cuerpo del texto
queda casi negro porque es lo que se lee.

Los seis acentos superan 7:1 de contraste sobre blanco, así que el CV sigue siendo legible
impreso en escala de grises. **Si agregás una paleta, mantené esa condición.**

La paleta viaja dentro del CV: se guarda en localStorage y se incluye en el `.json` de
respaldo. Un respaldo anterior a esta función se importa igual y toma Terracota.

## Estructura

```
src/
  types/        modelo de datos del CV
  store/        stores Zustand (cv, wizard)
  schemas/      esquemas zod, uno por paso
  lib/          fechas, export PDF, banco de palabras clave
  components/
    ui/         componentes base
    landing/    pantalla inicial con el CTA
    wizard/     shell del cuestionario + steps/
    preview/    CvDocument (el documento ATS) + panel de acciones
  styles/       index.css (app) y print.css (documento)
```

## Las 5 reglas ATS que respeta el documento generado

1. **Una sola columna**, sin tablas ni barras laterales: el orden del DOM es el orden de lectura.
2. **Texto real y seleccionable** — se exporta imprimiendo el DOM, nunca rasterizando a imagen.
3. **Sin imágenes, iconos, emojis ni gráficos de nivel**; datos de contacto en texto plano dentro del cuerpo.
4. **Títulos de sección literales** (`EXPERIENCIA LABORAL`, `EDUCACIÓN`, `HABILIDADES`…) y fechas en `MM/AAAA`.
5. **Fuente estándar** (Arial) y A4 con márgenes normales. El acento de color va solo en texto y bordes, en un tono oscuro que sigue siendo legible impreso en blanco y negro.

La paleta naranja/negra es de la **interfaz**; el CV usa su propio acento terracota. Ver el comentario en
`src/styles/print.css`.
