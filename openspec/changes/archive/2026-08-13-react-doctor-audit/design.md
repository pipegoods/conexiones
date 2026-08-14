# OpenSpec Design: react-doctor-audit

## Context

The Conexiones Next.js/React project scored 56/100 on react-doctor with 15 issues across security, performance, maintainability, accessibility, and bugs. The audit fixes are scoped to the local repository with no external dependencies added. The project convention is English for code and schema identifiers; Spanish is reserved for user-visible text and public routes. That codebase-wide naming migration is documented separately by `english-naming-convention`.

## Goals / Non-Goals

**Goals:**
- Fix 2 critical security vulnerabilities (unauthenticated server actions, unguarded URL parsing)
- Split the request-detail page into 4 smaller single-responsibility components
- Move 5 module-scope static values outside component functions for proper memoization
- Remove exports from unused symbols
- Fix 2 accessibility violations (placeholder-only form labels)
- Improve transition CSS from `transition: all` to specific properties

**Non-Goals:**
- Rename codebase identifiers or schema values (owned by `english-naming-convention`)
- Add new features or capabilities
- Change database schema or API contracts
- Migrate to a different framework or routing system

## Decisions

### 1. Security: Add auth guards to server actions
**Decision**: Require a session at the start of every privileged action in `src/app/admin/actions.ts`, including `logWhatsappContact`. Keep `logIn` public and explicitly mark it as the intentional exception.
**Rationale**: An authentication action cannot require the session it is meant to create. All other panel mutations enforce authorization independently of route navigation.
**Alternative**: Rely on the `/admin` route guard alone. Rejected because direct server-action invocations do not execute that navigation guard.

### 2. Component splitting: Extract request detail sections
**Decision**: Split the request-detail page into `RequestDetails`, `ActivityLog`, `VolunteerSuggestions`, and `InternalNotes`.
**Rationale**: Reduces component from >300 lines to under 150 lines per sub-component, improves testability, follows Single Responsibility Principle.
**Alternative**: Keep as-is with inline comments - rejected because react-doctor flags it as a warning and it harms maintainability.

### 3. Module-scope constants
**Decision**: Move the static hero, workflow, FAQ, and urgency-badge values from inside component functions to module scope at the top of their respective files.
**Rationale**: Enables proper React memoization, prevents children from appearing "new" each render, reduces wasted computation.
**Alternative**: Use React.useMemo - rejected because these are truly static values with no dependencies, making module scope cleaner.

### 4. Unused export cleanup
**Decision**: Remove unused exports after verifying that they have no consumers.
**Rationale**: Reduces public surface area, prevents misleading API signals, no breaking changes since nothing imports them.
**Alternative**: Keep exports and add JSDoc warning - rejected because unused exports are a maintainability anti-pattern.

### 5. Accessibility: Add labels to form fields
**Decision**: Add visible `<label>` elements to the two placeholder-only fields in `solicitudes/[id]/page.tsx` lines 303 and 393, keeping placeholders as hint text.
**Rationale**: Fixes WCAG 2.1 AA compliance, improves usability for screen readers and keyboard navigation.
**Alternative**: Remove placeholder text - rejected because placeholder serves as useful hint for expected format.

### 6. CSS transition fix
**Decision**: Replace `transition: all` with `transition-colors` Tailwind utility (or `transition-opacity` / `transition-transform`).
**Rationale**: Fixes performance jank from animating layout properties, targeted fix for the specific warning.
**Alternative**: Remove transitions entirely - rejected because they provide visual feedback UX.

## Risks / Trade-offs

- [Security] Fixing auth guards may break existing unauthenticated workflows if not tested thoroughly
- [Performance] Module-scope constants may increase initial bundle size slightly (negligible)
- [Maintainability] Component splitting requires updating all imports and references across the codebase
- [Accessibility] Adding labels may shift layout slightly; test on multiple viewport sizes

## Migration Plan

1. **Phase 1 (Security)**: Require sessions in privileged actions, document public `logIn`, guard `new URL()` in layout.tsx
2. **Phase 2 (Maintainability)**: Split request-detail sections and move static values to module scope
3. **Phase 3 (Cleanup)**: Remove unused exports, clean imports
4. **Phase 4 (Accessibility)**: Add `<label>` elements to form fields
5. **Phase 5 (Polish)**: Fix `transition: all`, then verify all changes with the repository validation commands

---

*Design created via OpenSpec spec-driven schema, referencing proposal.md and all specs files*
