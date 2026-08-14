## Purpose

Ensure every form field in the application has a visible, programmatically associated label that stays on screen while the user types, so people filling out forms — often on a phone, often under earthquake-relief stress — never lose track of what a field is for.

## ADDED Requirements

### Requirement: Form fields SHALL have a visible, programmatically associated label

Every form input, textarea, or select in the system SHALL have a visible text label that is programmatically associated with it. The association SHALL be made either by wrapping the input inside a `<label>` element (implicit association) or by pairing a `<label>` with `htmlFor` to the input's `id` (explicit association). Both forms of association are valid and MAY be used interchangeably across the codebase.

#### Scenario: Field labeled via wrapping label

- **WHEN** a form field's `<label>` element wraps the input, textarea, or select as its child
- **THEN** the field SHALL be considered validly labeled

#### Scenario: Field labeled via htmlFor/id pairing

- **WHEN** a form field has a `<label>` element with an `htmlFor` attribute matching the field's `id` attribute
- **THEN** the field SHALL be considered validly labeled

#### Scenario: Field with no associated label

- **WHEN** a form field has no wrapping `<label>` and no `<label htmlFor>` paired to its `id`
- **THEN** the field SHALL be considered a violation of this requirement, regardless of whether it has placeholder text

### Requirement: Labels SHALL persist while the user is typing

A field's label SHALL remain visible at all times, including while the field is focused and while it contains user-entered text. Placeholder text SHALL NOT serve as a field's only label, because placeholder content is hidden as soon as the user starts typing.

#### Scenario: Label stays visible during input

- **WHEN** a user focuses a form field and types a value into it
- **THEN** the field's label SHALL remain visible on screen for the entire duration of typing

#### Scenario: Placeholder retained only as a hint

- **WHEN** a form field has placeholder text
- **THEN** the placeholder SHALL be supplementary hint or example text only
- **THEN** the field SHALL also have a visible label that is independent of the placeholder

### Requirement: Form labeling SHALL meet WCAG 2.1 AA

All form fields across the application SHALL satisfy WCAG 2.1 AA success criteria for labeling, in particular 1.3.1 (Info and Relationships), 2.5.3 (Label in Name), and 3.3.2 (Labels or Instructions).

#### Scenario: Accessibility audit of form fields

- **WHEN** an accessibility audit evaluates a form field in the application
- **THEN** the field SHALL pass WCAG 2.1 AA criteria for labels and instructions
- **THEN** no field SHALL rely on placeholder text as its sole accessible name
