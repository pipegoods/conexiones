# Specification: Unused Export Cleanup

## Purpose

Remove `export` keyword from symbols that are exported but not imported by any module, reducing the public surface area and preventing confusion for callers.

## ADDED Requirements

### Requirement: Remove export from contarCargaOferta

The system SHALL remove the `export` keyword from the `contarCargaOferta` function in `src/app/admin/acciones.ts` since no module imports it.

**Scenario: Export removal does not break imports**

- **WHEN** the `export` keyword is removed from `contarCargaOferta`
- **THEN** no importing module SHALL break, as no module currently imports this function
- **THEN** the function SHALL remain available internally within the file for potential future use

### Requirement: Remove export from requerirAdmin

The system SHALL remove the `export` keyword from the `requerirAdmin` function in `src/lib/auth.ts` since no module imports it.

**Scenario: Export removal does not break imports**

- **WHEN** the `export` keyword is removed from `requerirAdmin`
- **THEN** no importing module SHALL break, as no module currently imports this function
- **THEN** the function SHALL remain available internally within the file

### Requirement: Remove export from URGENCIA_PESO

The system SHALL remove the `export` keyword from the `URGENCIA_PESO` constant in `src/lib/catalogos.ts` since no module imports it.

**Scenario: Export removal does not break imports**

- **WHEN** the `export` keyword is removed from `URGENCIA_PESO`
- **THEN** no importing module SHALL break, as no module currently imports this constant
- **THEN** the constant SHALL remain available internally within the file for potential future use