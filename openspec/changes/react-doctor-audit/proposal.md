# OpenSpec Proposal: react-doctor-audit

## Why

The Conexiones Next.js/React project scored 56/100 on react-doctor, identifying critical security vulnerabilities, maintainability warnings, and accessibility issues that must be resolved before production deployment. The analysis revealed unauthenticated server actions, unguarded URL parsing, a giant component exceeding 300 lines, static values rebuilt on every render, and placeholder-only form labels.

## What Changes

- Fix 2 security errors: Add authentication guards to `entrar` and `registrarContactoWhatsapp` server actions; guard `new URL()` in layout.tsx
- Split `DetalleSolicitud` giant component into 4 smaller components (DatosSolicitud, HistoriaBitacora, SugerenciasVoluntario, NotasInternas)
- Move 5 module-scope static values outside component functions (burbujas, pasos, flujo, faq, clases)
- Remove exports from 3 unused symbols (contarCargaOferta, requerirAdmin, URGENCIA_PESO)
- Fix accessibility: Add proper `<label>` elements to form fields currently using placeholder-only labels
- Address Spanish naming convention consistency (full Spanish or fully English identifiers)
- Transition from `transition: all` to specific CSS transition properties

## Capabilities

### New Capabilities

- `security/auth-guards`: Implement proper authentication middleware for server actions and admin routes
- `component-splitting`: Extract giant components into smaller, single-responsibility components  
- `module-scope-constants`: Move static values outside component render functions for proper memoization
- `unused-export-cleanup`: Remove exports that are not imported by any module
- `accessibility-labels`: Add visible associated labels to form fields replacing placeholder-only patterns
- `naming-convention`: Establish and enforce consistent language (Spanish or English) for all identifiers

### Modified Capabilities

- `page-components`: Refactor `page.tsx` and `solicitudes/[id]/page.tsx` to have clearer component boundaries
- `server-actions`: Add auth guards to existing server actions in `src/app/admin/acciones.ts`

## Impact

- **Files modified**: `src/app/admin/acciones.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/admin/(panel)/solicitudes/[id]/page.tsx`, `src/components/admin/Piezas.tsx`, `src/lib/catalogos.ts`, `src/lib/auth.ts`
- **No breaking changes** to public API or user-facing behavior
- **Performance improvement**: Better memoization, reduced re-renders
- **Security improvement**: Prevent unauthorized server action calls
- **Accessibility improvement**: WCAG AA compliance for form labels

---

*Proposal created via OpenSpec spec-driven schema using react-doctor diagnostics*