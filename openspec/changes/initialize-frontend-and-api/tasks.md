## 1. Application Initialization

- [x] 1.1 Remove empty placeholders for `apps/web` and `apps/docs`
- [x] 1.2 Initialize Next.js App Router in `apps/web` (no interactive prompt)
- [x] 1.3 Initialize Docusaurus application in `apps/docs` for snapshot versioning
- [x] 1.4 Update root `package.json` and application scripts to explicitly bind development servers: Web to `8080` and Docs to `8002`

## 2. Atomic Design System Configuration

- [x] 2.1 Initialize `packages/ui` as a shared dependency for the workspace
- [x] 2.2 Install shadcn/ui and Radix UI primitives into `packages/ui`
- [x] 2.3 Export a unified Tailwind preset (or globals.css) from `packages/ui` to be consumed by `apps/web` and `apps/docs`
- [x] 2.4 Add a Next-Themes `ThemeProvider` in `apps/web` for dark/light mode toggling

## 3. Internal Management Portal

- [x] 3.1 Scaffold `apps/web/src/app/internal` layout establishing a distinct internal administration look and feel
- [x] 3.2 Create the login page at `apps/web/src/app/internal/login/page.tsx`
- [x] 3.3 Implement mock authentication flow context to support login, session state, and logout actions
- [x] 3.4 Create the main `/internal` dashboard displaying a placeholder for intervention queues

## 4. Local API Wrapper

- [x] 4.1 Install `@hono/node-server`, `hono`, and `cors` in `backend/api`
- [x] 4.2 Create a local development entry point (`index.ts`) in `backend/api` that mounts the API routes to Hono
- [x] 4.3 Configure CORS middleware on the Hono server to accept requests from `http://localhost:8080`
- [x] 4.4 Update `backend/api/package.json` to run `tsx watch index.ts` and ensure the local server binds to port `8001`
