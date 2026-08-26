## Purpose

Defines the local HTTP server configurations and port allocations for local development of the frontend and backend applications.

## ADDED Requirements

### Requirement: Local Port Allocations
The local development environment SHALL assign and configure fixed ports for primary services to avoid collisions and simplify cross-service requests.

#### Scenario: Running the local web application
- **WHEN** `pnpm dev` is run for the web application
- **THEN** the local server binds to and serves traffic on port `8080`

#### Scenario: Running the local API
- **WHEN** `pnpm dev` is run for the backend API
- **THEN** the local server (wrapping Lambda handlers in a local framework like Hono or Express) binds to and serves traffic on port `8001`

#### Scenario: Running the local documentation site
- **WHEN** `pnpm dev` is run for the docs application
- **THEN** the local server binds to and serves traffic on port `8002`
