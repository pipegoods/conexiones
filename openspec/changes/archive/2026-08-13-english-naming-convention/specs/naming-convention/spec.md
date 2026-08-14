## Purpose

Maintain one implementation language while preserving Spanish as the stable language of the product experience and shared URLs.

## ADDED Requirements

### Requirement: Implementation and persistence identifiers use English

All identifiers that maintainers or runtime systems consume SHALL use English, including source identifiers, implementation filenames, database tables and columns, enum names and persisted enum values, migration metadata, and scripts.

#### Scenario: Maintainer inspects an implementation identifier

- **WHEN** a maintainer inspects a source identifier, implementation filename, schema identifier, migration identifier, or persisted enum value
- **THEN** it SHALL be English

#### Scenario: Development database is initialized

- **WHEN** a development database is created from the repository's initial migration
- **THEN** its schema identifiers and persisted enum values SHALL be English

### Requirement: Spanish remains at the product boundary

All user-visible copy, metadata, validation messages, and public route paths SHALL remain Spanish. Existing routes `/necesito-ayuda`, `/quiero-ayudar`, `/gracias`, `/terminos`, `/privacidad`, `/admin/solicitudes`, and `/admin/ofertas` SHALL remain available at those paths.

#### Scenario: A user opens an existing shared route

- **WHEN** a user visits one of the established public or panel route paths
- **THEN** the route SHALL remain available without requiring a renamed English URL

#### Scenario: A user reads an interface message

- **WHEN** an interface, metadata field, or validation message is presented to a user
- **THEN** its text SHALL be Spanish regardless of the English implementation identifiers behind it

### Requirement: Naming convention is mechanically guarded

The repository SHALL lint implementation identifiers for Spanish terms and SHALL provide a narrowly scoped allowlist for verified false positives.

#### Scenario: A Spanish implementation identifier is introduced

- **WHEN** lint analyzes a newly introduced Spanish identifier in implementation code
- **THEN** lint SHALL fail and identify the naming-convention violation

#### Scenario: An English false positive is encountered

- **WHEN** an English identifier is incorrectly recognized as Spanish
- **THEN** maintainers SHALL add the specific term to the rule allowlist instead of disabling the naming rule
