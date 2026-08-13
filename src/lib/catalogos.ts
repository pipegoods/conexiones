/**
 * Vocabulario compartido entre los dos lados de la red.
 *
 * Regla de oro: una necesidad y una capacidad SOLO pueden cruzarse si hablan el
 * mismo idioma. Por eso ambos formularios usan la misma lista de `tipoRecurso`,
 * cambiando únicamente la etiqueta que ve el usuario ("Transporte" cuando pides,
 * "Mi vehículo" cuando ofreces).
 */

export const TIPOS_RECURSO = [
  'alimentos',
  'agua',
  'medicamentos',
  'salud',
  'apoyo_psicologico',
  'alojamiento',
  'ropa_enseres',
  'transporte',
  'herramientas',
  'trabajo_fisico',
  'profesion',
  'conocimientos',
  'informacion',
  'espacio',
  'contactos',
  'tiempo',
  'dinero',
  'otro',
] as const;

export type TipoRecurso = (typeof TIPOS_RECURSO)[number];

type DefinicionRecurso = {
  /** Etiqueta en el formulario NECESITO AYUDA */
  necesito: string;
  /** Etiqueta en el formulario QUIERO AYUDAR */
  ofrezco: string;
  /** Nombre neutro para el panel interno */
  panel: string;
  emoji: string;
};

export const RECURSOS: Record<TipoRecurso, DefinicionRecurso> = {
  alimentos: { necesito: 'Alimentos', ofrezco: 'Alimentos', panel: 'Alimentos', emoji: '🍲' },
  agua: { necesito: 'Agua potable', ofrezco: 'Agua potable', panel: 'Agua', emoji: '💧' },
  medicamentos: { necesito: 'Medicamentos', ofrezco: 'Medicamentos', panel: 'Medicamentos', emoji: '💊' },
  salud: { necesito: 'Atención en salud', ofrezco: 'Soy personal de salud', panel: 'Salud', emoji: '🩺' },
  apoyo_psicologico: {
    necesito: 'Apoyo psicológico',
    ofrezco: 'Apoyo psicológico',
    panel: 'Apoyo psicológico',
    emoji: '🫂',
  },
  alojamiento: { necesito: 'Alojamiento', ofrezco: 'Puedo alojar personas', panel: 'Alojamiento', emoji: '🏠' },
  ropa_enseres: { necesito: 'Ropa y enseres', ofrezco: 'Ropa y enseres', panel: 'Ropa y enseres', emoji: '👕' },
  transporte: { necesito: 'Transporte', ofrezco: 'Mi vehículo / transporte', panel: 'Transporte', emoji: '🚚' },
  herramientas: { necesito: 'Herramientas', ofrezco: 'Herramientas', panel: 'Herramientas', emoji: '🛠️' },
  trabajo_fisico: { necesito: 'Mano de obra', ofrezco: 'Trabajo físico', panel: 'Trabajo físico', emoji: '💪' },
  profesion: { necesito: 'Un profesional', ofrezco: 'Mi profesión', panel: 'Profesión', emoji: '🎓' },
  conocimientos: { necesito: 'Asesoría / conocimientos', ofrezco: 'Conocimientos', panel: 'Conocimientos', emoji: '📚' },
  informacion: { necesito: 'Información y orientación', ofrezco: 'Información y orientación', panel: 'Información', emoji: 'ℹ️' },
  espacio: { necesito: 'Espacio / bodega', ofrezco: 'Espacio / bodega', panel: 'Espacio', emoji: '📦' },
  contactos: { necesito: 'Contactos', ofrezco: 'Mis contactos', panel: 'Contactos', emoji: '🔗' },
  tiempo: { necesito: 'Acompañamiento', ofrezco: 'Mi tiempo', panel: 'Tiempo', emoji: '⏰' },
  dinero: { necesito: 'Apoyo económico', ofrezco: 'Dinero', panel: 'Dinero', emoji: '💵' },
  otro: { necesito: 'Otro', ofrezco: 'Otro', panel: 'Otro', emoji: '✨' },
};

export const URGENCIAS = ['inmediata', 'hoy', 'esta_semana', 'sin_prisa'] as const;
export type Urgencia = (typeof URGENCIAS)[number];

export const URGENCIA_LABEL: Record<Urgencia, string> = {
  inmediata: 'Es una emergencia, ahora mismo',
  hoy: 'Hoy',
  esta_semana: 'Esta semana',
  sin_prisa: 'Puede esperar',
};

/** Peso para ordenar la bandeja del panel: más alto = primero. */
export const DISPONIBILIDADES = ['ahora', 'hoy', 'esta_semana', 'fines_de_semana', 'flexible'] as const;
export type Disponibilidad = (typeof DISPONIBILIDADES)[number];

export const DISPONIBILIDAD_LABEL: Record<Disponibilidad, string> = {
  ahora: 'Ahora mismo',
  hoy: 'Hoy',
  esta_semana: 'Esta semana',
  fines_de_semana: 'Fines de semana',
  flexible: 'Flexible / coordinable',
};

/**
 * Cruce de tiempos: qué disponibilidad de un voluntario alcanza a cubrir
 * qué urgencia de una solicitud. Se usa en el score de matching.
 */
export const DISPONIBILIDAD_CUBRE: Record<Disponibilidad, Urgencia[]> = {
  ahora: ['inmediata', 'hoy', 'esta_semana', 'sin_prisa'],
  hoy: ['hoy', 'esta_semana', 'sin_prisa'],
  esta_semana: ['esta_semana', 'sin_prisa'],
  fines_de_semana: ['esta_semana', 'sin_prisa'],
  flexible: ['hoy', 'esta_semana', 'sin_prisa'],
};

export const RADIOS_KM = [5, 10, 25, 50, 999] as const;
export type RadioKm = (typeof RADIOS_KM)[number];

export const RADIO_LABEL: Record<number, string> = {
  5: 'Hasta 5 km',
  10: 'Hasta 10 km',
  25: 'Hasta 25 km',
  50: 'Hasta 50 km',
  999: 'Cualquier lugar del municipio o más allá',
};

/** Estados de una solicitud. El número es el "nivel" de verificación del PRD. */
export const ESTADOS_SOLICITUD = [
  'recibida',
  'contactada',
  'verificada',
  'conectada',
  'resuelta',
  'descartada',
] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export const ESTADO_SOLICITUD_META: Record<
  EstadoSolicitud,
  { nivel: number; label: string; descripcion: string; emoji: string; clase: string }
> = {
  recibida: {
    nivel: 0,
    label: 'Solicitud recibida',
    descripcion: 'Acaba de llegar. Todavía no sabemos si es real.',
    emoji: '🟡',
    clase: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  contactada: {
    nivel: 1,
    label: 'Contacto realizado',
    descripcion: 'Alguien de Conexiones logró comunicarse.',
    emoji: '🔵',
    clase: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  verificada: {
    nivel: 2,
    label: 'Necesidad verificada',
    descripcion: 'Confirmamos que la persona, la necesidad y el lugar son reales.',
    emoji: '🟢',
    clase: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  conectada: {
    nivel: 3,
    label: 'Ayuda conectada',
    descripcion: 'Encontramos a alguien que puede ayudar y ya están en contacto.',
    emoji: '🟣',
    clase: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
  resuelta: {
    nivel: 4,
    label: 'Necesidad resuelta',
    descripcion: 'La persona confirmó que recibió la ayuda.',
    emoji: '❤️',
    clase: 'bg-rose-50 text-rose-800 ring-rose-200',
  },
  descartada: {
    nivel: -1,
    label: 'Descartada',
    descripcion: 'No se pudo verificar, está duplicada o no aplica.',
    emoji: '⚫',
    clase: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
  },
};

/** Transiciones permitidas. Evita saltos raros y mantiene la trazabilidad limpia. */
export const TRANSICIONES_SOLICITUD: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  recibida: ['contactada', 'descartada'],
  contactada: ['verificada', 'descartada', 'recibida'],
  verificada: ['conectada', 'descartada', 'contactada'],
  conectada: ['resuelta', 'verificada', 'descartada'],
  resuelta: ['conectada'],
  descartada: ['recibida'],
};

export const ESTADOS_OFERTA = ['nueva', 'verificada', 'pausada', 'archivada'] as const;
export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];

export const ESTADO_OFERTA_META: Record<EstadoOferta, { label: string; emoji: string; clase: string }> = {
  nueva: { label: 'Sin verificar', emoji: '🟡', clase: 'bg-amber-50 text-amber-800 ring-amber-200' },
  verificada: { label: 'Verificada', emoji: '🟢', clase: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  pausada: { label: 'Pausada', emoji: '⏸️', clase: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
  archivada: { label: 'Archivada', emoji: '⚫', clase: 'bg-neutral-100 text-neutral-500 ring-neutral-300' },
};

export const TRANSICIONES_OFERTA: Record<EstadoOferta, EstadoOferta[]> = {
  nueva: ['verificada', 'archivada'],
  verificada: ['pausada', 'archivada'],
  pausada: ['verificada', 'archivada'],
  archivada: ['nueva'],
};

export const ESTADOS_CONEXION = ['propuesta', 'aceptada', 'rechazada', 'confirmada', 'cancelada'] as const;
export type EstadoConexion = (typeof ESTADOS_CONEXION)[number];

export const ESTADO_CONEXION_META: Record<EstadoConexion, { label: string; clase: string }> = {
  propuesta: { label: 'Propuesta', clase: 'bg-amber-50 text-amber-800 ring-amber-200' },
  aceptada: { label: 'Aceptada por el voluntario', clase: 'bg-sky-50 text-sky-800 ring-sky-200' },
  rechazada: { label: 'Rechazada', clase: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
  confirmada: { label: 'Ayuda confirmada', clase: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  cancelada: { label: 'Cancelada', clase: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
};

export const DEPARTAMENTOS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Archipiélago de San Andrés, Providencia y Santa Catalina',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
] as const;

export const ROLES = ['admin', 'operador'] as const;
export type Rol = (typeof ROLES)[number];
