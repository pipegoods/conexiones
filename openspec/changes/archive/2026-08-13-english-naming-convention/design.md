## Context

See proposal.md and the `naming-convention` capability. The rename spans source modules, schema, generated initial migration, lint configuration, and documentation. The project remains in development, so the initial migration can be regenerated rather than supporting an in-place translation of existing production data.

## Goals / Non-Goals

**Goals:**

- Make the English-code/Spanish-product boundary unambiguous and mechanically enforced.
- Preserve every established Spanish route and all Spanish user-facing language.
- Keep enum labels separate from their persisted English values so operators continue to see Spanish.

**Non-Goals:**

- Rename CSS utility tokens that are neither source identifiers nor database attributes.
- Provide an in-place migration for databases created from the former Spanish schema.
- Translate historical user-entered content.

## Decisions

### English implementation vocabulary with Spanish presentation labels

Source and persistence use English, while catalogs map persisted values to Spanish labels at rendering boundaries. This keeps code interoperable without exposing internal values to users. Translating all presentation text was rejected because it would break the product language contract.

### Preserve public route segments

The existing Spanish paths remain stable because they are shared externally. Creating English aliases was rejected because it adds parallel URLs without a product need.

### Regenerate the initial development migration

The original initial migration is replaced by an English-schema baseline. This is safer and clearer than a sequence of transitional renames for a development-only schema. An in-place data migration was rejected because it is unnecessary for the agreed development-state boundary.

### Guard the convention with ESLint

A local rule rejects Spanish identifiers while ignoring user-facing string literals. Specific verified false positives are allowlisted, rather than weakening or disabling the rule.

## Risks / Trade-offs

- [Persisted development data becomes incompatible] → Recreate development databases from the new initial migration.
- [Raw English enum values could reach the interface] → Render catalog-provided Spanish labels at every user-facing boundary.
- [False-positive lint findings] → Add only the reviewed English term to the rule allowlist.

## Migration Plan

1. Replace the initial development migration and Drizzle metadata with the English baseline.
2. Recreate development databases from that baseline before local verification.
3. Retain existing Spanish URLs and presentation labels throughout release.

Rollback consists of restoring the prior source and schema snapshot before a new development database is created; existing data is not migrated by this change.
