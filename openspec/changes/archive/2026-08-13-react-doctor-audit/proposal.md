# OpenSpec Proposal: react-doctor-audit

## Why

The Conexiones Next.js/React project scored 56/100 on react-doctor, identifying critical security vulnerabilities, maintainability warnings, and accessibility issues that must be resolved before production deployment. The analysis revealed unauthenticated server actions, unguarded URL parsing, a giant component exceeding 300 lines, static values rebuilt on every render, and placeholder-only form labels.

## What Changes

- Fix server-action authentication and safely construct configured URLs.
- Split the request-detail page into focused components (`RequestDetails`, `ActivityLog`, `VolunteerSuggestions`, and `InternalNotes`).
- Move static values outside component functions and remove unused exports.
- Fix accessibility: Add proper `<label>` elements to form fields currently using placeholder-only labels
- Transition from `transition: all` to specific CSS transition properties

Naming convention is explicitly **out of scope** for this change. It was originally listed here, but the project has since adopted English identifiers as its convention, which is a codebase-wide rename far larger than this audit. It is tracked as its own change: `english-naming-convention`.

## Capabilities

### New Capabilities

- `security/auth-guards`: Implement proper authentication middleware for server actions and admin routes
- `component-splitting`: Extract giant components into smaller, single-responsibility components  
- `module-scope-constants`: Move static values outside component render functions for proper memoization
- `unused-export-cleanup`: Remove exports that are not imported by any module
- `accessibility-labels`: Add visible associated labels to form fields replacing placeholder-only patterns

### Modified Capabilities

None. `page-components` and `server-actions` were listed here originally, but no main spec exists for either — this is the project's first change, so `openspec/specs/` is empty and there is nothing to modify. The behavior they described is covered by the `component-splitting` and `security-auth-guards` capabilities above.

## Impact

- **Files modified**: `src/app/admin/actions.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/admin/(panel)/solicitudes/[id]/page.tsx`, `src/components/admin/Primitives.tsx`, `src/lib/catalogs.ts`, `src/lib/auth.ts`
- **No breaking changes** to public API or user-facing behavior
- **Performance improvement**: Better memoization, reduced re-renders
- **Security improvement**: Prevent unauthorized server action calls
- **Accessibility improvement**: WCAG AA compliance for form labels

---

*Proposal created via OpenSpec spec-driven schema using react-doctor diagnostics*
