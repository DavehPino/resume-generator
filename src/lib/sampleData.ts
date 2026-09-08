import type { CvData } from '@/types/cv'

/**
 * CV de ejemplo para probar el flujo y el salto de página sin teclear nada.
 * Perfil argentino, que es el mercado al que apunta la aplicación.
 */
export function buildSampleCv(): CvData {
  const now = new Date().toISOString()
  return {
    palette: 'terracota',
    personal: {
      fullName: 'Camila Ayelén Ferreyra',
      targetRole: 'Ejecutiva de atención al cliente',
      email: 'camila.ferreyra.ok@gmail.com',
      phone: '+54 9 11 4123 5678',
      city: 'Ciudad Autónoma de Buenos Aires',
      country: 'Argentina',
      linkedin: 'linkedin.com/in/camilaferreyra',
      willingToRelocate: false,
    },
    profile: {
      text: 'Ejecutiva de atención al cliente con 4 años de experiencia en call center, atención telefónica y gestión de reclamos. Manejo de CRM (Salesforce y Zendesk), registro de casos y escalamiento de incidencias cumpliendo los indicadores de calidad y tiempo de respuesta. Destaco por mi escucha activa, mi tolerancia a la presión y mi orientación al cliente. Disponibilidad para turnos rotativos.',
    },
    experience: [
      {
        id: 'sample-exp-1',
        role: 'Ejecutiva de atención al cliente',
        company: 'Telecom Argentina',
        city: 'Ciudad Autónoma de Buenos Aires',
        country: 'Argentina',
        startDate: '03/2022',
        isCurrent: true,
        bullets: [
          'Atendí un promedio de 80 llamadas diarias resolviendo consultas, reclamos y solicitudes de servicio.',
          'Gestioné casos en Salesforce y escalé incidencias técnicas al área correspondiente con seguimiento hasta el cierre.',
          'Superé de forma sostenida la meta de satisfacción del cliente (95% frente al 90% exigido).',
          'Capacité a 6 agentes nuevos en el uso del CRM y en los protocolos de atención.',
        ],
      },
      {
        id: 'sample-exp-2',
        role: 'Asistente de ventas',
        company: 'Coto CICSA',
        city: 'Avellaneda',
        country: 'Argentina',
        startDate: '01/2021',
        endDate: '02/2022',
        isCurrent: false,
        bullets: [
          'Asesoré a clientes en salón y cerré ventas cumpliendo la meta mensual de la sucursal.',
          'Manejé caja y realicé el cierre diario sin diferencias durante 14 meses.',
          'Repuse y ordené mercadería manteniendo la exhibición según los estándares del local.',
        ],
      },
    ],
    education: [
      {
        id: 'sample-edu-1',
        level: 'Terciario / Técnico',
        title: 'Tecnicatura Superior en Administración de Empresas',
        institution: 'Instituto Superior de Formación Técnica N.º 12',
        startDate: '03/2018',
        endDate: '12/2020',
        isInProgress: false,
      },
      {
        id: 'sample-edu-2',
        level: 'Secundario',
        title: 'Secundario completo con orientación en Economía y Administración',
        institution: 'Escuela de Educación Secundaria N.º 5',
        endDate: '12/2017',
        isInProgress: false,
      },
    ],
    skills: {
      technical: [
        'Atención al cliente',
        'Atención telefónica',
        'Manejo de CRM',
        'Salesforce',
        'Zendesk',
        'Gestión de reclamos',
        'Escalamiento de casos',
        'Cumplimiento de KPI',
        'Excel',
      ],
      soft: [
        'Comunicación efectiva',
        'Escucha activa',
        'Resolución de problemas',
        'Tolerancia a la presión',
        'Trabajo en equipo',
        'Orientación al cliente',
      ],
    },
    languages: [
      { id: 'sample-lang-1', name: 'Español', level: 'Nativo' },
      { id: 'sample-lang-2', name: 'Inglés', level: 'Intermedio', certification: 'B1' },
    ],
    certifications: [
      {
        id: 'sample-cert-1',
        name: 'Atención al cliente y manejo de conflictos',
        issuer: 'Ministerio de Trabajo, Empleo y Seguridad Social',
        date: '08/2022',
      },
    ],
    availability: {
      modality: ['Presencial', 'Remoto'],
      shifts: ['Diurno', 'Turnos rotativos'],
      startAvailability: 'Inmediata',
      hasOwnEquipment: true,
      hasStableInternet: true,
      hasDrivingLicense: false,
    },
    referencesOnRequest: true,
    meta: { createdAt: now, updatedAt: now, version: 1 },
  }
}
