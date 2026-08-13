# Specification: Accessibility Form Labels

## Purpose

Ensure all form fields have visible associated `<label>` elements that persist during user input, replacing placeholder-only label patterns that disappear on entry.

## ADDED Requirements

### Requirement: Form fields must have visible associated labels

The system SHALL add visible `<label>` elements associated with all form inputs that currently rely on placeholder text as the sole label.

**Scenario: Placeholder-only fields get persistent labels**

- **WHEN** a form field uses placeholder text as its only label
- **THEN** the system SHALL add a visible `<label>` element associated with the input via `htmlFor`/`id` attribute
- **THEN** the placeholder SHALL be retained for example/hint text but NOT replace the label

**Scenario: Accessibility criteria met**

- **WHEN** the accessibility audit runs
- **THEN** all form fields SHALL pass WCAG 2.1 AA compliance for form labels
- **THEN** no field SHALL have only placeholder text as its visible label

### Requirement: Admin panel form labels must be fixed

The system SHALL fix the two placeholder-only fields identified in `src/app/admin/(panel)/solicitudes/[id]/page.tsx` at lines 303 and 393.

**Scenario: Line 303 field gets label**

- **WHEN** the form field at line 303 in `solicitudes/[id]/page.tsx` is refactored
- **THEN** a visible `<label>` SHALL be associated with the input, keeping the placeholder as hint text

**Scenario: Line 393 field gets label**

- **WHEN** the form field at line 393 in `solicitudes/[id]/page.tsx` is refactored
- **THEN** a visible `<label>` SHALL be associated with the input, keeping the placeholder as hint text