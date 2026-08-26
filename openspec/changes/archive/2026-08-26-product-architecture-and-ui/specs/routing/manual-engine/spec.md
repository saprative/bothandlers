## Purpose

Executes rigid, deterministic routing policies using exact condition matching to ensure 100% predictable and explainable routing for all tiers.

## ADDED Requirements

### Requirement: Deterministic rule evaluation
The system SHALL evaluate interventions against configured JSON/YAML rules and strictly apply matching routing actions (Team, SLA, Escalation).

#### Scenario: Rule match routes intervention
- **WHEN** an intervention's topic and amount match a configured rule condition
- **THEN** the system routes the intervention to the specified target team and starts the defined SLA timer.

### Requirement: AI-Assisted Rule Compilation
The system SHALL allow users to generate deterministic rule configurations by submitting natural language prompts.

#### Scenario: Prompt compiles to deterministic rule
- **WHEN** a user describes a routing policy in English
- **THEN** the system returns a valid, deterministic rule block for review before saving.
