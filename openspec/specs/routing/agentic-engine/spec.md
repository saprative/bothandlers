# routing/agentic-engine Specification

## Purpose
Provides dynamic, prompt-driven routing using a Dispatcher Agent that evaluates interventions at runtime against natural language Standard Operating Procedures (SOPs).

## Requirements

### Requirement: Runtime Agentic Dispatch
The system SHALL evaluate interventions using an LLM-based Dispatcher Agent that reads the Ops Manager's SOP prompt and utilizes directory tools to make routing decisions.

#### Scenario: Agentic routing decision
- **WHEN** the manual rules fail to match and the Agentic engine is enabled
- **THEN** the Dispatcher Agent reads the SOP, checks directory tools, and assigns the intervention.

### Requirement: Chain-of-Thought Audit Log
The Dispatcher Agent SHALL write its reasoning to the intervention audit trail prior to executing the route, ensuring explainability.

#### Scenario: Dispatcher logs rationale
- **WHEN** the Dispatcher Agent routes an intervention
- **THEN** the audit log must contain a clear, plain-language rationale referencing the directory data and SOP rule that drove the decision.
