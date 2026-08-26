## Purpose

Defines what a developer can run on their own machine without any cloud account, and the parity guarantees that make local results meaningful — so the runtime behaviour the platform depends on can be exercised before it reaches a deployed environment.

## ADDED Requirements

### Requirement: The platform runs locally without cloud access

A developer SHALL be able to start a working environment from a fresh clone without a cloud account, cloud credentials, or network access to a cloud provider.

#### Scenario: A new developer starts the stack

- **WHEN** a developer clones the repository, installs dependencies, starts the local services, and runs the development command
- **THEN** the platform starts successfully with no cloud account and no configured cloud credentials

#### Scenario: Cloud credentials are absent

- **WHEN** the local environment is started on a machine with no cloud credentials configured
- **THEN** startup succeeds and no operation attempts to reach a real cloud endpoint

### Requirement: The local environment provides the platform's runtime dependencies

Starting the local environment SHALL provision every backing service the platform requires, in a state ready for use.

#### Scenario: Local services are started

- **WHEN** the local environment starts
- **THEN** the document store with its tables and indexes, the queues with their dead-letter queues, the deadline scheduler, and a mail capture surface are all available and provisioned

#### Scenario: A queue exercises its failure path locally

- **WHEN** a message fails repeatedly against a locally running consumer
- **THEN** it lands on the corresponding local dead-letter queue, matching deployed behaviour

### Requirement: Local and deployed environments differ only in configuration

The same application code SHALL run in every environment. Only endpoint and credential configuration may differ.

#### Scenario: The same build is pointed at a deployed environment

- **WHEN** the application is configured to use a deployed environment instead of the local one
- **THEN** it operates correctly with no code change and no conditional branch on environment

#### Scenario: Environment-specific code is introduced

- **WHEN** a proposed change branches application or domain logic on whether it is running locally
- **THEN** continuous integration fails

### Requirement: Local iteration does not require a deployment cycle

Routine development SHALL provide fast feedback without packaging, deploying, or emulating the serverless runtime for every change.

#### Scenario: A developer edits a request handler

- **WHEN** a developer changes handler or application code while the local environment is running
- **THEN** the change is observable without a build-and-deploy cycle

### Requirement: Seeded data makes the critical path exercisable locally

The local environment SHALL provide enough baseline data that the end-to-end intervention flow can be exercised immediately after startup.

#### Scenario: A developer seeds and exercises the flow

- **WHEN** the local environment is seeded
- **THEN** an organization, a team with members, an on-call schedule, an authority grant, and a usable agent credential exist, and an intervention can be created, routed to a responder, acknowledged, and resolved locally

### Requirement: Local notifications never reach real recipients

Notifications produced by a local environment SHALL be captured locally and MUST NOT be delivered externally.

#### Scenario: A local intervention pages a responder

- **WHEN** an intervention created locally pages its responder
- **THEN** the notification is captured and inspectable locally, and no message is delivered to a real external address

### Requirement: The local environment is disposable and reproducible

Tearing down and recreating the local environment SHALL return it to a known starting state.

#### Scenario: A developer resets their environment

- **WHEN** a developer tears down the local environment and starts it again
- **THEN** it returns to the same provisioned and seeded starting state, with no residue from the previous run

### Requirement: The local environment is not a correctness oracle for the cloud provider

Passing locally SHALL NOT be treated as sufficient evidence of correct behaviour against real cloud services.

#### Scenario: A change relies on provider-specific semantics

- **WHEN** a change depends on conditional-write contention, queue redelivery, scheduler delivery timing, or permission enforcement
- **THEN** it is additionally verified against a real deployed environment before reaching production
