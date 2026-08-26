# ui/application-shell Specification

## Purpose
Establishes the global layout structure, organizing navigation into Dashboard, Inbox, and Agents, while isolating administrative configurations into Workspace Settings.

## Requirements

### Requirement: Workspace-scoped navigation
The UI SHALL present a top-level workspace switcher and constrain all subsequent views (Inbox, Rules, Agents) to the active workspace tenant.

#### Scenario: Switching workspaces isolates data
- **WHEN** the user switches the active workspace in the top-left menu
- **THEN** the UI reloads the Dashboard, Inbox, and Agents specific to that tenant.

### Requirement: Primary navigation pillars
The UI SHALL present Dashboard, Inbox, and Agents as the three primary operational views in the main navigation area.

#### Scenario: Accessing operations
- **WHEN** the user logs in
- **THEN** they can navigate freely between Dashboard, Inbox, and Agents without entering settings.

### Requirement: Isolated Workspace Settings
The UI SHALL house all administrative configurations (Rules, Teams, Schedules, Audit, Billing) in a dedicated Workspace Settings menu outside the operational path.

#### Scenario: Accessing configuration
- **WHEN** an admin clicks Workspace Settings
- **THEN** they are presented with administrative controls separate from the main operational views.
