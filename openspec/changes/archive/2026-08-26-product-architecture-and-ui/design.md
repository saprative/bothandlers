## Context

See `proposal.md` for the motivation behind establishing this UI and routing architecture. This design outlines how the theoretical concepts from the proposal and specs translate into application constraints and layout topologies.

## Goals / Non-Goals

**Goals:**
- Establish the physical UI topology for the Next.js frontend (global layout, workspace switcher, sidebars).
- Define the system boundaries between the Deterministic and Agentic routing engines.
- Map the pricing tiers to capability toggles within the application state.

**Non-Goals:**
- Implementing the DynamoDB schema for routing rules (deferred to a backend-specific change).
- Implementing the LLM prompts for the Agentic engine (this change just defines that the engine exists).
- Final visual polish or CSS implementation.

## Decisions

### Workspace-First UI Topology
- **Rationale:** To enforce strict multi-tenant isolation, the UI will employ a workspace-switcher at the top left of the application shell. All subsequent routes (`/dashboard`, `/inbox`, `/agents`, `/settings`) will be implicitly scoped to the active tenant in the UI state.
- **Alternatives Considered:** A global inbox across all workspaces. Rejected because it risks cross-tenant data spillage and complicates SLA tracking for users belonging to multiple distinct organizations.

### Navigation Hierarchy
- **Rationale:** The application will use a left-hand sidebar containing three primary operational pillars: Dashboard, Inbox, and Agents. Configuration (Workspace Settings) will be moved to a context menu under the workspace name. This minimizes clutter and focuses the operator on execution.
- **Alternatives Considered:** Placing 'Settings' directly in the main sidebar. Rejected because it distracts from the core inbox workflow and is accessed infrequently.

### Agentic Routing via System Prompts
- **Rationale:** To maintain explainability while offering dynamic routing, the Agentic Engine will execute at runtime but will be forced to emit a Chain-of-Thought (CoT) string into the audit log before outputting the final routing JSON.
- **Alternatives Considered:** Using AI to pre-compile all rules and running purely deterministically. Accepted for the Pro tier "AI-Assisted" builder, but we still need the runtime Agentic engine for the Enterprise tier to handle edge cases that cannot be captured in a rigid AST.

## Risks / Trade-offs

- **Risk:** The Agentic Engine may hallucinate a route that violates compliance limits.
  - **Mitigation:** The Agentic Engine will be treated as a "Fallback Dispatcher." Hard constraints (e.g., maximum approval amounts for a user) will still be enforced by the core system *after* the Agentic Engine makes its recommendation. If the Agent recommends a prohibited route, the system rejects it and escalates.

- **Risk:** Operators miss urgent interventions because they are looking at the Dashboard.
  - **Mitigation:** A global notification center (bell icon) will be present in the top-right header across all views to surface SLA warnings and new assignments.
