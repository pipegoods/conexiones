# Contribuir a Conexiones

Gracias por querer mejorar Conexiones. El proyecto coordina información sensible durante emergencias, así que priorizamos cambios pequeños, verificables y seguros.

## Antes de empezar

1. Lee el [README](README.md) y configura una base de datos local de prueba.
2. Revisa `AGENTS.md`: el código y el esquema usan inglés; la interfaz, el contenido y las rutas públicas usan español.
3. Busca si existe una especificación activa en `openspec/changes/`. Los cambios de comportamiento deben tener una propuesta OpenSpec antes de implementarse.

## Convenciones clave

- No renombres rutas públicas como `/necesito-ayuda`, `/quiero-ayudar`, `/gracias`, `/terminos` o `/privacidad`.
- No expongas datos personales en consultas, logs, capturas, fixtures o documentación.
- Los valores persistidos de tablas, columnas y enums van en inglés. Las etiquetas para personas usuarias se resuelven desde catálogos en español.
- Las Server Actions son entradas no confiables: valida datos, autenticación y autorización en el servidor.
- Si la regla `local/no-spanish-identifiers` produce un falso positivo para una palabra inglesa, agrega una excepción precisa en `eslint.config.mjs`; no desactives la regla.

## Flujo de trabajo

1. Crea una rama descriptiva desde `main`.
2. Implementa el cambio con pruebas proporcionadas al riesgo.
3. Actualiza OpenSpec cuando cambie comportamiento, requisitos o contratos.
4. Ejecuta la validación completa:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx openspec validate --all --strict
```

5. Describe en el pull request qué cambió, cómo lo validaste y cualquier riesgo o seguimiento pendiente.

## Cambios de base de datos

- Modifica `src/db/schema.ts` y genera la migración con `npm run db:generate`.
- Revisa la SQL generada antes de incluirla.
- No reescribas una migración ya aplicada en un entorno compartido. Para desarrollo local, coordina cualquier reinicio de base antes de hacerlo.

## Reportar vulnerabilidades

No publiques credenciales, datos personales ni detalles explotables en issues públicos. Usa un canal privado con el equipo mantenedor hasta que se acuerde una divulgación responsable.
