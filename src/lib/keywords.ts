/**
 * Banco de palabras clave en español neutro (PROMPT-AGENTE-CV.md §7).
 *
 * Alimenta tres cosas:
 *   1. Los chips sugeridos del paso de Habilidades.
 *   2. Las plantillas de perfil profesional.
 *   3. La lista de verbos de acción que usa el auditor de `lib/audit.ts`.
 *
 * Criterio ATS: las sugerencias usan la terminología exacta que aparece en los
 * avisos de empleo ("atención al cliente", "CRM", "Excel"), no sinónimos
 * creativos. Un ATS busca coincidencia literal.
 */

export type JobFamilyKey =
  | 'callcenter'
  | 'ventas'
  | 'administrativo'
  | 'logistica'
  | 'retail'
  | 'servicios'
  | 'general'

export interface JobFamily {
  key: JobFamilyKey
  label: string
  /** Palabras que, si aparecen en el puesto objetivo, activan esta familia. */
  matchers: string[]
  technical: string[]
  soft: string[]
  /** Plantillas de perfil. Reciben el puesto objetivo tal y como lo escribió el usuario. */
  templates: (role: string) => string[]
}

const TRANSVERSAL_TECHNICAL = [
  'Microsoft Office',
  'Excel',
  'Correo electrónico',
  'Google Workspace',
  'Manejo de sistemas informáticos',
  'Ingreso de datos',
  'Elaboración de informes',
]

const TRANSVERSAL_SOFT = [
  'Trabajo en equipo',
  'Comunicación efectiva',
  'Responsabilidad',
  'Puntualidad',
  'Adaptabilidad',
  'Proactividad',
  'Organización',
  'Aprendizaje rápido',
]

export const JOB_FAMILIES: JobFamily[] = [
  {
    key: 'callcenter',
    label: 'Call center y atención al cliente',
    matchers: [
      'call center',
      'callcenter',
      'contact center',
      'atencion al cliente',
      'atencion cliente',
      'servicio al cliente',
      'teleoperador',
      'telefonista',
      'agente',
      'ejecutivo de atencion',
      'soporte',
      'help desk',
      'mesa de ayuda',
      'cobranza',
      'telemarketing',
    ],
    technical: [
      'Atención al cliente',
      'Atención telefónica',
      'Soporte al cliente',
      'Manejo de CRM',
      'Salesforce',
      'Zendesk',
      'HubSpot',
      'Gestión de tickets',
      'Registro de llamadas',
      'Atención por chat',
      'Atención por correo electrónico',
      'Ventas telefónicas',
      'Retención de clientes',
      'Gestión de reclamos',
      'Escalamiento de casos',
      'Cumplimiento de KPI',
      'Manejo de scripts de atención',
      'Cobranza telefónica',
      'Excel',
      'Ingreso de datos',
    ],
    soft: [
      'Comunicación efectiva',
      'Escucha activa',
      'Resolución de problemas',
      'Manejo de clientes difíciles',
      'Empatía',
      'Paciencia',
      'Tolerancia a la presión',
      'Trabajo en equipo',
      'Orientación al cliente',
      'Orientación a resultados',
      'Adaptabilidad',
      'Organización',
      'Proactividad',
      'Disciplina',
    ],
    templates: (role) => [
      `Profesional de ${role} con experiencia en atención telefónica, resolución de reclamos y uso de CRM. Manejo alto volumen de contactos diarios manteniendo la calidad del servicio y el cumplimiento de KPI. Destaco por mi escucha activa, mi tolerancia a la presión y mi orientación al cliente. Disponibilidad para turnos rotativos.`,
      `${role} orientado a la satisfacción del cliente, con manejo de atención telefónica, chat y correo electrónico. Experiencia registrando casos en sistemas CRM, escalando incidencias y cumpliendo indicadores de calidad y tiempos de respuesta. Trabajo bien en equipo y bajo presión.`,
      `Persona responsable y con excelente comunicación, en búsqueda de un puesto de ${role}. Manejo de herramientas informáticas, ingreso de datos y atención de público. Aprendizaje rápido, disponibilidad inmediata y compromiso con las metas del equipo.`,
    ],
  },
  {
    key: 'ventas',
    label: 'Ventas y comercial',
    matchers: [
      'vendedor',
      'ventas',
      'comercial',
      'asesor comercial',
      'ejecutivo comercial',
      'promotor',
      'representante',
      'televentas',
    ],
    technical: [
      'Ventas',
      'Asesoría comercial',
      'Prospección de clientes',
      'Cierre de ventas',
      'Cumplimiento de metas',
      'Manejo de CRM',
      'Venta cruzada',
      'Seguimiento post venta',
      'Manejo de caja',
      'Elaboración de cotizaciones',
      'Gestión de cartera de clientes',
      'Excel',
      'Reportes de ventas',
    ],
    soft: [
      'Negociación',
      'Persuasión',
      'Orientación a resultados',
      'Comunicación efectiva',
      'Autonomía',
      'Perseverancia',
      'Trabajo bajo metas',
      'Relaciones interpersonales',
      'Proactividad',
    ],
    templates: (role) => [
      `${role} con experiencia en prospección, asesoría y cierre de ventas. Acostumbrado a trabajar por metas, gestionar cartera de clientes y registrar la actividad comercial en CRM. Perfil orientado a resultados, con buena comunicación y capacidad de negociación.`,
      `Asesor comercial enfocado en el cliente, con experiencia en venta presencial y telefónica, seguimiento post venta y cumplimiento de objetivos mensuales. Busco un puesto de ${role} donde aportar mi capacidad de negociación y mi constancia.`,
      `Persona proactiva y con facilidad de trato, en búsqueda de un puesto de ${role}. Manejo de atención de público, promoción de productos y cumplimiento de metas. Disponibilidad inmediata y disposición para aprender.`,
    ],
  },
  {
    key: 'administrativo',
    label: 'Administrativo y oficina',
    matchers: [
      'administrativo',
      'administracion',
      'secretaria',
      'secretario',
      'recepcionista',
      'asistente',
      'auxiliar administrativo',
      'oficina',
      'contable',
      'facturacion',
    ],
    technical: [
      'Gestión administrativa',
      'Excel',
      'Microsoft Office',
      'Ingreso de datos',
      'Archivo y documentación',
      'Facturación',
      'Atención de público',
      'Manejo de agenda',
      'Elaboración de informes',
      'Control de inventario',
      'Conciliación de documentos',
      'Redacción de correos',
      'Google Workspace',
    ],
    soft: [
      'Organización',
      'Atención al detalle',
      'Discreción',
      'Responsabilidad',
      'Gestión del tiempo',
      'Comunicación efectiva',
      'Trabajo en equipo',
      'Autonomía',
    ],
    templates: (role) => [
      `${role} con experiencia en gestión administrativa, manejo de documentación y atención de público. Dominio de Excel y herramientas de oficina para el ingreso de datos y la elaboración de informes. Destaco por mi organización, mi atención al detalle y mi confiabilidad.`,
      `Perfil administrativo ordenado y metódico, con experiencia en archivo, facturación y soporte a equipos de trabajo. Busco un puesto de ${role} donde aportar mi manejo de sistemas informáticos y mi capacidad de gestionar varias tareas a la vez.`,
      `Persona responsable y organizada, en búsqueda de un puesto de ${role}. Manejo de Microsoft Office, ingreso de datos y atención al cliente. Rápida adaptación a nuevos sistemas y disponibilidad inmediata.`,
    ],
  },
  {
    key: 'logistica',
    label: 'Logística y bodega',
    matchers: [
      'bodega',
      'almacen',
      'logistica',
      'operario',
      'reponedor',
      'picking',
      'despacho',
      'inventario',
      'repartidor',
      'conductor',
      'chofer',
      'montacargas',
    ],
    technical: [
      'Control de inventario',
      'Picking y packing',
      'Recepción de mercadería',
      'Despacho de pedidos',
      'Manejo de montacargas',
      'Uso de lector de código de barras',
      'Gestión de stock',
      'Preparación de pedidos',
      'Carga y descarga',
      'Excel',
      'Registro en sistema',
      'Normas de seguridad',
    ],
    soft: [
      'Trabajo en equipo',
      'Puntualidad',
      'Resistencia física',
      'Atención al detalle',
      'Responsabilidad',
      'Cumplimiento de plazos',
      'Orden y limpieza',
      'Adaptabilidad',
    ],
    templates: (role) => [
      `${role} con experiencia en recepción, almacenamiento y despacho de mercadería. Manejo de control de inventario y registro en sistema, cumpliendo las normas de seguridad y los plazos de entrega. Destaco por mi puntualidad, mi orden y mi trabajo en equipo.`,
      `Operario de bodega con práctica en picking, packing y preparación de pedidos de alto volumen. Busco un puesto de ${role} donde aportar mi rapidez, mi atención al detalle y mi compromiso con el cumplimiento de plazos.`,
      `Persona responsable y con buena disposición física, en búsqueda de un puesto de ${role}. Experiencia en carga, descarga y orden de mercadería. Disponibilidad para turnos rotativos e incorporación inmediata.`,
    ],
  },
  {
    key: 'retail',
    label: 'Retail y tienda',
    matchers: [
      'retail',
      'tienda',
      'cajero',
      'caja',
      'local',
      'supermercado',
      'dependiente',
      'vendedor de tienda',
      'mesero',
      'garzon',
      'barista',
    ],
    technical: [
      'Atención al cliente',
      'Manejo de caja',
      'Punto de venta (POS)',
      'Reposición de productos',
      'Control de inventario',
      'Manejo de efectivo',
      'Cuadre de caja',
      'Exhibición de productos',
      'Normas de higiene y seguridad',
      'Toma de pedidos',
    ],
    soft: [
      'Orientación al cliente',
      'Trabajo en equipo',
      'Amabilidad',
      'Rapidez',
      'Honestidad',
      'Tolerancia a la presión',
      'Puntualidad',
      'Presentación personal',
    ],
    templates: (role) => [
      `${role} con experiencia en atención al cliente, manejo de caja y reposición de productos en sala. Acostumbrado al trabajo en tienda con alto flujo de público, cuadre de caja y cumplimiento de metas del local. Destaco por mi amabilidad y mi honestidad.`,
      `Perfil de atención en tienda, con manejo de punto de venta, efectivo e inventario. Busco un puesto de ${role} donde aportar mi orientación al cliente y mi capacidad de trabajar en equipo bajo presión.`,
      `Persona amable y responsable, en búsqueda de un puesto de ${role}. Disposición para atención de público, manejo de caja y trabajo en turnos rotativos, incluidos fines de semana. Aprendizaje rápido.`,
    ],
  },
  {
    key: 'servicios',
    label: 'Servicios generales',
    matchers: [
      'aseo',
      'limpieza',
      'servicios generales',
      'mantenimiento',
      'guardia',
      'seguridad',
      'conserje',
      'auxiliar de servicios',
      'jardineria',
      'cocina',
    ],
    technical: [
      'Limpieza y sanitización',
      'Mantenimiento preventivo',
      'Manejo de productos de limpieza',
      'Normas de higiene y seguridad',
      'Control de accesos',
      'Rondas de vigilancia',
      'Manejo de herramientas básicas',
      'Reporte de incidencias',
    ],
    soft: [
      'Responsabilidad',
      'Puntualidad',
      'Autonomía',
      'Confiabilidad',
      'Atención al detalle',
      'Trabajo en equipo',
      'Disciplina',
    ],
    templates: (role) => [
      `${role} con experiencia en limpieza, mantenimiento y cumplimiento de normas de higiene y seguridad. Trabajo de forma autónoma, reporto incidencias a tiempo y mantengo los espacios en óptimas condiciones. Destaco por mi responsabilidad y mi puntualidad.`,
      `Perfil de servicios generales con práctica en mantenimiento preventivo y manejo de productos e implementos. Busco un puesto de ${role} donde aportar mi confiabilidad y mi disposición para turnos rotativos.`,
      `Persona confiable y trabajadora, en búsqueda de un puesto de ${role}. Disposición física, cumplimiento de horarios y buen trato con las personas. Disponibilidad inmediata.`,
    ],
  },
  {
    key: 'general',
    label: 'General',
    matchers: [],
    technical: TRANSVERSAL_TECHNICAL,
    soft: TRANSVERSAL_SOFT,
    templates: (role) => [
      `Persona responsable y comprometida, en búsqueda de un puesto de ${role}. Manejo de herramientas informáticas, atención al cliente y trabajo en equipo. Destaco por mi capacidad de aprender rápido, mi puntualidad y mi disposición para asumir nuevas tareas.`,
      `${role} con experiencia en atención de público y cumplimiento de objetivos. Acostumbrado a trabajar en equipo, seguir procedimientos y mantener la calidad del servicio. Disponibilidad inmediata y flexibilidad horaria.`,
      `Busco un puesto de ${role} donde aportar mi organización, mi comunicación efectiva y mi orientación a resultados. Manejo de Microsoft Office e ingreso de datos, con rápida adaptación a nuevos sistemas y procesos.`,
    ],
  },
]

/** Normaliza para comparar: minúsculas, sin tildes, sin signos. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const GENERAL_FAMILY = JOB_FAMILIES[JOB_FAMILIES.length - 1]!

/** Deduce la familia de puesto a partir del texto libre que escribió el usuario. */
export function detectFamily(targetRole: string): JobFamily {
  const role = normalize(targetRole)
  if (!role) return GENERAL_FAMILY
  for (const family of JOB_FAMILIES) {
    if (family.matchers.some((matcher) => role.includes(matcher))) return family
  }
  return GENERAL_FAMILY
}

/** Sugerencias para los chips: primero las de la familia, luego las transversales. */
export function suggestionsFor(targetRole: string): { technical: string[]; soft: string[] } {
  const family = detectFamily(targetRole)
  const merge = (specific: string[], shared: string[]) => {
    const seen = new Set(specific.map(normalize))
    return [...specific, ...shared.filter((item) => !seen.has(normalize(item)))]
  }
  return {
    technical: merge(family.technical, TRANSVERSAL_TECHNICAL),
    soft: merge(family.soft, TRANSVERSAL_SOFT),
  }
}

export function profileTemplatesFor(targetRole: string): string[] {
  const role = targetRole.trim() || 'el puesto'
  return detectFamily(targetRole).templates(role)
}

/**
 * Raíces de verbos de acción. Se compara contra la primera palabra del bullet,
 * así una sola raíz cubre "atendí", "atender" y "atendía". Los pretéritos
 * irregulares no comparten raíz con el infinitivo ("reponer" → "repuse"), por
 * eso van listados aparte más abajo.
 */
export const ACTION_VERB_ROOTS = [
  'atend',
  'asesor',
  'gestion',
  'resolv',
  'resolu',
  'coordin',
  'supervis',
  'lider',
  'dirig',
  'organiz',
  'administr',
  'control',
  'registr',
  'document',
  'elabor',
  'redact',
  'prepar',
  'ejecut',
  'realiz',
  'efectu',
  'logr',
  'alcanz',
  'super',
  'cumpl',
  'increment',
  'aument',
  'reduj',
  'reduc',
  'optimiz',
  'mejor',
  'implement',
  'desarroll',
  'cre',
  'dise',
  'capacit',
  'entren',
  'form',
  'apoy',
  'colabor',
  'particip',
  'vend',
  'comercializ',
  'promocion',
  'fideliz',
  'reten',
  'recuper',
  'contact',
  'derive',
  'deriv',
  'escal',
  'tramit',
  'process',
  'proces',
  'verific',
  'revis',
  'audit',
  'inspeccion',
  'clasific',
  'orden',
  'recib',
  'despach',
  'entreg',
  'distribuy',
  'distribu',
  'manej',
  'oper',
  'utiliz',
  'mantuv',
  'manten',
  'limpi',
  'instal',
  'repar',
  'resguard',
  'vigil',
  'inform',
  'report',
  'analiz',
  'planific',
  'program',
  'agend',
  'factur',
  'cobr',
  'concili',
  'cuadr',
  'inventari',
  'repon',
  'exhib',
  'sirv',
  'serv',

  // Pretéritos irregulares que no arrancan como su infinitivo.
  'repus',
  'pus',
  'hic',
  'dij',
  'traj',
  'tuv',
  'estuv',
  'anduv',
  'obtuv',
  'sostuv',
  'conduj',
  'produj',
  'introduj',
  'consegu',
  'sup',
  'quis',
]

/**
 * Variantes ortográficas de una raíz en primera persona del pretérito:
 * los verbos en -zar cambian a -cé (realizar → realicé) y los de -car a -qué
 * (clasificar → clasifiqué). Sin esto, el auditor marcaría como "sin verbo"
 * media conjugación del español.
 */
function rootVariants(root: string): string[] {
  if (root.endsWith('z')) return [root, `${root.slice(0, -1)}c`]
  if (root.endsWith('c')) return [root, `${root.slice(0, -1)}qu`]
  return [root]
}

const VERB_PREFIXES = ACTION_VERB_ROOTS.flatMap(rootVariants)

/** True si el bullet arranca con un verbo de acción reconocible. */
export function startsWithActionVerb(bullet: string): boolean {
  const first = normalize(bullet).split(' ')[0]
  if (!first || first.length < 3) return false
  return VERB_PREFIXES.some((prefix) => first.startsWith(prefix))
}
