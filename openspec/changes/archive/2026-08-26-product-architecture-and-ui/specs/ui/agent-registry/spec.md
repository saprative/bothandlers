## Purpose

Provides a centralized interface for developers and operators to manage AI agent credentials, monitor webhook delivery status, and track agent-specific override rates.

## ADDED Requirements

### Requirement: Agent registration and credential management
The UI SHALL allow authorized users to register new AI agents and issue/revoke scoped API keys.

#### Scenario: Revoking a rogue agent
- **WHEN** an admin disables a registered agent
- **THEN** the agent's API keys are immediately revoked and it can no longer submit interventions.

### Requirement: Callback delivery monitoring
The UI SHALL display the delivery status and HTTP response codes for the structured decision callbacks sent back to the agent.

#### Scenario: Debugging a dropped decision
- **WHEN** an agent's webhook server is down
- **THEN** the UI displays the retry state and error codes (e.g., 503) so developers can troubleshoot.

### Requirement: Agent-level analytics
The UI SHALL display specific performance metrics for each registered agent, including intervention volume and human override rates.

#### Scenario: Identifying a failing agent prompt
- **WHEN** an operator views the agent registry
- **THEN** they can see if a specific agent has a high human override rate, indicating its prompt needs adjustment.
