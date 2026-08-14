# module-scope-constants Specification

## Purpose
Keep build-time static component data at module scope so it retains a stable reference across renders.

## Requirements

### Requirement: Static component data lives at module scope

Values that do not depend on props, state, or render-time data SHALL be declared as module-scope constants rather than recreated in component bodies.

#### Scenario: Landing-page static data is module scoped

- **WHEN** `src/app/page.tsx` is loaded
- **THEN** `bubbles`, `steps`, `flow`, and `frequentlyAskedQuestions` SHALL be declared outside component functions

#### Scenario: Urgency badge class map is module scoped

- **WHEN** `src/components/admin/Primitives.tsx` is loaded
- **THEN** the urgency-class record used by `UrgencyBadge` SHALL be declared outside component functions

### Requirement: Module-scope extraction preserves referential stability

Moving static values to module scope SHALL preserve their identity across renders.

#### Scenario: Referential identity is stable across renders

- **WHEN** a consuming component re-renders
- **THEN** its module-scope static value SHALL have the same object reference as in its prior render

#### Scenario: No behavioral regression from the extraction

- **WHEN** a consuming component reads its static value
- **THEN** its rendered output SHALL retain the same content and shape as before the extraction
