## Purpose

Specifies the `/internal` management portal, layout, and authentication flow used by operators to resolve interventions.

## ADDED Requirements

### Requirement: Internal Portal Layout
The system SHALL expose an `/internal` route serving a dedicated layout for business operators to review and manage AI interventions.

#### Scenario: Operator accesses the portal
- **WHEN** an authenticated operator navigates to `/internal`
- **THEN** they see the management dashboard rendered with the shared UI atoms and molecules

### Requirement: Authentication Flow
The internal portal SHALL require users to authenticate before accessing any management views or actions.

#### Scenario: Unauthenticated access attempt
- **WHEN** an unauthenticated user visits `/internal`
- **THEN** they are redirected to a login page

#### Scenario: Successful login
- **WHEN** a user provides valid credentials on the login page
- **THEN** they are redirected to the `/internal` dashboard

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks "Logout"
- **THEN** their session is terminated and they are redirected to the login page
