## Why

The current repository contains empty package scaffolding for the frontend applications (`web`, `docs`) and the `api`. We need to initialize these applications with a concrete framework and design system. By adopting the Atomic Design principles and UI primitives (shadcn/ui, Radix) used in our previous projects (like RoboBrainstorm), we ensure a consistent, maintainable, and high-quality user experience. We also need to establish local development ports and an internal management portal with authentication to manage interventions.

## What Changes

- Initialize `apps/web` with Next.js (or Vite), Tailwind CSS, and shadcn/ui.
- Initialize `packages/ui` as the atomic design system core.
- Initialize `apps/docs` with Docusaurus to support snapshot-style documentation versioning.
- Set up the local backend API server (e.g., using Hono) to serve the existing placeholder Lambda handlers.
- Configure local development ports: Web (8080), API (8001), Docs (8002).
- Build the `/internal` management portal in the web app, featuring a similar look and feel to the `rb` project, including full login and logout flows.

## Capabilities

### New Capabilities

- `frontend/design-system`: Defines the Atomic Design hierarchy, theming, and UI primitives.
- `frontend/internal-management`: Specifies the internal portal, layout, and authentication (login/logout) flows.
- `deployment/local-servers`: Defines local HTTP server wrappers and port allocations for Web (8080), API (8001), and Docs (8002).

### Modified Capabilities

- None

## Impact

- `apps/web`, `apps/docs`, and `packages/ui` will transition from empty scaffolds to functional framework applications.
- `backend/api` will gain a local development server runner for port 8001.
- `package.json` scripts across the monorepo will be updated to start these services on their respective ports.
