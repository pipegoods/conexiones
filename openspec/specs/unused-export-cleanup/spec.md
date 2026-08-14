# unused-export-cleanup Specification

## Purpose
Keep the module public surface limited to symbols that are actually consumed.

## Requirements

### Requirement: Unused exports are safely removed or made private

Before removing an export, the system SHALL verify that no other module imports it. A symbol with no external or internal consumers SHALL be deleted; a symbol used only in its own file SHALL remain private without `export`.

#### Scenario: Unused export with no consumers is deleted

- **WHEN** an exported symbol has no importing module and no internal usage
- **THEN** the symbol SHALL be deleted from its source file

#### Scenario: Export used only locally is made private

- **WHEN** an exported symbol has no importing module but has internal consumers
- **THEN** its `export` keyword SHALL be removed while retaining the private declaration
