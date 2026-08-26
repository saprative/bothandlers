# ui/dashboards Specification

## Purpose
Presents customized, role-aware analytics to help Operators track shifts, Managers balance workloads, and Admins monitor overall automation health.

## Requirements

### Requirement: Role-aware dashboard presentation
The system SHALL alter the metrics and focus of the Dashboard based on the authenticated user's assigned role.

#### Scenario: Operator views dashboard
- **WHEN** a user with the Operator role views the dashboard
- **THEN** they see their active shifts, personal SLA timers, and open assigned interventions.

#### Scenario: Manager views dashboard
- **WHEN** a user with the Manager role views the dashboard
- **THEN** they see team queue backlogs, online members, and approaching SLA breaches for their team.

#### Scenario: Admin views dashboard
- **WHEN** a user with the Admin role views the dashboard
- **THEN** they see organization-wide metrics including AI automation rates and MTTR across all teams.
