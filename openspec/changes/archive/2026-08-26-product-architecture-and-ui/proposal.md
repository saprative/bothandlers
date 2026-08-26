## Why

BotHandlers requires a formalized product architecture and UI layout to support its multi-tiered SaaS model. The current vision defines the need for deterministic rule-based routing, explainability, and multi-tenancy, but lacks a cohesive definition of how AI capabilities (like agentic routing and natural language rule generation) integrate into the pricing tiers (Free, Basic, Pro, Enterprise). Furthermore, a clear application shell layout is needed to serve distinct user roles (Operators, Ops Managers, Developers) efficiently.

## What Changes

- Defines a 4-tier packaging model: Free (2 users), Basic (Manual Rules), Pro (Agentic Routing + AI config), Enterprise (SSO + FDE).
- Defines the two primary routing engines:
  - **Manual Engine**: Deterministic execution, configured via UI builder or AI-assisted prompt.
  - **Agentic Engine**: Dispatcher Agent running at runtime based on Standard Operating Procedure (SOP) prompts, with Chain-of-Thought audit logs for explainability.
- Establishes the global UI Application Shell with four primary pillars:
  - **Dashboard**: Role-based views for Operators, Managers, and Admins.
  - **Inbox**: The execution zone for handling interventions.
  - **Agents**: Registry for developers to manage AI agents, API keys, and webhook callback health.
  - **Workspace Settings**: Consolidated configuration for Rules, Teams, Schedules, Audit, and Billing, moved out of the main operational sidebar.

## Capabilities

### New Capabilities
- `product/pricing-tiers`: Defines the Free, Basic, Pro, and Enterprise feature gating.
- `routing/manual-engine`: Defines the deterministic rule-based routing engine and AI-assisted builder.
- `routing/agentic-engine`: Defines the LLM-based runtime Dispatcher Agent and SOP prompting.
- `ui/application-shell`: Defines the Workspace-first layout and primary navigation pillars.
- `ui/dashboards`: Defines the role-based dashboard metrics.
- `ui/agent-registry`: Defines the developer interface for managing connected agents.

### Modified Capabilities
- (None - these are the foundational product definitions.)

## Impact

- **UI Architecture**: Establishes the layout foundation for the Next.js frontend (`apps/web`).
- **Backend Architecture**: Validates the routing engine execution model and multi-tenant schema in DynamoDB.
- **Product Strategy**: Sets the baseline for how features will be gated and built moving forward.
