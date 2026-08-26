## Context

The repository contains empty application scaffolding. We need to implement concrete web and documentation applications while standing up a local API server capable of running the backend Lambdas in a local Node process. See proposal.md for motivation. We will adhere to the Atomic Design system rules defined in `~/Code/rb/DESIGN.md`.

## Goals / Non-Goals

**Goals:**
- Initialize `apps/web` with Next.js App Router, Tailwind CSS, and shadcn/ui configured for dark/light mode.
- Establish the `/internal` layout and authentication routes for internal management.
- Initialize `packages/ui` as a shared design system library.
- Provide local development wrappers binding to ports 8080 (Web), 8001 (API), and 8002 (Docs).

**Non-Goals:**
- Finalizing the actual business logic of the intervention workflows in the UI (just the scaffolding and login/logout).
- Moving the backend away from Lambda (the local API wrapper is purely for `pnpm dev`).

## Decisions

**1. Frontend Framework: Next.js App Router**
- *Rationale*: Standard for modern React applications. Provides native layouts for `/internal` separation and built-in CSS/Tailwind support.
- *Alternatives Considered*: Vite + React (rejected due to missing file-based routing and layout features out-of-the-box).

**2. Design System: Shadcn/UI + Tailwind**
- *Rationale*: Adheres to the `rb` project's Atomic Design principles. `packages/ui` will export atoms/primitives, which `apps/web` will compose into molecules and organisms.

**3. Local API Wrapper: Hono Node Server**
- *Rationale*: Since BotHandlers uses Hono internally on Lambda (as per `architecture.md`), using `@hono/node-server` is the closest fidelity local wrapper to run the API on port 8001.

**4. Port Assignments**
- *Rationale*: Set directly in `package.json` scripts:
  - Web: `next dev -p 8080`
  - Docs: `npm run start -- --port 8002` (Docusaurus default setup adapted for 8002)
  - API: Configured in `backend/api/index.ts` to listen on `8001` when running locally via `tsx`.

## Risks / Trade-offs

- **Risk:** Cross-Origin Resource Sharing (CORS) errors during local development between Web (8080) and API (8001).
  - *Mitigation:* The local API wrapper MUST explicitly configure CORS middleware to permit requests from `http://localhost:8080`.
- **Risk:** Tokens in `apps/web` diverge from `apps/docs`.
  - *Mitigation:* Ensure `packages/ui` exposes a shared `globals.css` or Tailwind preset that both apps import.
