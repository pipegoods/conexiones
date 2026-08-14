# component-splitting Specification

## Purpose
Split the oversized request-detail page into a thin coordinator plus focused, single-responsibility presentational components.

## Requirements

### Requirement: Request detail page acts only as a coordinator

The request-detail page SHALL fetch request data, compute the derived values required for rendering, and compose child components. It SHALL NOT inline request details, the activity timeline, volunteer suggestions, or the internal-notes form. The page component SHALL stay under 150 lines, excluding imports and blank lines.

#### Scenario: Page delegates section rendering to sub-components

- **WHEN** the request detail page renders
- **THEN** it SHALL compose `RequestDetails`, `ActivityLog`, `VolunteerSuggestions`, and `InternalNotes` rather than inline their markup

#### Scenario: Page component size stays bounded

- **WHEN** the page component source is measured
- **THEN** it SHALL be under 150 lines, excluding imports and blank lines

### Requirement: Sub-components have single, typed responsibilities

Each extracted sub-component SHALL receive its rendering data through explicit typed props and SHALL not use internal React state, context, or mutable module data to determine its output.

#### Scenario: Each sub-component owns one section

- **WHEN** the extracted components are inspected
- **THEN** `RequestDetails` SHALL render request details, `ActivityLog` the event timeline, `VolunteerSuggestions` suggested volunteers and connection actions, and `InternalNotes` the notes form

#### Scenario: Components can render from typed props alone

- **WHEN** `RequestDetails`, `ActivityLog`, `VolunteerSuggestions`, and `InternalNotes` are inspected
- **THEN** each SHALL declare explicit typed props and SHALL not use `useState`, `useReducer`, or React context to determine rendered output

#### Scenario: No dedicated component test file is required

- **WHEN** a reviewer checks these presentational components
- **THEN** the absence of a per-component unit test file SHALL NOT be treated as a gap, because typed props and the tests for their supplying logic cover their contract
