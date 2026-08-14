# OpenSpec Tasks: react-doctor-audit

## 1. Security Fixes

- [x] 1.1 Keep `logIn` in `src/app/admin/actions.ts` public and document it with a targeted `// react-doctor-disable-next-line server-auth-actions` comment; a login action cannot require the session it creates.
- [x] 1.2 Add `requireSession()` at the start of `logWhatsappContact` in `src/app/admin/actions.ts`
- [x] 1.3 Guard `new URL()` in `src/app/layout.tsx:12` with `URL.canParse()` or try/catch

## 2. Component Splitting

- [x] 2.1 Extract `RequestDetails` from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.2 Extract `ActivityLog` from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.3 Extract `VolunteerSuggestions` from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.4 Extract `InternalNotes` from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.5 Update all imports in `solicitudes/[id]/page.tsx` to use new sub-components
- [x] 2.6 Verify the request-detail parent page is under 150 lines after splitting

## 3. Module-Scope Constants

- [x] 3.1 Move static hero decoration data to module scope in `src/app/page.tsx`
- [x] 3.2 Move static workflow-step data to module scope in `src/app/page.tsx`
- [x] 3.3 Move static workflow data to module scope in `src/app/page.tsx`
- [x] 3.4 Move static FAQ data to module scope in `src/app/page.tsx`
- [x] 3.5 Move the urgency-class record to module scope in `src/components/admin/Primitives.tsx`
- [x] 3.6 Update all references to moved constants to ensure they still work correctly

## 4. Unused Export Cleanup

- [x] 4.1 Remove unused exports in `src/app/admin/actions.ts`
- [x] 4.2 Remove unused exports in `src/lib/auth.ts`
- [x] 4.3 Remove unused exports in `src/lib/catalogs.ts`
- [x] 4.4 Verify no other modules import these symbols (confirm they're truly unused)

## 5. Accessibility Fixes

- [x] 5.1 Add visible `<label>` element to form field at `src/app/admin/(panel)/solicitudes/[id]/page.tsx:303`, keep placeholder as hint
- [x] 5.2 Add visible `<label>` element to form field at `src/app/admin/(panel)/solicitudes/[id]/page.tsx:393`, keep placeholder as hint

## 6. CSS Transition Fix

- [x] 6.1 Replace `transition: all` with `transition-colors` in `src/app/admin/(panel)/page.tsx:63`
- [x] 6.2 Verify the change reduces layout animation jank

## 7. Naming Convention Verification — SUPERSEDED

Moved out of this change. These tasks verified consistency of *Spanish* identifiers, but the project has since adopted English identifiers as its convention (code in English, user-facing text and public routes in Spanish). That is a codebase-wide rename, far larger than this audit, and is tracked as its own change: `english-naming-convention`.

- [~] 7.1 ~~Review all identifiers in changed files to ensure consistent Spanish usage~~ — superseded
- [~] 7.2 ~~Check for any English/Spanish mixing that should be resolved~~ — superseded
- [~] 7.3 ~~Document the naming convention decision in the codebase~~ — superseded; the decision now lives in `AGENTS.md` and is enforced by the `local/no-spanish-identifiers` ESLint rule

## 8. Verification

- [x] 8.1 Run typecheck (`tsc --noEmit`) - passes with no errors
- [x] 8.2 Run lint (`eslint`) - passes with no errors
- [x] 8.3 Run react-doctor — no issues found. `doctor.config.json` recognizes `requireSession`, and the intentional-public `logIn` action has a targeted disable comment. The score API was unreachable during final verification, but the diagnostic surface is clean.
- [x] 8.4 Review all changes — confirmed no breaking behavior: the `logIn` flow remains public, extracted components are type-safe, and public forms (`/necesito-ayuda`, `/quiero-ayudar`) and panel actions were verified
