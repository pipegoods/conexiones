## Purpose

Ensure privileged admin server actions require authentication, the login action remains intentionally public, admin routes redirect anonymous visitors, and configured URL parsing cannot crash rendering.

## ADDED Requirements

### Requirement: Privileged server actions require an authenticated session

Server actions that read or modify `requests`, `offers`, `connections`, or `events` on behalf of the admin panel SHALL call `requireSession` before any database read or write.

#### Scenario: Unauthenticated access to a privileged action produces no effect

- **WHEN** an unauthenticated client invokes `updateRequestStatus`, `saveRequestNotes`, `updateOfferStatus`, `proposeConnection`, `updateConnection`, or `logWhatsappContact`
- **THEN** the action SHALL redirect to `/admin/login` before any query or mutation runs
- **THEN** no affected row SHALL be read or changed as a result

#### Scenario: Authenticated calls are attributed to the session

- **WHEN** an authenticated client invokes a privileged server action
- **THEN** it SHALL execute its database operations and record `userId` and `name` on resulting event rows

### Requirement: The login action is an intentional, documented exception

`logIn` SHALL remain reachable without a prior session and SHALL be marked in source as the intentional exception to automated auth-guard checks.

#### Scenario: logIn is callable without a prior session

- **WHEN** a client without a session submits credentials to `logIn`
- **THEN** valid credentials SHALL create a session and redirect into `/admin`
- **THEN** the action SHALL not require a pre-existing session

#### Scenario: logIn rejects invalid credentials generically

- **WHEN** either the email or password is invalid
- **THEN** the action SHALL return the same generic error without creating a session

### Requirement: Admin routes and server actions use defense in depth

`/admin/*` routes SHALL redirect anonymous visitors before protected content renders, and each privileged server action SHALL independently call `requireSession` because route navigation checks do not protect direct server-action invocations.

#### Scenario: Anonymous navigation to an admin route is redirected

- **WHEN** a request without a valid session targets an `/admin/*` route other than `/admin/login`
- **THEN** it SHALL redirect to `/admin/login` without rendering protected content

#### Scenario: Route-level checks do not protect server actions

- **WHEN** a server action is invoked directly
- **THEN** protection SHALL come from its per-action `requireSession` call

### Requirement: URL construction from configuration falls back safely

Malformed configured URL values SHALL fall back to a safe local URL instead of throwing during render.

#### Scenario: Malformed site URL does not crash rendering

- **WHEN** `NEXT_PUBLIC_SITE_URL` is missing or invalid
- **THEN** rendering SHALL use the safe default URL without an uncaught `TypeError`
