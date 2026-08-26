## Context

The initial marketing site design assumed a forced dark mode aesthetic. We need to introduce a theme toggle. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Implement a theme toggle using `next-themes`.
- Update Tailwind CSS usage to support both default (light) and `dark:` variants.

**Non-Goals:**
- We are not adding custom themes beyond light and dark.

## Decisions

- **`next-themes` Integration:** We will use `next-themes` wrapped in a client-side provider to handle the system preference detection and manual override without hydration mismatch issues.
- **Tailwind Configuration:** Tailwind will be configured to use `darkMode: 'class'`, which aligns with `next-themes`.
- **UI Component:** A standard Radix UI or custom SVG sun/moon toggle will be placed in the marketing site header.

## Risks / Trade-offs

- **Risk:** Flash of unstyled content (FOUC) on initial load before the client-side JS executes.
  - **Mitigation:** `next-themes` injects a script into the `<head>` to set the class synchronously before React hydration, preventing FOUC.
