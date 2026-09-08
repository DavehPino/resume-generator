import type { CSSProperties, ReactNode } from 'react'

import { byMostRecent, formatRange } from '@/lib/formatDate'
import { paletteOf } from '@/lib/palettes'
import type { CvData } from '@/types/cv'

/**
 * EL DOCUMENTO ATS.
 *
 * Este componente NO usa utilidades de Tailwind ni la paleta de la interfaz:
 * se dibuja con las clases de `styles/print.css`, que es donde vive también la
 * explicación del acento de color y por qué va solo en texto y bordes.
 *
 * Reglas que hay que mantener al tocar este archivo (PROMPT-AGENTE-CV.md §8):
 *   - Una sola columna de contenido. Sin <table>, sin flotados, sin absolutos.
 *   - Sin imágenes, iconos, emojis ni barras de nivel.
 *   - Títulos de sección literales y en mayúsculas: los ATS los buscan así.
 *   - El orden del DOM es el orden de lectura del PDF.
 */

const SEPARATOR = ' | '
/** Espacio duro + barra: el separador se queda pegado al dato que lo precede. */
const SEPARATOR_NBSP = ' | '

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

/** Título a la izquierda y fechas a la derecha, en una sola línea. */
function EntryHead({ title, dates }: { title: ReactNode; dates?: string }) {
  return (
    <div className="cv-entry-head">
      <h3>{title}</h3>
      {dates && <span className="cv-dates">{dates}</span>}
    </div>
  )
}

export function CvDocument({ data }: { data: CvData }) {
  const { personal, profile, skills, availability } = data
  const palette = paletteOf(data.palette)

  const experience = [...data.experience].sort(byMostRecent)
  const education = [...data.education].sort(byMostRecent)

  const contactParts = [
    personal.email,
    personal.phone,
    [personal.city, personal.country].filter(Boolean).join(', '),
    personal.linkedin,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  const availabilityLines: [string, string][] = [
    availability.startAvailability ? ['Incorporación', availability.startAvailability] : null,
    availability.modality?.length ? ['Modalidad', availability.modality.join(', ')] : null,
    availability.shifts?.length ? ['Jornada', availability.shifts.join(', ')] : null,
    availability.hasOwnEquipment ? ['Equipo propio', 'Sí, para trabajo remoto'] : null,
    availability.hasStableInternet ? ['Conexión a internet', 'Estable'] : null,
    availability.hasDrivingLicense ? ['Licencia de conducir', 'Vigente'] : null,
    personal.willingToRelocate ? ['Movilidad', 'Disponible para cambiar de ciudad'] : null,
  ].filter((line): line is [string, string] => line !== null)

  return (
    <article
      id="cv-document"
      className="cv-doc"
      lang="es"
      // La paleta se inyecta como variables CSS sobre el nodo raíz del
      // documento. Al imprimir se clona el nodo, así que los estilos en línea
      // viajan con él y el PDF sale del mismo color que el preview.
      style={
        {
          '--cv-accent': palette.accent,
          '--cv-rule': palette.rule,
        } as CSSProperties
      }
    >
      {/* Identidad y contacto en el cuerpo del documento, en texto plano.
          Nunca en un encabezado de página: los ATS no leen headers. */}
      <div className="cv-head">
        <h1 className="cv-name">{personal.fullName || 'Nombre y apellido'}</h1>
        {personal.targetRole && <p className="cv-role">{personal.targetRole}</p>}
        {contactParts.length > 0 && (
          <p className="cv-contact">
            {/* El espacio duro pega el separador al dato anterior: así una
                línea nunca empieza por «|». El corte cae en el espacio
                normal que va después. */}
            {contactParts.map((part, index) => (
              <span key={part}>
                {part}
                {index < contactParts.length - 1 ? SEPARATOR_NBSP : ''}
              </span>
            ))}
          </p>
        )}
      </div>

      {profile.text.trim() && (
        <Section title="PERFIL PROFESIONAL">
          <p>{profile.text.trim()}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="EXPERIENCIA LABORAL">
          {experience.map((item) => {
            const place = [item.city, item.country].filter(Boolean).join(', ')
            const bullets = item.bullets.filter((bullet) => bullet.trim())
            return (
              <div key={item.id} className="cv-entry">
                <EntryHead
                  dates={formatRange(item.startDate, item.endDate, item.isCurrent)}
                  title={
                    <>
                      {item.role}
                      {item.company && (
                        <span className="cv-org">
                          {SEPARATOR}
                          {item.company}
                        </span>
                      )}
                    </>
                  }
                />
                {place && <p className="cv-meta">{place}</p>}
                {bullets.length > 0 && (
                  <ul>
                    {bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="EDUCACIÓN">
          {education.map((item) => (
            <div key={item.id} className="cv-entry">
              <EntryHead
                title={item.title}
                dates={
                  item.isInProgress
                    ? [item.startDate, 'En curso'].filter(Boolean).join(' – ')
                    : formatRange(item.startDate, item.endDate, false)
                }
              />
              {item.institution && <p className="cv-meta">{item.institution}</p>}
            </div>
          ))}
        </Section>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <Section title="HABILIDADES">
          {skills.technical.length > 0 && (
            <p className="cv-line">
              <span className="cv-label">Técnicas:</span> {skills.technical.join(', ')}
            </p>
          )}
          {skills.soft.length > 0 && (
            <p className="cv-line">
              <span className="cv-label">Personales:</span> {skills.soft.join(', ')}
            </p>
          )}
        </Section>
      )}

      {data.languages.length > 0 && (
        <Section title="IDIOMAS">
          {data.languages.map((item) => (
            <p key={item.id} className="cv-line">
              <span className="cv-label">{item.name}:</span> {item.level}
              {item.certification ? ` (${item.certification})` : ''}
            </p>
          ))}
        </Section>
      )}

      {data.certifications.length > 0 && (
        <Section title="CERTIFICACIONES">
          {data.certifications.map((item) => (
            <div key={item.id} className="cv-entry">
              <EntryHead title={item.name} dates={item.date} />
              {item.issuer && <p className="cv-meta">{item.issuer}</p>}
            </div>
          ))}
        </Section>
      )}

      {availabilityLines.length > 0 && (
        <Section title="DISPONIBILIDAD">
          {availabilityLines.map(([label, value]) => (
            <p key={label} className="cv-line">
              <span className="cv-label">{label}:</span> {value}
            </p>
          ))}
        </Section>
      )}

      {data.referencesOnRequest && (
        <Section title="REFERENCIAS">
          <p className="cv-line">Disponibles a solicitud.</p>
        </Section>
      )}
    </article>
  )
}
