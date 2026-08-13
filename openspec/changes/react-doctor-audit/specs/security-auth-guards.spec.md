# Specification: Security Auth Guards

## Purpose

Ensure all privileged server actions and admin routes require proper authentication before executing sensitive operations.

## ADDED Requirements

### Requirement: Server actions must require authenticated session

The system SHALL require a valid authenticated session before executing any server action that modifies server state or data.

**Scenario: Unauthenticated access to entrar is rejected**

- **WHEN** an unauthenticated client calls the `entrar` server action
- **THEN** the action SHALL return an authentication error and NOT perform login or redirection

**Scenario: Unauthenticated access to registrarContactoWhatsapp is rejected**

- **WHEN** an unauthenticated client calls the `registrarContactoWhatsapp` server action
- **THEN** the action SHALL return an authentication error and NOT insert event data into the database

### Requirement: Admin panel routes must require authentication

The system SHALL protect all admin panel routes with session authentication middleware.

**Scenario: Direct access to /admin/* without session is redirected**

- **WHEN** a request is made to any `/admin/*` route without a valid session cookie
- **THEN** the system SHALL redirect to `/admin/login` and NOT render protected content

### Requirement: URL parsing must guard against malformed input

The system SHALL guard all `new URL()` constructions with validity checking before rendering.

**Scenario: Malformed URL does not crash render**

- **WHEN** `new URL()` is called with a runtime URL value from params/searchParams/location
- **THEN** the system SHALL use `URL.canParse()` guard or wrap in try/catch, and SHALL NOT crash render with TypeError