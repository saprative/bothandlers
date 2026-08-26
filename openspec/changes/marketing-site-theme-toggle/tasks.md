## 1. Setup

- [x] 1.1 Install `next-themes` dependency in `apps/web`.
- [x] 1.2 Update `tailwind.config.ts` in `apps/web` to include `darkMode: 'class'`.

## 2. Core Implementation

- [x] 2.1 Create a `ThemeProvider` component wrapping `next-themes` in `apps/web/components/theme-provider.tsx`.
- [x] 2.2 Wrap the root layout (`app/layout.tsx`) in the `ThemeProvider`.
- [x] 2.3 Create a `ThemeToggle` UI component (with sun/moon icons) in `apps/web/components/theme-toggle.tsx`.

## 3. UI Integration

- [x] 3.1 Place the `ThemeToggle` component into the marketing site's header navigation.
- [x] 3.2 Review and update existing Tailwind classes on the landing page to ensure appropriate fallback (light) styles alongside `dark:` styles for high contrast readability.
