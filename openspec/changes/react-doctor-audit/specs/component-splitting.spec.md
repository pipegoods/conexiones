# Specification: Component Splitting

## Purpose

Refactor giant components into smaller, single-responsibility components to improve readability, testability, and maintainability.

## ADDED Requirements

### Requirement: DetalleSolicitud component must be split into smaller components

The system SHALL split the `DetalleSolicitud` component (currently >300 lines) into 4 separate components with single responsibilities.

**Scenario: Component splitting reduces parent component size**

- **WHEN** the `DetalleSolicitud` page component is refactored
- **THEN** the parent component SHALL be reduced to under 150 lines, functioning only as a coordinator/assembler of sub-components

**Scenario: New sub-components are independently testable**

- **WHEN** each new component (`DatosSolicitud`, `HistoriaBitacora`, `SugerenciasVoluntario`, `NotasInternas`) is extracted
- **THEN** each component SHALL have its own unit test file and SHALL accept well-defined props interfaces without internal state dependencies

**Scenario: Component boundaries follow SRP**

- **WHEN** the refactoring is complete
- **THEN** each new component SHALL have exactly one reason to change (single responsibility):
  - `DatosSolicitud`: renders basic solicitud metadata and URGENCIA info
  - `HistoriaBitacora`: renders the timeline/bitácora section
  - `SugerenciasVoluntario`: renders volunteer candidate list with actions
  - `NotasInternas`: renders the internal notes form