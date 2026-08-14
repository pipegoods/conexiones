## 1. Source and Schema Migration

- [x] 1.1 Rename implementation identifiers and source filenames to English across application code, shared libraries, components, and scripts.
- [x] 1.2 Rename database tables, columns, indexes, enum names, and persisted enum values to English.
- [x] 1.3 Regenerate the development-only initial migration and Drizzle metadata from the English schema.

## 2. Product Boundary Preservation

- [x] 2.1 Preserve Spanish user-facing copy, metadata, validation messages, and labels for persisted values.
- [x] 2.2 Preserve all established Spanish public and panel route paths.

## 3. Enforcement and Verification

- [x] 3.1 Add and configure the local ESLint rule that rejects Spanish implementation identifiers while allowing reviewed false positives.
- [x] 3.2 Document the naming boundary and false-positive procedure in repository guidance.
- [x] 3.3 Run typecheck, lint, tests, strict OpenSpec validation, and whitespace-diff validation.
