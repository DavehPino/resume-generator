/**
 * Listas de sugerencias para los campos que tienen respuestas conocidas:
 * país, ciudad e idioma.
 *
 * Se ofrecen como sugerencias (no como lista cerrada) porque nadie puede
 * quedarse sin poder escribir su ciudad. Elegir de la lista además normaliza
 * la ortografía, que es justo lo que un ATS compara palabra por palabra.
 *
 * El foco es Argentina; el resto de países aparece para quien postule desde
 * fuera o a un puesto remoto en otro país.
 */

export const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Canadá',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'Italia',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Portugal',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
] as const

const ARGENTINA_CITIES = [
  'Ciudad Autónoma de Buenos Aires',
  'Avellaneda',
  'Bahía Blanca',
  'Berazategui',
  'Comodoro Rivadavia',
  'Concordia',
  'Corrientes',
  'Córdoba',
  'Formosa',
  'General Roca',
  'Godoy Cruz',
  'La Plata',
  'La Rioja',
  'Lanús',
  'Lomas de Zamora',
  'Mar del Plata',
  'Mendoza',
  'Morón',
  'Neuquén',
  'Paraná',
  'Posadas',
  'Quilmes',
  'Resistencia',
  'Río Cuarto',
  'Rosario',
  'Salta',
  'San Carlos de Bariloche',
  'San Fernando del Valle de Catamarca',
  'San Isidro',
  'San Juan',
  'San Luis',
  'San Miguel de Tucumán',
  'San Nicolás de los Arroyos',
  'San Salvador de Jujuy',
  'Santa Fe',
  'Santa Rosa',
  'Santiago del Estero',
  'Tandil',
  'Tigre',
  'Ushuaia',
  'Vicente López',
  'Villa María',
] as const

/**
 * Ciudades por país. Solo se cubren los países desde los que más se postula a
 * estos puestos; para el resto el campo queda como texto libre sin sugerencias.
 */
const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  Argentina: ARGENTINA_CITIES,
  Uruguay: ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Maldonado'],
  Chile: ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta', 'Viña del Mar', 'Temuco'],
  Paraguay: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Encarnación'],
  Bolivia: ['Santa Cruz de la Sierra', 'La Paz', 'Cochabamba', 'Sucre', 'El Alto'],
  Perú: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco'],
  Colombia: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
  México: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Querétaro'],
  España: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga'],
  Venezuela: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay'],
  Ecuador: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala'],
  Brasil: ['São Paulo', 'Río de Janeiro', 'Brasilia', 'Belo Horizonte', 'Porto Alegre'],
}

/** Sugerencias de ciudad para el país escrito; vacío si no hay lista. */
export function citiesFor(country: string): readonly string[] {
  return CITIES_BY_COUNTRY[country.trim()] ?? []
}

export const LANGUAGES = [
  'Español',
  'Inglés',
  'Portugués',
  'Italiano',
  'Francés',
  'Alemán',
  'Chino mandarín',
  'Japonés',
  'Coreano',
  'Ruso',
  'Árabe',
  'Hebreo',
  'Catalán',
  'Neerlandés',
  'Guaraní',
  'Quechua',
  'Lengua de señas argentina',
] as const
