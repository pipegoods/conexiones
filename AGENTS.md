<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Conexiones

Plataforma que conecta necesidades de damnificados con voluntarios que pueden aportar. La usan personas en una emergencia, muchas desde el celular y con mala señal.

## Idioma: código en inglés, producto en español

La frontera es la pantalla. Todo lo que el usuario lee va en español; todo lo que solo leen quienes mantienen el código va en inglés.

**En inglés** — variables, funciones, tipos, componentes, nombres de archivo bajo `src/lib/`, `src/components/`, `src/db/` y `scripts/`, y las tablas y columnas de la base de datos.

**En español** — el texto de la interfaz (etiquetas, botones, mensajes de error, validaciones de Zod), el contenido del landing, la metadata, y las rutas públicas: `/necesito-ayuda`, `/quiero-ayudar`, `/gracias`, `/terminos`, `/privacidad`, y las del panel `/admin/solicitudes` y `/admin/ofertas`. Esas URLs se comparten por WhatsApp entre damnificados: renombrarlas rompe enlaces que ya circulan.

```ts
// bien
const affectedPeople = request.affectedPeople;
<label>Personas afectadas</label>

// mal
const personasAfectadas = solicitud.personasAfectadas;
<label>Affected people</label>
```

La regla `local/no-spanish-identifiers` (en `eslint-rules/`) hace cumplir esto: falla el lint ante identificadores en español y no mira literales de cadena, así que el texto en español nunca la activa. Si detecta un falso positivo — una palabra inglesa que parece española — agrégala a `allow` en `eslint.config.mjs` en vez de desactivar la regla.

## Antes de dar algo por terminado

```bash
npm run typecheck && npm run lint && npm test
```
