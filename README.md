# Conexiones

> Conectamos necesidades reales con personas que pueden aportar después de una emergencia.

Conexiones es una plataforma ciudadana para registrar necesidades, recibir ofertas de ayuda y permitir que un equipo verificador conecte a ambas partes por WhatsApp. Está diseñada para situaciones con conectividad limitada: formularios breves, datos mínimos y un flujo operativo sin asignaciones automáticas.

## Qué hace

- Recibe solicitudes de ayuda en [`/necesito-ayuda`](/necesito-ayuda) y ofertas de apoyo en [`/quiero-ayudar`](/quiero-ayudar).
- Ordena voluntarios compatibles según recursos, ubicación, disponibilidad y carga operativa.
- Mantiene un flujo verificable: recibida → contactada → verificada → conectada → resuelta.
- Registra cambios y contactos de WhatsApp en una bitácora interna.
- Publica únicamente cifras agregadas; los datos personales nunca aparecen en el sitio público.

> [!WARNING]
> La plataforma apoya la coordinación comunitaria. No reemplaza a las líneas de emergencia ni a los servicios de atención oficiales. Si hay riesgo vital, llama al número de emergencia local.

## Estado del proyecto

El código está listo para desarrollo local. Antes de operar con datos reales hacen falta una revisión jurídica de los textos de privacidad y términos, una base de datos desplegada y un equipo responsable de verificación.

## Inicio rápido

### Requisitos

- Node.js y npm.
- Una base de datos PostgreSQL accesible; el ejemplo usa Neon.

### 1. Instala y configura

```bash
npm install
cp .env.example .env.local
```

Completa estas variables en `.env.local`:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL. |
| `SESSION_SECRET` | Secreto aleatorio de al menos 16 caracteres para firmar la sesión. Puedes generarlo con `openssl rand -base64 32`. |
| `NEXT_PUBLIC_WHATSAPP_TEAM` | Número del equipo en formato internacional, sin `+` ni espacios. |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la aplicación. En local: `http://localhost:3000`. |

Nunca subas `.env.local` ni credenciales reales. Usa solamente [.env.example](.env.example) como plantilla.

### 2. Crea el esquema y la cuenta inicial

```bash
npm run db:migrate
npm run create-user -- tu@correo.com "Tu Nombre" "una-contraseña-larga" admin
```

La migración inicial actual es [`drizzle/0000_initial.sql`](drizzle/0000_initial.sql). Si ya tienes una base local anterior al renombrado de esquema, recréala desde esta base antes de continuar: los nombres de tablas, columnas y enums ahora están en inglés.

### 3. Inicia la aplicación

```bash
npm run dev
```

- Sitio público: <http://localhost:3000>
- Panel interno: <http://localhost:3000/admin>

## Flujo operativo

| Nivel | Estado visible | Significado |
| --- | --- | --- |
| 0 | 🟡 Recibida | Llegó desde el formulario y aún debe verificarse. |
| 1 | 🔵 Contactada | El equipo logró comunicarse. |
| 2 | 🟢 Verificada | Se confirmó la necesidad y su ubicación. |
| 3 | 🟣 Conectada | Un voluntario aceptó y ambas partes tienen contacto. |
| 4 | ❤️ Resuelta | La persona confirmó que recibió ayuda. |

También existe el estado **Descartada** para duplicados, casos no verificables o fuera de alcance. Las etiquetas visibles salen de `src/lib/catalogs.ts`; los valores que persiste la base de datos son slugs en inglés y nunca se muestran crudos.

## Arquitectura

```text
src/
├── app/                    Rutas públicas, panel y Server Actions
├── components/             Componentes de formulario y del panel
├── db/schema.ts            Esquema Drizzle/PostgreSQL
├── lib/                    Autenticación, catálogos, matching, consultas y WhatsApp
└── proxy.ts                Protección de rutas del panel
```

Stack: **Next.js 16** · **React** · **PostgreSQL** · **Drizzle ORM** · **Tailwind CSS 4** · **Zod** · **jose**.

## Privacidad y seguridad

- El panel requiere una sesión autenticada y cada Server Action valida permisos en el servidor.
- Los formularios públicos piden consentimiento explícito para el tratamiento de datos.
- No se publica un directorio de personas, teléfonos o direcciones.
- El flujo de WhatsApp usa enlaces prellenados; todavía no integra la Cloud API de Meta.

Los textos de [privacidad](src/app/privacidad/page.tsx) y [términos](src/app/terminos/page.tsx) son borradores operativos, no asesoría jurídica. Deben revisarse antes de un lanzamiento con datos reales.

## Calidad

Antes de proponer o publicar cambios ejecuta:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

También se validan las especificaciones con:

```bash
npx openspec validate --all --strict
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las convenciones de código, rutas y esquema.

## Comandos útiles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia desarrollo local. |
| `npm run build` | Genera el build de producción. |
| `npm run typecheck` | Verifica TypeScript. |
| `npm run lint` | Comprueba las reglas de lint y nombres de identificadores. |
| `npm test` | Ejecuta pruebas unitarias. |
| `npm run db:generate` | Genera migraciones desde el esquema. |
| `npm run db:migrate` | Aplica migraciones pendientes. |
| `npm run db:studio` | Abre el explorador de la base. |
| `npm run create-user -- <correo> <nombre> <clave> [rol]` | Crea o actualiza una cuenta interna. |

## Próximos pasos

- Integrar WhatsApp Cloud API cuando Meta apruebe la cuenta y las plantillas.
- Geocodificar direcciones para usar distancia real cuando sea seguro y consentido.
- Gestionar cuentas internas desde el panel.
- Revisar jurídicamente los textos y el proceso de tratamiento de datos antes de producción.

## Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un cambio.
