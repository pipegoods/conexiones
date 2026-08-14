## Why

Spanish identifiers had spread through code, database schema, generated migrations, and tooling even though users only need Spanish at the product boundary. This made maintenance inconsistent and prevented tooling from enforcing a single implementation language.

## What Changes

- Establish English as the required language for code identifiers, source filenames in implementation directories, database identifiers, and persisted enum values.
- Preserve Spanish for all user-visible copy, validation messages, metadata, and the existing public and administrative route paths shared with users.
- Add an ESLint guard against Spanish identifiers and document the explicit exception process for false positives.
- Regenerate the development-only initial database migration to match the English schema.

## Capabilities

### New Capabilities

- `naming-convention`: Enforce the English-code/Spanish-product boundary across source, schema, migrations, and linting.

### Modified Capabilities

None.

## Impact

- Affected areas: `src/`, `scripts/`, `drizzle/`, ESLint configuration and custom rules, and repository guidance.
- Public routes and user-facing Spanish copy remain compatible; there is no external API addition.
- Persisted development data must be recreated from the regenerated initial migration.
