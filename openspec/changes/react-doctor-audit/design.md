# OpenSpec Design: react-doctor-audit

## Context

The Conexiones Next.js/React project scored 56/100 on react-doctor with 15 issues across security, performance, maintainability, accessibility, and bugs. The project uses Spanish identifiers consistently but needs security fixes, component refactoring, and accessibility improvements. All changes are scoped to the local repository with no external dependencies added.

## Goals / Non-Goals

**Goals:**
- Fix 2 critical security vulnerabilities (unauthenticated server actions, unguarded URL parsing)
- Split giant `DetalleSolicitud` component into 4 smaller single-responsibility components
- Move 5 module-scope static values outside component functions for proper memoization
- Remove exports from 3 unused symbols (`contarCargaOferta`, `requerirAdmin`, `URGENCIA_PESO`)
- Fix 2 accessibility violations (placeholder-only form labels)
- Establish consistent naming convention (Spanish or English) for all identifiers
- Improve transition CSS from `transition: all` to specific properties

**Non-Goals:**
- Rewrite entire codebase in English (if keeping Spanish convention)
- Add new features or capabilities
- Change database schema or API contracts
- Migrate to a different framework or routing system

## Decisions

### 1. Security: Add auth guards to server actions
**Decision**: Add `requerirSesion()` call at the start of `entrar` and `registrarContactoWhatsapp` server actions in `src/app/admin/acciones.ts`. 
**Rationale**: Prevents unauthorized users from calling privileged server operations. This is the minimum fix for the 2 critical errors identified by react-doctor.
**Alternative**: Use Next.js middleware to protect `/admin/` routes - chosen for simpler implementation with minimal changes.

### 2. Component splitting: Extract DetalleSolicitud
**Decision**: Split `DetalleSolicitud` into: `DatosSolicitud`, `HistoriaBitacora`, `SugerenciasVoluntario`, `NotasInternas`.
**Rationale**: Reduces component from >300 lines to under 150 lines per sub-component, improves testability, follows Single Responsibility Principle.
**Alternative**: Keep as-is with inline comments - rejected because react-doctor flags it as a warning and it harms maintainability.

### 3. Module-scope constants
**Decision**: Move `burbujas`, `pasos`, `flujo`, `faq`, `clases` from inside component functions to module scope at top of respective files.
**Rationale**: Enables proper React memoization, prevents children from appearing "new" each render, reduces wasted computation.
**Alternative**: Use React.useMemo - rejected because these are truly static values with no dependencies, making module scope cleaner.

### 4. Unused export cleanup
**Decision**: Remove `export` from `contarCargaOferta` (acciones.ts), `requerirAdmin` (auth.ts), `URGENCIA_PESO` (catalogos.ts).
**Rationale**: Reduces public surface area, prevents misleading API signals, no breaking changes since nothing imports them.
**Alternative**: Keep exports and add JSDoc warning - rejected because unused exports are a maintainability anti-pattern.

### 5. Accessibility: Add labels to form fields
**Decision**: Add visible `<label>` elements to the two placeholder-only fields in `solicitudes/[id]/page.tsx` lines 303 and 393, keeping placeholders as hint text.
**Rationale**: Fixes WCAG 2.1 AA compliance, improves usability for screen readers and keyboard navigation.
**Alternative**: Remove placeholder text - rejected because placeholder serves as useful hint for expected format.

### 6. Naming convention
**Decision**: Maintain Spanish identifiers consistently throughout the codebase (already the established pattern).
**Rationale**: Project targets Latin American Spanish speakers; inconsistent mixing of languages is the problem, not Spanish itself.
**Alternative**: Full migration to English - rejected as too extensive for this cycle and risks introducing bugs.

### 7. CSS transition fix
**Decision**: Replace `transition: all` with `transition-colors` Tailwind utility (or `transition-opacity` / `transition-transform`).
**Rationale**: Fixes performance jank from animating layout properties, targeted fix for the specific warning.
**Alternative**: Remove transitions entirely - rejected because they provide visual feedback UX.

## Risks / Trade-offs

- [Security] Fixing auth guards may break existing unauthenticated workflows if not tested thoroughly
- [Performance] Module-scope constants may increase initial bundle size slightly (negligible)
- [Maintainability] Component splitting requires updating all imports and references across the codebase
- [Accessibility] Adding labels may shift layout slightly; test on multiple viewport sizes
- [Naming] Maintaining Spanish convention requires discipline; new team members must follow the pattern

## Migration Plan

1. **Phase 1 (Security)**: Add `requerirSesion()` to server actions, guard `new URL()` in layout.tsx
2. **Phase 2 (Maintainability)**: Split `DetalleSolicitud` component, move static values to module scope
3. **Phase 3 (Cleanup)**: Remove unused exports, clean imports
4. **Phase 4 (Accessibility)**: Add `<label>` elements to form fields
5. **Phase 5 (Polish)**: Fix `transition: all`, verify all changes with `pnpm lint && pnpm typecheck`

---

*Design created via OpenSpec spec-driven schema, referencing proposal.md and all specs files*