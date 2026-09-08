# Prompt de trabajo — Generador de CV optimizado para ATS

> Este documento **es el brief completo**. Léelo entero antes de escribir una línea de código.
> Todo lo que no esté aquí, resuélvelo con el criterio por defecto indicado en cada sección; no abras preguntas por cosas triviales.

---

## 1. Objetivo

Construir una **aplicación web de una sola página (SPA)** que genere currículums vitae **legibles por filtros ATS** (Applicant Tracking Systems), a partir de un **cuestionario progresivo** que la app le hace al usuario en pantalla.

- **Sin backend.** Todo corre en el navegador.
- **Sin cuentas ni login.**
- La persistencia es **localStorage**, para que el usuario pueda cerrar, volver y regenerar/editar su CV.
- El resultado final es un **PDF con texto real y seleccionable** (nunca una imagen).

## 2. Usuario objetivo

Personas que aplican a **call centers, atención al cliente, retail, logística, administrativo, servicios y trabajos de entrada en general**, en español (LATAM/España).

Implicaciones de diseño que **debes respetar**:

- Muchos usuarios tienen **poca o nula experiencia laboral formal**: el flujo no puede romperse ni verse vacío si no hay experiencia. Ofrece rutas alternativas (prácticas, trabajos informales, voluntariado, proyectos personales).
- Lenguaje **simple y directo**, sin jerga de RRHH ni de tecnología.
- **Mobile-first real**: gran parte del tráfico será desde el móvil.
- El generador es **genérico**: no asumas un rubro concreto en el modelo de datos. Los ejemplos y textos de ayuda sí pueden estar sesgados a call center / atención al cliente (es el caso de uso principal), pero como *sugerencias*, nunca como campos obligatorios de ese rubro.

## 3. Stack obligatorio

| Capa | Elección | Nota |
|---|---|---|
| Build | **Vite** | `npm create vite@latest . -- --template react-ts` |
| UI | **React 19 + TypeScript** (`strict: true`) | |
| Estilos | **Tailwind CSS v4** (plugin `@tailwindcss/vite`) | Tokens de color como variables CSS en `@theme` |
| Estado | **Zustand** + middleware `persist` | Un único store del CV + estado del wizard |
| Formularios | **react-hook-form** + **zod** (`@hookform/resolvers`) | Validación por paso, no al final |
| Rutas | **Sin router.** El paso vive en el store | Landing / Wizard / Preview son vistas condicionales |
| IDs | `crypto.randomUUID()` | Para items de listas (experiencia, educación…) |
| Export PDF | **`window.print()` + hoja de estilos `@media print`** | Ver §8. Es la vía que garantiza texto real |
| Iconos | `lucide-react` | **Solo en la UI de la app, JAMÁS dentro del CV** |
| Tests | `vitest` (opcional, solo lógica de validación y formato de fechas) | No priorizar |

**Prohibido:** `html2canvas`, `jsPDF` con render de imagen, `html2pdf.js`, o cualquier técnica que rasterice el CV. Un ATS no puede leer una imagen y eso rompe el objetivo central del producto.

**Prohibido también:** librerías de UI pesadas (MUI, Ant, Chakra). Componentes propios con Tailwind.

## 4. Estructura de carpetas esperada

```
src/
  main.tsx
  App.tsx
  types/cv.ts                  # todas las interfaces del modelo de datos
  store/
    cvStore.ts                 # datos del CV (persistido)
    wizardStore.ts             # paso actual, navegación (persistido)
  schemas/                     # esquemas zod, uno por paso
  components/
    ui/                        # Button, Input, Textarea, Select, Chip, Card, Progress...
    landing/Landing.tsx
    wizard/
      Wizard.tsx               # shell: barra de progreso, header, footer nav
      steps/Step*.tsx          # un archivo por paso
    preview/
      CvDocument.tsx           # EL documento ATS. Aislado del resto de estilos
      PreviewPanel.tsx         # contenedor con acciones (imprimir, editar, reiniciar)
  lib/
    formatDate.ts
    exportPdf.ts
    keywords.ts                # sugerencias de palabras clave por tipo de puesto
    sampleData.ts              # datos de ejemplo para probar rápido
  styles/
    index.css                  # tokens + Tailwind
    print.css                  # reglas @media print del CV
```

## 5. Modelo de datos

Define esto en `src/types/cv.ts` y **respétalo**. Todo campo no marcado como requerido es opcional.

```ts
export type MonthYear = string; // "MM/YYYY"

export interface PersonalInfo {
  fullName: string;            // requerido
  targetRole: string;          // requerido — "Puesto al que aplicas". Va bajo el nombre. Clave para ATS
  email: string;               // requerido
  phone: string;              // requerido — con característica, ej "+54 9 11 1234 5678"
  city: string;                // requerido
  country: string;             // requerido
  linkedin?: string;
  willingToRelocate?: boolean;
}

export interface ProfileSummary {
  text: string;                // requerido — 2 a 4 líneas, máx 600 caracteres
}

export interface Experience {
  id: string;
  role: string;                // requerido
  company: string;             // requerido
  city?: string;
  country?: string;
  startDate: MonthYear;        // requerido
  endDate?: MonthYear;         // vacío si isCurrent
  isCurrent: boolean;
  bullets: string[];           // 2 a 5 logros/responsabilidades, 1 línea cada uno
}

export interface Education {
  id: string;
  level: 'Secundario' | 'Terciario / Técnico' | 'Universitario' | 'Posgrado' | 'Curso o capacitación' | 'Otro'; // requerido
  title: string;               // requerido — nombre del título o carrera
  institution: string;         // requerido
  startDate?: MonthYear;
  endDate?: MonthYear;
  isInProgress: boolean;
}

export interface Language {
  id: string;
  name: string;                                            // requerido
  level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';  // requerido
  certification?: string;                                  // ej "TOEFL 95", "B2 CEFR"
}

export interface Skills {
  technical: string[];         // herramientas, software, sistemas (CRM, Excel, Zendesk...)
  soft: string[];              // habilidades blandas
}

export interface Certification {
  id: string;
  name: string;                // requerido
  issuer: string;              // requerido
  date?: MonthYear;
}

export interface Availability {
  modality?: ('Presencial' | 'Híbrido' | 'Remoto')[];
  shifts?: ('Diurno' | 'Vespertino' | 'Nocturno' | 'Turnos rotativos' | 'Fines de semana')[];
  startAvailability?: 'Inmediata' | 'En 15 días' | 'En 30 días' | 'A convenir';
  hasOwnEquipment?: boolean;   // relevante para call center remoto
  hasStableInternet?: boolean;
  hasDrivingLicense?: boolean;
}

export interface CvData {
  personal: PersonalInfo;
  profile: ProfileSummary;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  languages: Language[];
  certifications: Certification[];
  availability: Availability;
  referencesOnRequest: boolean; // default true
  meta: { createdAt: string; updatedAt: string; version: 1 };
}
```

## 6. Flujo de la aplicación

### 6.1 Landing

Una pantalla, sin scroll infinito ni secciones de marketing largas:

- Título claro del producto y una línea de propuesta de valor que mencione **"optimizado para filtros ATS"**.
- **CTA principal grande: "Crear mi CV"**.
- 3 micro-beneficios en una fila (ej: *Listo en 10 minutos* · *Compatible con filtros automáticos* · *Sin registro*).
- Si detecta un CV guardado en localStorage, muestra **además** un CTA secundario **"Continuar donde lo dejé"** y un enlace discreto **"Empezar de cero"** (con confirmación antes de borrar).

### 6.2 Wizard — pasos exactos

Un paso por pantalla. Barra de progreso arriba (`Paso X de 9`). Botones **Atrás / Continuar** siempre visibles y fijos abajo en móvil.

| # | Paso | Contenido | Obligatorio |
|---|---|---|---|
| 1 | **Datos personales** | `PersonalInfo` | Sí |
| 2 | **Perfil profesional** | `ProfileSummary`. Textarea con contador. Botón "Ver ejemplos" que inserta 3 plantillas editables según `targetRole` | Sí |
| 3 | **Experiencia laboral** | Lista de `Experience`. Botón "Agregar experiencia". **Botón "No tengo experiencia laboral aún"** que salta el paso sin culpabilizar y activa énfasis en educación/habilidades | No |
| 4 | **Educación** | Lista de `Education` | Sí (al menos 1) |
| 5 | **Habilidades** | `Skills`. Input de chips + **banco de sugerencias clicables** (§7), separado en técnicas y blandas | Sí (mín. 3 en total) |
| 6 | **Idiomas** | Lista de `Language`. Precargar "Español — Nativo" como sugerencia | No |
| 7 | **Certificaciones y cursos** | Lista de `Certification` | No |
| 8 | **Disponibilidad** | `Availability`, todo con chips/toggles multi-selección | No |
| 9 | **Revisión** | Preview del CV + panel de sugerencias de mejora + acciones de exportación | — |

Reglas del wizard:

- Validación **al intentar avanzar**, con mensajes en español, concretos y sin tono de regaño.
- El estado se guarda en localStorage **en cada cambio** (debounce ~400 ms), no solo al avanzar.
- Se puede volver atrás sin perder nada.
- En el paso 9, cada sección del preview tiene un botón discreto **"Editar"** que devuelve al paso correspondiente y luego retorna a la revisión.
- Los pasos opcionales muestran "Omitir por ahora" en lugar de bloquear.

### 6.3 Panel de sugerencias (paso 9)

Chequeos locales y deterministas (nada de IA), mostrados como lista de aciertos y avisos:

- Perfil profesional entre 200 y 600 caracteres.
- Al menos 2 bullets por experiencia.
- Bullets que empiezan con verbo de acción (comparar contra una lista de verbos en `lib/keywords.ts`).
- Presencia del `targetRole` dentro del texto del CV (peso ATS).
- Teléfono y email con formato válido.
- El CV cabe en **1 página** (2 como máximo). Si se estima que excede, avisar y sugerir recortar.
- Sin bullets de más de ~140 caracteres.

## 7. Banco de palabras clave

En `lib/keywords.ts`, un diccionario de sugerencias agrupadas por familia de puesto (**call center / atención al cliente**, ventas, administrativo, logística/bodega, retail, servicios generales) más un set transversal. Se usa para:

1. Poblar los chips sugeridos del paso 5.
2. Alimentar las plantillas de perfil del paso 2.
3. La lista de verbos de acción del validador.

Todo escrito en español neutro. Mínimo 15 técnicas y 12 blandas para la familia de call center.

## 8. Reglas ATS — CRÍTICAS, no negociables

Estas reglas aplican **al documento del CV** (`CvDocument.tsx` y `print.css`), no a la interfaz de la app.

**Estructura**

- **Una sola columna.** Sin grid de dos columnas, sin `float`, sin barras laterales.
- **Sin tablas** (`<table>`), sin cajas de texto, sin `position: absolute` para colocar contenido.
- **Sin imágenes, sin fotografía, sin iconos, sin emojis, sin líneas decorativas SVG, sin barras de nivel de idioma o habilidad.**
- Los datos de contacto van **en el cuerpo del documento**, en texto plano, nunca en un encabezado de página impresa.
- HTML semántico y lineal: `h1` (nombre), `h2` (títulos de sección), `h3` (cargo/título), `ul > li` para bullets. El orden del DOM **es** el orden de lectura.

**Tipografía y formato**

- Fuente: `Arial, Helvetica, sans-serif`. Nada de fuentes web.
- Cuerpo 10.5–11 pt, nombre 18–20 pt, títulos de sección 12 pt en **MAYÚSCULAS y negrita**.
- Interlineado 1.15–1.25. Márgenes de página 1.5–2 cm. Tamaño **A4**.
- Viñetas con `•` o `-` estándar. Nada de `▸`, `✓`, `★`.
- Fechas siempre `MM/AAAA – MM/AAAA`, y `Actualidad` para el trabajo actual.

**Títulos de sección — usar EXACTAMENTE estos textos** (los ATS los buscan por coincidencia literal):

```
PERFIL PROFESIONAL
EXPERIENCIA LABORAL
EDUCACIÓN
HABILIDADES
IDIOMAS
CERTIFICACIONES
DISPONIBILIDAD
REFERENCIAS
```

Las secciones vacías **no se renderizan**.

**Exportación**

- `exportPdf.ts` prepara el DOM (añade una clase `printing` al `body`, oculta todo salvo `#cv-document`) y llama `window.print()`.
- En `@media print`: `@page { size: A4; margin: 18mm 16mm; }`, sin `box-shadow` y sin fondos de color (los navegadores no los imprimen). El acento va en color de texto y de borde, que sí se imprimen.
- Evitar cortes feos: `.cv-entry { break-inside: avoid; }`, `h2 { break-after: avoid; }`.
- Instruir al usuario en pantalla: *"En el diálogo de impresión elige **Guardar como PDF**, tamaño A4, márgenes por defecto, y **desactiva** 'Encabezados y pies de página'."*
- Sugerir nombre de archivo `Nombre_Apellido_CV`: el navegador toma el `document.title`, así que **cámbialo antes de imprimir y restáuralo después**.
- Añadir también **"Descargar datos (.json)"** y **"Cargar datos (.json)"** como respaldo del usuario. Es barato y evita pérdidas si limpia el navegador.

**Verificación obligatoria antes de dar por terminada la tarea:** exporta un PDF de prueba, ábrelo y comprueba que **el texto se puede seleccionar y copiar**, y que al pegarlo el orden de lectura es correcto de arriba a abajo. Si no lo es, el trabajo no está terminado.

## 9. Diseño visual

**Antes de escribir estilos, invoca la skill de diseño que el usuario haya instalado** y sigue sus lineamientos. Si no hay skill disponible, aplica lo siguiente.

**Paleta** — ya definida en `src/styles/index.css` dentro de `@theme`. Úsala vía utilidades de Tailwind; no inventes colores nuevos:

| Token | Valor | Utilidad | Uso |
|---|---|---|---|
| `--color-bg` | `#0A0A0A` | `bg-bg` | Fondo base de la app |
| `--color-surface` | `#141414` | `bg-surface` | Tarjetas, campos |
| `--color-line` | `#262626` | `border-line` | Bordes sutiles |
| `--color-accent` | `#C2410C` | `bg-accent` | Naranja oscuro — CTA, foco, progreso |
| `--color-accent-hover` | `#EA580C` | `bg-accent-hover` | Estado hover |
| `--color-ink` | `#FAFAFA` | `text-ink` | Texto principal |
| `--color-muted` | `#A3A3A3` | `text-muted` | Texto secundario |
| `--color-danger` | `#DC2626` | `text-danger` | Errores de validación |

- Estética: **oscura, moderna, sobria**. Naranja usado con moderación, como acento (CTA, barra de progreso, anillo de foco, chips activos), no como fondo de grandes áreas.
- Esquinas redondeadas medias (`rounded-xl`), espaciado generoso, jerarquía tipográfica clara. Una fuente sans moderna para la app (Inter o la del sistema) — esto **no** afecta al CV.
- Transiciones cortas (150–200 ms) en hover/foco. Nada de animaciones grandes ni librerías de animación.
- Estados vacíos y de error diseñados, no los del navegador por defecto.

**Importante — el color dentro del documento.** El CV lleva un acento terracota (`#9a3412`) en los títulos de sección, el puesto objetivo, las empresas y las viñetas, con el cuerpo del texto casi negro. El color distingue la estructura; no compite con lo que se lee. Dos condiciones innegociables:

1. **El color va siempre en texto y bordes, nunca en fondos.** Los navegadores no imprimen fondos por defecto, así que un bloque de color se vería en pantalla y desaparecería del PDF.
2. **El acento es oscuro a propósito.** En escala de grises cae a un gris legible, así que el CV sigue funcionando impreso en blanco y negro.

El documento no usa la paleta de la interfaz ni utilidades de Tailwind: se dibuja con las clases de `styles/print.css`, que es donde vive esta explicación.

## 10. Accesibilidad y responsive

- Mobile-first. Probar a 360 px de ancho.
- Todos los campos con `<label>` real asociado; errores enlazados con `aria-describedby`.
- Foco visible en todos los interactivos (anillo naranja). Navegable por teclado de principio a fin.
- Contraste mínimo AA sobre el fondo oscuro.
- El preview del CV en móvil se muestra escalado dentro de un contenedor con scroll, nunca deformado.

## 11. Criterios de aceptación

Se considera terminado cuando:

1. `npm run build` pasa sin errores ni warnings de TypeScript.
2. Se puede completar el flujo entero desde el CTA hasta el PDF **sin recargar la página**.
3. Al recargar en cualquier punto, el progreso y los datos se restauran desde localStorage.
4. El PDF exportado tiene **texto seleccionable**, una sola columna, y ocupa 1 página con datos de ejemplo típicos.
5. Un CV sin experiencia laboral se genera correctamente y se ve completo.
6. La app funciona con teclado y a 360 px de ancho.
7. No hay dependencias fuera de las listadas en §3.
8. Existe un `README.md` breve: cómo correr, cómo buildear, y las 5 reglas ATS principales que respeta el documento generado.

## 12. Fuera de alcance (no lo construyas)

- Backend, base de datos, autenticación, envío de emails.
- ~~Integración con IA o APIs externas para redactar textos.~~ **Ya no**: existe «Editar con IA» en el paso de revisión. Ver §14.
- Múltiples plantillas visuales de CV. **Una sola plantilla ATS**, hecha bien.
- Traducción o multi-idioma de la interfaz. **Solo español.**
- Export a `.docx` (posible fase 2; no ahora).

## 13. Orden de implementación sugerido

> **El scaffolding ya está hecho.** El proyecto existe, las dependencias de §3 están
> instaladas, Tailwind v4 está conectado, el alias `@/` → `src/` funciona, la
> estructura de carpetas de §4 está creada (con `.gitkeep`) y los tokens de color
> están en `src/styles/index.css`. `src/styles/print.css` tiene la base de las reglas
> de impresión. `src/App.tsx` es un placeholder que debes reemplazar.
> **No vuelvas a hacer `npm create vite`.** Empieza en el punto 2.

1. ~~Scaffolding Vite + TS + Tailwind + tokens de color.~~ (hecho)
2. `types/cv.ts` y los stores Zustand con `persist`.
3. Componentes `ui/` base (Button, Input, Textarea, Select, Chip, Card, Progress).
4. Shell del wizard con navegación y barra de progreso, con pasos vacíos.
5. Pasos 1 → 8 con sus esquemas zod.
6. `CvDocument.tsx` + `print.css`. **Verificar la exportación PDF aquí, antes de seguir.**
7. Paso 9: preview, panel de sugerencias, export, import/export JSON.
8. Landing.
9. Pulido: responsive, foco, estados vacíos, `sampleData` para pruebas, README.

---

**Regla final:** ante cualquier duda entre *"se ve más bonito"* y *"lo lee mejor un ATS"*, gana siempre el ATS dentro del documento; y gana el diseño en la interfaz de la app. Son dos superficies distintas con dos criterios distintos.

---

## 14. Editar con IA

Añadido después del brief original. Está en el paso 9, entre la tarjeta de compatibilidad ATS y los avisos.

**Arquitectura.** La clave de API no puede viajar al navegador: cualquiera la extraería del bundle. Por eso hay una función serverless en `api/ai-edit.ts` (Vercel) que guarda `OPENROUTER_API_KEY` del lado servidor y llama a OpenRouter. El cliente (`src/lib/aiEdit.ts`) solo manda la instrucción y los campos editables.

**El prompt de sistema vive en la función, no en el cliente.** Si el endpoint aceptara mensajes libres, sería un LLM gratis pagado con la cuenta del dueño del proyecto. Solo acepta `{ instruction, cv }`.

**Reglas del asistente, no negociables:**

- **No inventa nada**: ni empleos, ni fechas, ni métricas, ni herramientas. Si se le pide, se niega y lo explica. Un CV con datos falsos le cuesta el puesto a la persona.
- Solo puede tocar perfil profesional, logros de experiencia y habilidades. Nunca nombre, contacto, fechas ni empresas.
- Aplica las mismas reglas ATS del §8: verbo de acción al inicio, 140 caracteres por logro, perfil de 200–600.

**Nada se aplica solo.** La respuesta se compara con el CV actual (`diffProposal`) y se muestra un antes/después por campo, con una casilla por cambio. El usuario aprueba lo que quiere.

**Protecciones del endpoint:** límite de 10 peticiones por IP cada 10 minutos (en memoria del proceso, best-effort), tope de tamaño del cuerpo, recorte del CV antes de enviarlo al modelo y timeout de 50 s.

**Modelo.** Por defecto uno gratuito de OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`), elegido por soportar salida estructurada, que es lo que hace fiable el parseo del JSON. Se cambia con `OPENROUTER_MODEL` sin tocar código. Los modelos `:free` no cobran por token pero tienen tope de peticiones por minuto y por día.

## 15. Paleta de color del CV

Selector de seis paletas en el paso de revisión (`lib/palettes.ts`). Cambia únicamente el acento del documento: títulos de sección, puesto objetivo, empresas y viñetas. El cuerpo del texto queda casi negro en todas.

- Los acentos se aplican como variables CSS en línea (`--cv-accent`, `--cv-rule`) sobre el nodo raíz del documento, así viajan con el clon al imprimir.
- **Todos los acentos superan 7:1 de contraste sobre blanco.** Es la condición que hace que el CV se siga leyendo impreso en blanco y negro; si agregás una paleta, respetala.
- El campo `palette` vive dentro de `CvData`, así que se persiste y se exporta con el resto. Un respaldo anterior al selector se importa igual y toma Terracota.
