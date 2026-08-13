# Conexiones

> Conectamos necesidades reales con personas que tienen algo para aportar.

Plataforma ciudadana para coordinar ayuda después de una emergencia. Recoge dos cosas —**qué necesita la gente** y **qué pueden poner a disposición los voluntarios**— y las cruza para que un operador conecte a las dos partes por WhatsApp, dejando trazabilidad de cada paso.

---

## Puesta en marcha

### 1. Instalar

```bash
npm install
cp .env.example .env.local
```

### 2. Crear la base de datos en Neon

1. Entra a [console.neon.tech](https://console.neon.tech) → **New Project**.
2. Copia la *Connection string* (la que termina en `?sslmode=require`).
3. Pégala en `.env.local` como `DATABASE_URL`.

### 3. Completar el resto de `.env.local`

```bash
# Secreto para firmar la cookie de sesión del panel
openssl rand -base64 32
```

Ponlo en `SESSION_SECRET`, y en `NEXT_PUBLIC_WHATSAPP_EQUIPO` el número del equipo en formato internacional sin `+` (ej. `573001234567`).

### 4. Crear las tablas

```bash
npm run db:migrate
```

### 5. Crear la primera cuenta del panel

```bash
npm run usuario -- tu@correo.com "Tu Nombre" "una-contraseña-larga" admin
```

### 6. Arrancar

```bash
npm run dev
```

- Sitio público → http://localhost:3000
- Panel interno → http://localhost:3000/admin

---

## Cómo funciona el flujo

Cada solicitud recorre cinco niveles. El panel no deja saltárselos: solo se puede conectar lo que ya está verificado.

| Nivel | Estado | Qué significa |
|---|---|---|
| 0 | 🟡 Recibida | Llegó por el formulario. Todavía no sabemos si es real. |
| 1 | 🔵 Contactada | Alguien del equipo logró comunicarse. |
| 2 | 🟢 Verificada | Confirmamos persona, necesidad y lugar. |
| 3 | 🟣 Conectada | Hay un voluntario que aceptó y ya tienen los contactos. |
| 4 | ❤️ Resuelta | La persona confirmó que recibió la ayuda. |

Existe además **Descartada** para duplicados, casos no verificables o fuera de alcance.

Cada cambio de estado escribe una fila en `eventos` con quién lo hizo, cuándo y con qué nota. De ahí salen las cifras públicas de la portada y las métricas del panel.

## El motor de sugerencias

Cuando una solicitud llega a **Verificada**, el panel muestra voluntarios candidatos ordenados por un puntaje de 0 a 100 (`src/lib/matching.ts`):

| Peso | Criterio |
|---|---|
| 45 | Cuánto de lo que se necesita alcanza a cubrir el voluntario |
| 30 | Qué tan cerca está (o distancia real si hay coordenadas) |
| 15 | Si su disponibilidad alcanza para la urgencia del caso |
| 10 | Confianza: si ya está verificado y qué tan cargado está |

Descarta de entrada a quien no comparte ningún tipo de recurso, a quien está fuera de su radio de desplazamiento y a quien ya está vinculado al caso. Cada sugerencia viene con sus **razones** y sus **advertencias** en texto plano.

**El sistema propone, una persona decide.** No hay asignación automática: en una emergencia un match equivocado le llega a alguien real.

## WhatsApp

La v1 opera con enlaces `wa.me` prellenados: el operador abre el chat desde el panel con el mensaje ya escrito y solo presiona enviar. Cada apertura queda en la bitácora.

Las plantillas viven en `src/lib/whatsapp.ts` y son las mismas que se convertirán en plantillas de la Cloud API cuando Meta apruebe la cuenta — el flujo no cambia, solo quien presiona el botón.

> **Ojo con los tiempos:** la WhatsApp Cloud API exige verificación de negocio en Meta y aprobación de plantillas. Son días o semanas. Por eso el bot no bloquea el lanzamiento.

## Privacidad

- **Ningún dato personal es público.** No hay listado abierto de necesidades: sólo el panel interno los ve.
- Lo único público son conteos agregados (`src/lib/cifras.ts`).
- Todo formulario exige autorización explícita de tratamiento de datos (Ley 1581 de 2012).
- `src/app/privacidad/page.tsx` y `src/app/terminos/page.tsx` son **borradores operativos, no concepto jurídico**. Que los revise un abogado antes de producción.

---

## Estructura

```
src/
├── app/
│   ├── page.tsx                 Landing
│   ├── acciones.ts              Server actions públicas (registro)
│   ├── necesito-ayuda/          Formulario de necesidad
│   ├── quiero-ayudar/           Formulario de capacidad
│   ├── gracias/                 Confirmación con folio
│   ├── privacidad/, terminos/
│   └── admin/
│       ├── acciones.ts          Server actions del panel
│       ├── login/
│       └── (panel)/             Resumen, solicitudes, voluntarios
├── components/
│   ├── formulario/              Campos accesibles reutilizables
│   └── admin/                   Insignias, bitácora, botón de WhatsApp
├── db/schema.ts                 Tablas Drizzle
├── lib/
│   ├── catalogos.ts             Vocabulario compartido y máquina de estados
│   ├── matching.ts              Motor de sugerencias
│   ├── consultas.ts             Lecturas del panel
│   ├── validaciones.ts          Esquemas Zod y normalización de teléfonos
│   ├── whatsapp.ts              Plantillas y enlaces wa.me
│   ├── cifras.ts                Conteos públicos
│   ├── auth.ts / sesion.ts      Sesión del panel
│   └── password.ts              Hash scrypt
└── proxy.ts                     Protege /admin (era middleware.ts antes de Next 16)
```

Stack: **Next.js 16** (App Router, Server Actions) · **Neon** Postgres · **Drizzle ORM** · **Tailwind CSS 4** · **Zod** · **jose**.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | Verifica tipos |
| `npm run db:generate` | Genera la migración SQL desde el schema |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Explorador visual de la base de datos |
| `npm run usuario -- <correo> <nombre> <clave> [rol]` | Crea o actualiza una cuenta del panel |

## Convenciones de código

- **Idioma**: todos los identificadores (variables, constantes, funciones, componentes) están en español. No se mezcla inglés: si necesitas un nombre nuevo, tradúcelo (ej. `faq` → `preguntasFrecuentes`, `Hero` → `Portada`).
- **Constantes de módulo**: las constantes que no cambian por render van al ámbito del módulo, al tope del archivo, y no se recrean dentro de los componentes.
- **Componentes**: un componente de página que supere ~150 líneas se divide en sub-componentes bajo `src/components/<área>/`.

## Lo que sigue (v2)

- Bot de WhatsApp con la Cloud API para verificar y confirmar sin operador.
- Geocodificación de direcciones para usar distancia real en vez de coincidencia de municipio (el motor ya la soporta: solo faltan `lat`/`lng`).
- Blog de contenido útil y botón de pánico para reportar siniestros.
- Gestión de cuentas del equipo desde la interfaz (hoy es por CLI).
