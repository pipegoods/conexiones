# OpenSpec Tasks: react-doctor-audit

## 1. Security Fixes

- [x] 1.1 Secure `entrar` server action in `src/app/admin/acciones.ts:27` — the original task ("add `requerirSesion()` at the start") was a bug: it redirected unauthenticated users on the public login page back to `/admin/login`, breaking login. Correct fix: remove the bogus guard (login must not require a session) and add a targeted `// react-doctor-disable-next-line server-auth-actions` comment documenting that `entrar` is an intentionally public endpoint.
- [x] 1.2 Add `requerirSesion()` call at start of `registrarContactoWhatsapp` server action in `src/app/admin/acciones.ts:330`
- [x] 1.3 Guard `new URL()` in `src/app/layout.tsx:12` with `URL.canParse()` or try/catch

## 2. Component Splitting

- [x] 2.1 Extract `DatosSolicitud` component from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.2 Extract `HistoriaBitacora` component from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.3 Extract `SugerenciasVoluntario` component from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.4 Extract `NotasInternas` component from `src/app/admin/(panel)/solicitudes/[id]/page.tsx`
- [x] 2.5 Update all imports in `solicitudes/[id]/page.tsx` to use new sub-components
- [x] 2.6 Verify `DetalleSolicitud` parent component is under 150 lines after splitting

## 3. Module-Scope Constants

- [x] 3.1 Move `burbujas` constant from `CintaDecorativa` in `src/app/page.tsx:133` to module scope at top of `page.tsx`
- [x] 3.2 Move `pasos` constant from `ComoFunciona` in `src/app/page.tsx:189` to module scope at top of `page.tsx`
- [x] 3.3 Move `flujo` constant from `ComoFunciona` in `src/app/page.tsx:213` to module scope at top of `page.tsx`
- [x] 3.4 Move `faq` constant from `Preguntas` in `src/app/page.tsx:430` to module scope at top of `page.tsx`
- [x] 3.5 Move `clases` Record from `InsigniaUrgencia` in `src/components/admin/Piezas.tsx:50` to module scope at top of file
- [x] 3.6 Update all references to moved constants to ensure they still work correctly

## 4. Unused Export Cleanup

- [x] 4.1 Remove `export` keyword from `contarCargaOferta` in `src/app/admin/acciones.ts:349`
- [x] 4.2 Remove `export` keyword from `requerirAdmin` in `src/lib/auth.ts:41`
- [x] 4.3 Remove `export` keyword from `URGENCIA_PESO` in `src/lib/catalogos.ts:80`
- [x] 4.4 Verify no other modules import these symbols (confirm they're truly unused)

## 5. Accessibility Fixes

- [x] 5.1 Add visible `<label>` element to form field at `src/app/admin/(panel)/solicitudes/[id]/page.tsx:303`, keep placeholder as hint
- [x] 5.2 Add visible `<label>` element to form field at `src/app/admin/(panel)/solicitudes/[id]/page.tsx:393`, keep placeholder as hint

## 6. CSS Transition Fix

- [x] 6.1 Replace `transition: all` with `transition-colors` in `src/app/admin/(panel)/page.tsx:63`
- [x] 6.2 Verify the change reduces layout animation jank

## 7. Naming Convention Verification

- [x] 7.1 Review all identifiers in changed files to ensure consistent Spanish usage
- [x] 7.2 Check for any English/Spanish mixing that should be resolved
- [x] 7.3 Document the naming convention decision in the codebase

## 8. Verification

- [x] 8.1 Run typecheck (`tsc --noEmit`) - passes with no errors
- [x] 8.2 Run lint (`eslint`) - passes with no errors
- [x] 8.3 Run react-doctor - `✔ No issues found!` (was 51/100 Critical with 2 server-auth-actions errors). Fixed via `doctor.config.json` with `serverAuthFunctionNames: ["requerirSesion"]` (react-doctor doesn't recognize Spanish guard names) plus the targeted disable comment on `entrar`. Score API was unreachable during final verification, but the diagnostic surface is fully clean.
- [x] 8.4 Review all changes - confirmed no breaking behavior: `entrar` login flow restored, all extracted components type-safe (no `any`), public forms (`/necesito-ayuda`, `/quiero-ayudar`) and panel actions verified