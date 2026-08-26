## Purpose

Defines how human and agent callers prove who they are, how the organization a request operates in is determined, and how identity providers stay replaceable without affecting authorization behavior.

## ADDED Requirements

### Requirement: Human and agent authentication remain separate

The system SHALL treat human credentials and agent credentials as distinct mechanisms with distinct capabilities. Neither MUST be able to acquire the other's privileges.

#### Scenario: An agent credential is used for a human-only operation

- **WHEN** a caller presents an agent credential to an operation reserved for human operators, such as submitting a decision
- **THEN** the request is rejected as forbidden and no state changes

#### Scenario: A human credential is used for an agent-only operation

- **WHEN** a caller presents a human credential to an operation reserved for registered agents
- **THEN** the request is rejected as forbidden

#### Scenario: An agent credential cannot assume a human role

- **WHEN** an agent credential is presented
- **THEN** the resulting authorization context carries agent identity and scopes only, and carries no human role assignment

### Requirement: Tenant identity is derived from the credential

The organization a request operates in SHALL be determined by the authenticated credential. A client-supplied organization identifier MUST never widen or redirect access.

#### Scenario: A request payload names a different organization

- **WHEN** an authenticated caller submits a request whose body or parameters name an organization other than the one their credential establishes
- **THEN** the caller's own organization is used, or the request is rejected, and under no circumstance is the named organization accessed

#### Scenario: No credential is presented

- **WHEN** a request arrives without a valid credential
- **THEN** it is rejected as unauthenticated and no tenant context is established

### Requirement: Agent credentials bind organization, agent, environment and scope

Each agent credential SHALL resolve to exactly one organization, one registered agent, one environment, and an explicit set of permitted operations.

#### Scenario: A test credential is used

- **WHEN** an intervention is created with a test-environment credential
- **THEN** the intervention is marked as test-mode, no real human is paged, and no live notification is dispatched

#### Scenario: A credential is used outside its scope

- **WHEN** an agent credential is presented to an operation outside its permitted scopes
- **THEN** the request is rejected as forbidden

#### Scenario: A credential is revoked

- **WHEN** a credential is revoked and subsequently presented
- **THEN** the request is rejected as unauthenticated

### Requirement: Identity providers are interchangeable

Human identity SHALL be accepted from any standards-compliant OIDC provider. Adding, replacing, or removing a provider MUST NOT change authorization behavior or require changes to business logic.

#### Scenario: An additional identity provider is enabled

- **WHEN** an organization enables a new OIDC provider
- **THEN** users authenticating through it receive exactly the roles, memberships, and authority their BotHandlers records grant, identical to users of any other provider

#### Scenario: An identity provider asserts privileges

- **WHEN** an identity provider's token carries claims describing roles, groups, or entitlements
- **THEN** those claims do not grant any BotHandlers permission; authorization is determined solely by BotHandlers' own membership, role, and authority records

### Requirement: A user may belong to multiple organizations

A person SHALL be able to hold membership in more than one organization, but every request SHALL operate within exactly one active organization.

#### Scenario: A multi-organization user makes a request

- **WHEN** a user holding membership in two organizations makes an authenticated request
- **THEN** the request resolves to exactly one active organization, and resources belonging to the other are not visible in any response

#### Scenario: A user switches active organization

- **WHEN** a user switches to another organization in which they hold membership
- **THEN** their permissions are re-derived from that organization's membership records, and permissions from the previous organization do not carry over

#### Scenario: A user targets an organization they do not belong to

- **WHEN** a user attempts to establish an active organization in which they hold no membership
- **THEN** the request is rejected and no context is established

### Requirement: Platform permission and business authority are evaluated separately

The system SHALL evaluate whether a user may perform a platform operation independently from whether that user is empowered to make the underlying business decision. Both MUST pass, and each failure MUST be distinguishable.

#### Scenario: A user has permission but lacks authority

- **WHEN** an operator permitted to view and acknowledge interventions submits a decision exceeding their granted approval limit
- **THEN** the submission is rejected specifically as insufficient authority, distinctly from a permission denial, with a message stating their limit and the amount required

#### Scenario: A user has authority but lacks permission

- **WHEN** a user whose role does not permit submitting decisions attempts to submit one, despite holding sufficient business authority
- **THEN** the submission is rejected as a permission failure

#### Scenario: Authority is withdrawn while an intervention is open

- **WHEN** a user's business authority is revoked after they were assigned an intervention but before they submit a decision
- **THEN** their submission is rejected as insufficient authority and the intervention is re-routed rather than recording an unauthorized decision

### Requirement: Credential material is never exposed

Secret credential material SHALL be presented to the user exactly once at creation and MUST NOT be retrievable, loggable, or observable thereafter.

#### Scenario: A credential is created

- **WHEN** an API credential is created
- **THEN** the secret is returned once in that response and is not retrievable by any subsequent request

#### Scenario: An error or audit record is produced for a credentialed request

- **WHEN** a request fails or produces an audit record
- **THEN** no credential secret appears in the error response, logs, or audit payload
