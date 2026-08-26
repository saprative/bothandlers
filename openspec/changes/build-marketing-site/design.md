## Context

See `proposal.md` for the motivation. The `apps/web` application is currently a Next.js (App Router) frontend intended for the application dashboard. We are modifying the root path (`/`) to serve the public-facing marketing page, while moving authenticated dashboard routes under `/dashboard`.

## Goals / Non-Goals

**Goals:**
- Build a responsive, fast-loading Next.js landing page at `app/page.tsx`.
- Implement a dark, modern "vibe tech" aesthetic utilizing Tailwind CSS.
- Ensure zero impact on existing authentication or API routes.

**Non-Goals:**
- We are not building a CMS (Content Management System) for the marketing site right now; content will be hardcoded in React components.
- We are not building complex animations (e.g., Three.js WebGL); we will rely on CSS and standard React Framer Motion (if needed) for simple vibe aesthetics.

## Decisions

- **Tailwind CSS for Styling:** We will use Tailwind CSS with dark mode forced (`dark` class on root or dark-specific utility classes) to achieve the desired aesthetic without importing massive UI libraries.
- **Root Layout Routing:** The `app/page.tsx` will act as the public landing page. The application dashboard will eventually live in `app/dashboard/layout.tsx`.
- **Aesthetic Approach:** Inspired by `robobrainstorm.com`, we will use deep blacks/grays, high-contrast neon accents, glowing text/borders, and monospace technical fonts to convey the "AI routing engine" feel.

## Risks / Trade-offs

- **Risk:** Bloating the Next.js bundle for authenticated users with marketing assets (images, heavy fonts).
  - **Mitigation:** We will keep the marketing page lightweight and utilize Next.js Image components for optimized delivery.
