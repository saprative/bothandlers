## Purpose

Defines how infrastructure and application code reach a deployed environment: reproducibly, with short-lived credentials, isolated per environment, previewed before applied, gated on verification, and reversible.

## ADDED Requirements

### Requirement: All infrastructure is reproducible from source

Every deployed resource SHALL originate from committed infrastructure definitions. Manually created production infrastructure MUST NOT persist unrecorded.

#### Scenario: An environment is rebuilt from a commit

- **WHEN** an environment is provisioned from a given commit into an empty account
- **THEN** it produces the intended resource topology without manual steps

#### Scenario: A resource is changed outside the pipeline

- **WHEN** a deployed resource is modified directly rather than through the pipeline
- **THEN** drift is detected and reported against the expected definition

### Requirement: Deployment uses short-lived credentials

The release process SHALL authenticate to the cloud provider using short-lived, federated credentials. Long-lived provider access keys MUST NOT be stored in the repository or its configuration.

#### Scenario: A deployment runs

- **WHEN** the pipeline deploys to any environment
- **THEN** it obtains temporary credentials by assuming a role through federated identity, and those credentials expire when the run completes

#### Scenario: A long-lived key is introduced

- **WHEN** a proposed change adds a long-lived provider access key to repository configuration or secrets
- **THEN** the change is rejected

### Requirement: Environments are isolated from one another

A deployment SHALL be able to affect only the environment it targets.

#### Scenario: A deployment targets one environment

- **WHEN** a run deploying a non-production environment attempts to read or modify a production resource
- **THEN** the attempt is denied by the permissions attached to that run

#### Scenario: Environment resources are distinguishable

- **WHEN** resources exist for multiple environments
- **THEN** each resource is unambiguously attributable to exactly one environment

### Requirement: Changes are previewed before they are applied

An infrastructure change SHALL be reviewable before it takes effect.

#### Scenario: A pull request changes infrastructure

- **WHEN** a pull request modifies infrastructure definitions
- **THEN** the resulting resource diff is produced and visible on the pull request, and no change is applied to any environment

#### Scenario: A preview fails

- **WHEN** the preview cannot be produced
- **THEN** the pull request is reported as failing rather than passing silently

### Requirement: Production is gated on verification and explicit approval

A production deployment SHALL occur only after the change has been deployed to and verified in a pre-production environment, and only after a human has approved it.

#### Scenario: A change is promoted

- **WHEN** a change merges to the main branch
- **THEN** it deploys to the development environment, then the staging environment, then the staging end-to-end verification runs, and production waits for an explicit human approval

#### Scenario: Staging verification fails

- **WHEN** the staging end-to-end verification fails
- **THEN** the production deployment does not proceed and the failure is reported

#### Scenario: Approval is not granted

- **WHEN** no approver acts on a pending production deployment
- **THEN** production remains unchanged

### Requirement: Every deployed function runs with least-privilege permissions

Each function SHALL hold only the permissions its responsibility requires.

#### Scenario: A function exceeds its responsibility

- **WHEN** the notification function attempts to modify intervention state beyond writing audit records
- **THEN** the attempt is denied by its permissions

#### Scenario: A runtime attempts to alter the audit record

- **WHEN** any deployed runtime attempts to update or delete an existing audit event
- **THEN** the attempt is denied by its permissions, independently of application code

#### Scenario: Permissions are widened

- **WHEN** a proposed change grants a function broad or wildcard permissions
- **THEN** the change is flagged for explicit review

### Requirement: Destructive infrastructure changes require explicit review

A change that would delete or replace a stateful resource SHALL NOT proceed unnoticed.

#### Scenario: A change would replace a data store

- **WHEN** a preview shows that applying a change would delete or replace a table, queue, or scheduler group
- **THEN** the change is surfaced as destructive and requires explicit approval before it is applied

### Requirement: A release can be reverted

Restoring the previously deployed state SHALL be a supported, exercised path rather than an improvised one.

#### Scenario: A deployment must be undone

- **WHEN** a deployment is identified as bad
- **THEN** redeploying the last known-good commit through the same pipeline restores the previous state

#### Scenario: A deployment fails partway

- **WHEN** a deployment fails during application
- **THEN** the failure is reported with the affected resources identified, and the environment is left in a state the pipeline can act on

### Requirement: Environment cost is observable and bounded

Each environment SHALL report its spend and raise an alarm before cost becomes a surprise.

#### Scenario: Spend crosses a threshold

- **WHEN** an environment's spend crosses its configured budget threshold
- **THEN** an alarm is raised identifying the environment
