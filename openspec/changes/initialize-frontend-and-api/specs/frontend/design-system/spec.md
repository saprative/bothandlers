## Purpose

Defines the Atomic Design system hierarchy and UI primitives used to ensure visual consistency across all frontend surfaces (web, docs, internal tools).

## ADDED Requirements

### Requirement: Atomic Design Principles
The frontend SHALL enforce a strict separation of components into Atoms, Molecules, Organisms, Templates, and Pages as defined in the atomic design methodology.

#### Scenario: Developer creates a new basic UI primitive
- **WHEN** a developer adds a button, icon, or typography component
- **THEN** it MUST be placed in `packages/ui/src/` and remain free of any business logic

#### Scenario: Developer creates a complex feature block
- **WHEN** a developer creates a feature block integrating data fetching
- **THEN** it MUST be placed in `apps/web/src/components/[feature]/` as an Organism

### Requirement: UI Primitives and Theming
The design system SHALL utilize Shadcn/UI and Radix primitives wrapped in a unified Tailwind CSS theme supporting both dark and light modes.

#### Scenario: Switching to dark mode
- **WHEN** the user toggles the global theme to dark mode
- **THEN** all components across `apps/web` and `apps/docs` MUST automatically respect the Tailwind semantic color tokens for dark mode
