/**
 * Vocabulary shared by both sides of the network.
 *
 * Golden rule: a request and an offer can only match when they use the same
 * vocabulary. Both forms use the same `resourceType` list with distinct
 * user-visible labels.
 */

export const RESOURCE_TYPES = [
  'food',
  'water',
  'medicine',
  'health',
  'psychological_support',
  'accommodation',
  'clothing_supplies',
  'transport',
  'tools',
  'manual_labor',
  'profession',
  'knowledge',
  'information',
  'space',
  'contacts',
  'time',
  'money',
  'other',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

type ResourceDefinition = {
  /** Label in the help-request form. */
  seeking: string;
  /** Label in the offer form. */
  offering: string;
  /** Neutral name for the internal panel. */
  internal: string;
  emoji: string;
};

export const RESOURCES: Record<ResourceType, ResourceDefinition> = {
  food: { seeking: 'Alimentos', offering: 'Alimentos', internal: 'Alimentos', emoji: '🍲' },
  water: { seeking: 'Agua potable', offering: 'Agua potable', internal: 'Agua', emoji: '💧' },
  medicine: { seeking: 'Medicamentos', offering: 'Medicamentos', internal: 'Medicamentos', emoji: '💊' },
  health: { seeking: 'Atención en salud', offering: 'Soy personal de salud', internal: 'Salud', emoji: '🩺' },
  psychological_support: {
    seeking: 'Apoyo psicológico',
    offering: 'Apoyo psicológico',
    internal: 'Apoyo psicológico',
    emoji: '🫂',
  },
  accommodation: { seeking: 'Alojamiento', offering: 'Puedo alojar personas', internal: 'Alojamiento', emoji: '🏠' },
  clothing_supplies: { seeking: 'Ropa y enseres', offering: 'Ropa y enseres', internal: 'Ropa y enseres', emoji: '👕' },
  transport: { seeking: 'Transporte', offering: 'Mi vehículo / transporte', internal: 'Transporte', emoji: '🚚' },
  tools: { seeking: 'Herramientas', offering: 'Herramientas', internal: 'Herramientas', emoji: '🛠️' },
  manual_labor: { seeking: 'Mano de obra', offering: 'Trabajo físico', internal: 'Trabajo físico', emoji: '💪' },
  profession: { seeking: 'Un profesional', offering: 'Mi profesión', internal: 'Profesión', emoji: '🎓' },
  knowledge: { seeking: 'Asesoría / conocimientos', offering: 'Conocimientos', internal: 'Conocimientos', emoji: '📚' },
  information: { seeking: 'Información y orientación', offering: 'Información y orientación', internal: 'Información', emoji: 'ℹ️' },
  space: { seeking: 'Espacio / bodega', offering: 'Espacio / bodega', internal: 'Espacio', emoji: '📦' },
  contacts: { seeking: 'Contactos', offering: 'Mis contactos', internal: 'Contactos', emoji: '🔗' },
  time: { seeking: 'Acompañamiento', offering: 'Mi tiempo', internal: 'Tiempo', emoji: '⏰' },
  money: { seeking: 'Apoyo económico', offering: 'Dinero', internal: 'Dinero', emoji: '💵' },
  other: { seeking: 'Otro', offering: 'Otro', internal: 'Otro', emoji: '✨' },
};

export const URGENCIES = ['immediate', 'today', 'this_week', 'not_urgent'] as const;
export type Urgency = (typeof URGENCIES)[number];

export const URGENCY_LABELS: Record<Urgency, string> = {
  immediate: 'Es una emergencia, ahora mismo',
  today: 'Hoy',
  this_week: 'Esta semana',
  not_urgent: 'Puede esperar',
};

/** Queue ordering weight: higher values come first. */
export const AVAILABILITIES = ['now', 'today', 'this_week', 'weekends', 'flexible'] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  now: 'Ahora mismo',
  today: 'Hoy',
  this_week: 'Esta semana',
  weekends: 'Fines de semana',
  flexible: 'Flexible / coordinable',
};

/**
 * Maps which volunteer availability covers each request urgency for matching.
 */
export const AVAILABILITY_COVERS: Record<Availability, Urgency[]> = {
  now: ['immediate', 'today', 'this_week', 'not_urgent'],
  today: ['today', 'this_week', 'not_urgent'],
  this_week: ['this_week', 'not_urgent'],
  weekends: ['this_week', 'not_urgent'],
  flexible: ['today', 'this_week', 'not_urgent'],
};

export const EVENT_ACTION_LABELS: Record<string, string> = {
  created: 'Solicitud creada',
  registered: 'Voluntario registrado',
  status_changed: 'Cambio de estado',
  internal_note: 'Nota interna',
  connection_proposed: 'Conexión propuesta',
  proposed: 'Propuesta de conexión',
  whatsapp_opened: 'Chat de WhatsApp abierto',
};

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 999] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];

export const RADIUS_LABELS: Record<number, string> = {
  5: 'Hasta 5 km',
  10: 'Hasta 10 km',
  25: 'Hasta 25 km',
  50: 'Hasta 50 km',
  999: 'Cualquier lugar del municipio o más allá',
};

/** Request statuses. The number is the PRD verification level. */
export const REQUEST_STATUSES = ['received', 'contacted', 'verified', 'connected', 'resolved', 'discarded'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_META: Record<
  RequestStatus,
  { level: number; label: string; description: string; emoji: string; className: string }
> = {
  received: {
    level: 0,
    label: 'Solicitud recibida',
    description: 'Acaba de llegar. Todavía no sabemos si es real.',
    emoji: '🟡',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  contacted: {
    level: 1,
    label: 'Contacto realizado',
    description: 'Alguien de Conexiones logró comunicarse.',
    emoji: '🔵',
    className: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  verified: {
    level: 2,
    label: 'Necesidad verificada',
    description: 'Confirmamos que la persona, la necesidad y el lugar son reales.',
    emoji: '🟢',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  connected: {
    level: 3,
    label: 'Ayuda conectada',
    description: 'Encontramos a alguien que puede ayudar y ya están en contacto.',
    emoji: '🟣',
    className: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
  resolved: {
    level: 4,
    label: 'Necesidad resuelta',
    description: 'La persona confirmó que recibió la ayuda.',
    emoji: '❤️',
    className: 'bg-rose-50 text-rose-800 ring-rose-200',
  },
  discarded: {
    level: -1,
    label: 'Descartada',
    description: 'No se pudo verificar, está duplicada o no aplica.',
    emoji: '⚫',
    className: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
  },
};

/** Allowed transitions prevent invalid skips and preserve clean traceability. */
export const REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  received: ['contacted', 'discarded'],
  contacted: ['verified', 'discarded', 'received'],
  verified: ['connected', 'discarded', 'contacted'],
  connected: ['resolved', 'verified', 'discarded'],
  resolved: ['connected'],
  discarded: ['received'],
};

export const OFFER_STATUSES = ['new', 'verified', 'paused', 'archived'] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const OFFER_STATUS_META: Record<OfferStatus, { label: string; emoji: string; className: string }> = {
  new: { label: 'Sin verificar', emoji: '🟡', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  verified: { label: 'Verificada', emoji: '🟢', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  paused: { label: 'Pausada', emoji: '⏸️', className: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
  archived: { label: 'Archivada', emoji: '⚫', className: 'bg-neutral-100 text-neutral-500 ring-neutral-300' },
};

export const OFFER_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  new: ['verified', 'archived'],
  verified: ['paused', 'archived'],
  paused: ['verified', 'archived'],
  archived: ['new'],
};

export const CONNECTION_STATUSES = ['proposed', 'accepted', 'rejected', 'confirmed', 'cancelled'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const CONNECTION_STATUS_META: Record<ConnectionStatus, { label: string; className: string }> = {
  proposed: { label: 'Propuesta', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  accepted: { label: 'Aceptada por el voluntario', className: 'bg-sky-50 text-sky-800 ring-sky-200' },
  rejected: { label: 'Rechazada', className: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
  confirmed: { label: 'Ayuda confirmada', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  cancelled: { label: 'Cancelada', className: 'bg-neutral-100 text-neutral-600 ring-neutral-300' },
};

export const DEPARTMENTS = [
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

export const ROLES = ['admin', 'operator'] as const;
export type Role = (typeof ROLES)[number];

/** Spanish label for each role. Never render the raw enum value. */
export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  operator: 'Operador',
};
