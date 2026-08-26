## Purpose

Defines the non-negotiable reliability, isolation, and structural properties the BotHandlers platform must hold regardless of how any individual feature is implemented. Every other capability is built inside these constraints.

## ADDED Requirements

### Requirement: An intervention is never silently lost

The system SHALL ensure that every accepted intervention reaches a terminal state through an observable path. Failure to route, notify, or resolve MUST produce an alarm and an audit record, never silence.

#### Scenario: No eligible responder can be found

- **WHEN** routing completes with zero eligible candidates and the escalation policy has no remaining level
- **THEN** the intervention transitions to a terminal expired state, organization administrators are notified, the originating agent receives an expiry callback, and an alarm is raised

#### Scenario: Asynchronous processing fails repeatedly

- **WHEN** a message for an intervention exhausts its retry budget
- **THEN** it is placed on a dead-letter queue that is inspectable and replayable, and its depth raises an alarm

### Requirement: A human decision is never silently lost

Once a decision is accepted it SHALL be durably recorded before any delivery is attempted, and SHALL remain retrievable regardless of delivery outcome.

#### Scenario: The agent's callback endpoint is unavailable

- **WHEN** delivery of a recorded decision fails on every scheduled attempt
- **THEN** the delivery is marked abandoned, an alarm is raised, organization administrators are notified, and the decision remains retrievable through the API and available for manual replay

#### Scenario: Delivery is attempted before the decision is committed

- **WHEN** a decision is submitted
- **THEN** no outbound delivery is enqueued until the decision is durably persisted

### Requirement: Concurrent human actions resolve to exactly one outcome

When two humans act on the same intervention simultaneously, the system SHALL accept exactly one action and reject the other deterministically.

#### Scenario: Two operators submit a decision at the same time

- **WHEN** two authorized operators submit decisions for the same intervention concurrently
- **THEN** exactly one decision is recorded, exactly one callback is delivered, and the losing operator receives a conflict response identifying the current state and who resolved it

#### Scenario: Two operators acknowledge at the same time

- **WHEN** two operators acknowledge the same paged intervention concurrently
- **THEN** exactly one acknowledgement is recorded and the other receives a conflict response

### Requirement: Duplicate asynchronous delivery is tolerated

Every asynchronous consumer SHALL produce the same end state whether a message is delivered once or many times.

#### Scenario: The same message is delivered twice

- **WHEN** an asynchronous consumer receives an identical message a second time
- **THEN** the resulting state is unchanged from a single delivery, no duplicate side effect is produced, and the redelivery is treated as success rather than error

#### Scenario: A message arrives for an already-cancelled intervention

- **WHEN** a queued message is processed after its intervention was cancelled
- **THEN** the consumer performs no state change and completes successfully

### Requirement: Stale and duplicate timers are tolerated

A scheduled deadline SHALL be harmless when it fires late, twice, or after the situation it was scheduled for has already resolved.

#### Scenario: An acknowledgement deadline fires after acknowledgement

- **WHEN** an acknowledgement deadline fires for an intervention that has already been acknowledged
- **THEN** no escalation occurs and the event is recorded as a no-op

#### Scenario: A superseded deadline fires after manual escalation

- **WHEN** a deadline scheduled for an earlier escalation attempt fires after the intervention has already advanced to a later responder
- **THEN** no escalation occurs, and the responder currently paged retains their full acknowledgement window

### Requirement: Every tenant-owned operation is organization scoped

Tenant boundaries SHALL be security boundaries. Every tenant-owned resource belongs to exactly one organization, and access outside that organization MUST be impossible.

#### Scenario: A caller requests a resource belonging to another organization

- **WHEN** an authenticated caller requests an intervention that belongs to a different organization
- **THEN** the request fails as not found, and no attribute of the resource is disclosed

#### Scenario: A caller attempts to mutate another organization's resource

- **WHEN** an authenticated caller submits a mutation targeting a resource in a different organization
- **THEN** the mutation is rejected and no state changes

### Requirement: Business logic is not duplicated across transports

All entry surfaces SHALL exercise the same underlying behavior. A given operation MUST produce identical validation, outcome, and audit results regardless of the transport used to invoke it.

#### Scenario: The same operation is invoked over different transports

- **WHEN** an equivalent intervention request is made over the REST API and over the agent tool surface
- **THEN** both produce the same validation errors for invalid input, the same resulting state for valid input, and the same audit events

### Requirement: The domain layer is free of infrastructure and framework dependencies

Business logic SHALL NOT depend on cloud provider SDKs, HTTP frameworks, serverless runtime types, local emulator libraries, or any agent framework. This constraint MUST be enforced mechanically rather than by review.

#### Scenario: A change introduces a forbidden dependency

- **WHEN** a proposed change adds an import of a cloud provider SDK, HTTP framework, runtime event type, or agent framework into the domain layer
- **THEN** continuous integration fails with an explicit boundary violation

#### Scenario: A published SDK reaches into backend internals

- **WHEN** a proposed change makes an SDK package import backend implementation code rather than the public contract
- **THEN** continuous integration fails with an explicit boundary violation

### Requirement: The platform remains agent-framework-neutral

Support for any agent framework SHALL be provided as an adapter over the public interfaces. Adding, changing, or removing a framework integration MUST NOT require a change to business logic.

#### Scenario: A new agent framework integration is added

- **WHEN** an integration for a previously unsupported agent framework is added
- **THEN** it is implemented entirely against the public API, SDK, or tool surface, and no domain code is modified

### Requirement: The local development emulator is replaceable

Application and domain code SHALL be unaware of the local emulator. The only permitted difference between local and deployed environments is endpoint and credential configuration.

#### Scenario: Emulator-specific code is introduced

- **WHEN** a proposed change imports an emulator-specific library or API outside local infrastructure configuration
- **THEN** continuous integration fails with an explicit boundary violation

#### Scenario: The same code runs against local and real infrastructure

- **WHEN** the system is pointed at a real cloud environment instead of the local emulator
- **THEN** it operates without code changes, using only different endpoint and credential configuration

### Requirement: Deployments remain compatible with in-flight work

Because an intervention may remain unresolved for hours, a deployment mid-lifecycle SHALL be normal. State written by one version MUST be readable by the next, and a deadline scheduled by one version MUST be handled by the next.

#### Scenario: A queued message was produced by a previous version

- **WHEN** a consumer receives a message carrying an older payload version
- **THEN** it processes the message correctly rather than failing or discarding it

#### Scenario: An intervention spans a deployment

- **WHEN** an intervention is created before a deployment and resolved after it
- **THEN** the intervention resolves normally and its audit trail remains continuous
