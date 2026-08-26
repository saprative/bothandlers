## Why

The marketing site was originally planned with a forced dark "vibe tech" aesthetic. However, to maximize accessibility and cater to user preferences, the site needs to support both light and dark modes, allowing users to toggle between them.

## What Changes

- Add a theme toggle component (sun/moon icon) to the marketing site navigation.
- Implement light mode styles in Tailwind CSS alongside the existing dark mode styles.
- Persist the user's theme preference using `next-themes` or local storage.

## Capabilities

### New Capabilities
- `marketing/theme-toggle`: The ability for users to switch between light and dark modes on the marketing site.

### Modified Capabilities
- None

## Impact

- `apps/web`: Will add `next-themes` (or similar) and require updating Tailwind classes to support both `dark:` and default (light) variants across the marketing page.
