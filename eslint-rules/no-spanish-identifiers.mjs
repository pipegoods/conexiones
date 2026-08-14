/**
 * ESLint rule: code identifiers use English.
 *
 * User-visible copy and public routes remain in Spanish. Therefore the rule
 * examines identifiers only, never string literals or file paths. For example,
 * `<label>Personas afectadas</label>` is correct, while naming a variable
 * `personasAfectadas` is not.
 *
 * Only declarations are reported rather than every use. One badly named symbol
 * produces one useful error at the location where it can be corrected.
 */

/** Migrated domain words used as the initial renaming glossary. */
const SPANISH_WORDS = new Set([
  // domain
  'solicitud', 'solicitudes', 'oferta', 'ofertas', 'conexion', 'conexiones',
  'evento', 'eventos', 'usuario', 'usuarios', 'voluntario', 'voluntarios',
  'damnificado', 'damnificados', 'ayuda', 'ayudar', 'necesito', 'quiero',
  // people and contact
  'nombre', 'nombres', 'telefono', 'correo', 'contrasena', 'clave',
  'persona', 'personas', 'afectada', 'afectadas', 'menores', 'adultos',
  'mayores', 'organizacion',
  // location
  'departamento', 'municipio', 'zona', 'direccion', 'referencia', 'radio',
  // content
  'descripcion', 'nota', 'notas', 'internas', 'razones', 'motivo', 'descarte',
  'disponibilidad', 'urgencia', 'recurso', 'recursos', 'cantidad', 'numero',
  // status and time
  'estado', 'anterior', 'nuevo', 'creado', 'actualizado', 'contactado',
  'verificado', 'conectado', 'resuelto', 'confirmado', 'fecha', 'hora',
  // actions
  'accion', 'acciones', 'crear', 'buscar', 'listar', 'actualizar', 'borrar',
  'guardar', 'contar', 'puntuar', 'verificar', 'conectar', 'registrar',
  'entrar', 'salir', 'enviar', 'requerir', 'sesion', 'acepta', 'aceptar',
  'tiene', 'obtener', 'traer', 'cargar',
  // code structure
  'consulta', 'consultas', 'catalogo', 'catalogos', 'validacion',
  'validaciones', 'cifras', 'pieza', 'piezas', 'campo', 'campos',
  'formulario', 'boton', 'encabezado', 'pagina', 'cascaron', 'historia',
  'bitacora', 'sugerencia', 'sugerencias', 'contacto', 'insignia', 'clases',
  'burbujas', 'pasos', 'flujo', 'preguntas', 'frecuentes', 'gracias',
  'terminos', 'privacidad', 'entidad', 'datos', 'resultado', 'filas',
  'listado', 'detalle', 'panel',
  // remaining missed identifiers and Spanish connectors
  'tipo', 'tope', 'candidato', 'candidatos', 'patron', 'limite', 'valor', 'valores',
  'horas', 'lejos', 'cerca', 'fuera', 'remoto', 'libre', 'saturado', 'viejo',
  'normalizar', 'lugar', 'distancia', 'puntuar', 'sugerencias',
  // connectors that reveal a Spanish phrase
  'para', 'otra', 'otro', 'cuanto', 'hace', 'del', 'los', 'las', 'por',
]);

/**
 * Morphology that appears in Spanish in practice. It catches words missing
 * from the glossary without requiring a complete dictionary.
 */
const SUFIJOS_ES = [/cion$/, /ciones$/, /dad$/, /dades$/, /miento$/, /mientos$/, /anza$/, /aje$/];

/** Orthography that does not occur in English. */
const SPANISH_ORTHOGRAPHY = /[ñáéíóúü¿¡]/i;

/** Required by the framework or ecosystem, so they stay as-is. */
const ALLOWED = new Set(['params', 'searchParams', 'metadata', 'props', 'ref', 'key']);

/** Splits camelCase, PascalCase, snake_case, and CONSTANT_CASE identifiers into words. */
function splitWords(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-$]+/)
    .filter(Boolean)
    .map((palabra) => palabra.toLowerCase());
}

function spanishWord(name, extras) {
  if (ALLOWED.has(name)) return null;
  if (SPANISH_ORTHOGRAPHY.test(name)) return name;

  for (const word of splitWords(name)) {
    if (word.length < 3) continue;
    if (SPANISH_WORDS.has(word) || extras.has(word)) return word;
    if (SUFIJOS_ES.some((suffix) => suffix.test(word))) return word;
  }
  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export const noSpanishIdentifiers = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Code identifiers use English; user-facing copy and public routes remain in Spanish.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          extraWords: { type: 'array', items: { type: 'string' } },
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      spanish:
        'Identifier "{{nombre}}" is Spanish (via "{{palabra}}"). Code identifiers use English; user-facing copy remains Spanish.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const extras = new Set((options.extraWords ?? []).map((word) => word.toLowerCase()));
    const allowed = new Set(options.allow ?? []);

    function check(node) {
      if (!node || node.type !== 'Identifier') return;
      if (allowed.has(node.name)) return;

      const word = spanishWord(node.name, extras);
      if (word) {
        context.report({
          node,
          messageId: 'spanish',
          data: { nombre: node.name, palabra: word },
        });
      }
    }

    return {
      VariableDeclarator: (node) => check(node.id),
      FunctionDeclaration: (node) => check(node.id),
      ClassDeclaration: (node) => check(node.id),
      TSTypeAliasDeclaration: (node) => check(node.id),
      TSInterfaceDeclaration: (node) => check(node.id),
      TSEnumDeclaration: (node) => check(node.id),
      TSEnumMember: (node) => check(node.id),
      // Object keys cover Drizzle columns and catalog entries.
      Property: (node) => !node.computed && check(node.key),
      TSPropertySignature: (node) => !node.computed && check(node.key),
      // Function parameters, including parameters with default values.
      ':function': (node) => {
        for (const parameter of node.params) {
          check(parameter.type === 'AssignmentPattern' ? parameter.left : parameter);
        }
      },
    };
  },
};

export default {
  rules: { 'no-spanish-identifiers': noSpanishIdentifiers },
};
