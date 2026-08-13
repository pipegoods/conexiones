# Specification: Module-Scope Constants

## Purpose

Move static values that are rebuilt on every render outside component functions to module scope to enable proper memoization and reduce unnecessary re-renders.

## ADDED Requirements

### Requirement: CintaDecorativa burbujas must be module-scope constant

The system SHALL move the `burbujas` constant from inside `CintaDecorativa` component to module scope at the top of `page.tsx`.

**Scenario: burbujas does not rebuild on every render**

- **WHEN** `CintaDecorativa` renders
- **THEN** the `burbujas` constant SHALL be defined at module scope outside any component function, and SHALL not be recreated on each render cycle

**Scenario: Memoized children are not broken**

- **WHEN** parent components use `React.memo` or depend on referential stability
- **THEN** moving `burbujas` to module scope SHALL not cause memoized children to appear "new" each render cycle

### Requirement: ComoFunciona pasos y flujo must be module-scope constants

The system SHALL move the `pasos` and `flujo` constants from inside `ComoFunciona` component to module scope at the top of `page.tsx`.

**Scenario: pasos does not rebuild on every render**

- **WHEN** `ComoFunciona` renders
- **THEN** the `pasos` constant SHALL be defined at module scope outside the component function, and SHALL not be recreated on each render cycle

**Scenario: flujo does not rebuild on every render**

- **WHEN** `ComoFunciona` renders
- **THEN** the `flujo` constant SHALL be defined at module scope outside the component function, and SHALL not be recreated on each render cycle

### Requirement: Preguntas faq must be module-scope constant

The system SHALL move the `faq` constant from inside `Preguntas` component to module scope at the top of `page.tsx`.

**Scenario: faq does not rebuild on every render**

- **WHEN** `Preguntas` renders
- **THEN** the `faq` constant SHALL be defined at module scope outside the component function, and SHALL not be recreated on each render cycle

### Requirement: InsigniaUrgencia clases must be module-scope constant

The system SHALL move the `clases` Record from inside `InsigniaUrgencia` component to module scope at the top of `components/admin/Piezas.tsx`.

**Scenario: clases does not rebuild on every render**

- **WHEN** `InsigniaUrgencia` renders
- **THEN** the `clases` constant SHALL be defined at module scope outside the component function, and SHALL not be recreated on each render cycle