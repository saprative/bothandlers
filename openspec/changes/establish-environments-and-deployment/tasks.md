## 1. Shared resource definitions

- [x] 1.1 Create a shared module declaring every table name, key schema, and index definition, with no logic beyond shape declarations (design.md D5)
- [x] 1.2 Extend it with the five queue definitions, their dead-letter queues, visibility timeouts, and redrive policies
- [x] 1.3 Add the scheduler group and the environment-prefixed resource naming helper
- [x] 1.4 Confirm the dependency-boundary rules treat the module as configuration and reject logic added to it

## 2. Local environment

- [x] 2.1 Write `infra/local/docker-compose.yml` running Floci with the document store, queues, scheduler, mail capture, and metrics APIs
- [x] 2.2 Write a bootstrap script that provisions tables, indexes, queues, dead-letter queues, and the scheduler group by consuming the shared module from task 1
- [x] 2.3 Add `.env.example` and local configuration so the application targets the emulator through endpoint configuration only, with no environment branching in application code
- [x] 2.4 Write a seed script creating a demo organization, team with members, on-call schedule, authority grant, escalation policy, and a usable agent credential
- [x] 2.5 Add `local:up`, `local:down`, `local:bootstrap`, `local:seed`, and `local:reset` scripts to the workspace root
- [x] 2.6 Wire `pnpm dev` to run handlers as ordinary Node processes with reload, not emulated functions
- [x] 2.7 Verify the full loop on a clean machine: clone, install, compose up, bootstrap, seed, dev — with no cloud credentials present
- [x] 2.8 Verify a locally paged notification is captured locally and never sent externally
- [x] 2.9 Verify teardown and recreation returns an identical starting state

## 3. Bootstrap stack

- [x] 3.1 Write a `bootstrap` Pulumi stack creating the versioned, encrypted state bucket and a KMS key per environment
- [x] 3.2 Add the GitHub OIDC identity provider to the stack
- [x] 3.3 Add one deploy role per environment, each trust policy conditioned on the full subject claim including the GitHub Environment, not a repository wildcard (design.md D3)
- [x] 3.4 Apply the bootstrap stack once with elevated credentials and migrate its state into the bucket it created
- [x] 3.5 Document the bootstrap procedure, including that it is a one-time privileged step and how to re-run it for a new account

## 4. Infrastructure components

- [x] 4.1 Write the DynamoDB component creating every table and index from the shared module, with point-in-time recovery enabled and per-environment retention settings
- [x] 4.2 Write the messaging component creating each queue with its dead-letter queue, visibility timeout, and redrive policy
- [x] 4.3 Write the scheduler component creating the deadline scheduler group
- [x] 4.4 Write the function component with per-function memory, timeout, and concurrency configuration
- [x] 4.5 Write per-function least-privilege roles, including the explicit deny on updating or deleting audit events for every runtime role
- [x] 4.6 Write the API Gateway component and wire the request-handling and tool-surface functions to it
- [x] 4.7 Wire event source mappings from each queue to its consumer function, and the scheduler to the escalation function
- [x] 4.8 Add CloudWatch alarms for dead-letter queue depth, oldest message age, and function errors
- [x] 4.9 Add a per-environment budget with a spend alarm

## 5. Placeholder handlers

- [x] 5.1 Add health-response placeholder handlers for all seven functions, each identifying itself and its version (design.md D6)
- [x] 5.2 Add the build and packaging step producing deployable artifacts for each function
- [x] 5.3 Confirm every function is invocable through its real trigger and that its identity is visible in the response or logs

## 6. Environment stacks

- [x] 6.1 Create the `dev`, `staging`, and `production` stacks with environment-scoped configuration
- [x] 6.2 Deploy `dev` from a developer machine to validate the components before any pipeline exists
- [x] 6.3 Verify least privilege on the deployed dev stack: confirm the notification function cannot write intervention state and no runtime role can mutate an audit event
- [x] 6.4 Deploy `staging` and confirm resource naming makes every resource attributable to exactly one environment

## 7. Deployment workflows

- [x] 7.1 Add a pull-request job producing the infrastructure preview and posting the resource diff to the pull request, applying nothing
- [x] 7.2 Make the preview job fail the pull request when a preview cannot be produced
- [x] 7.3 Flag previews containing deletion or replacement of a table, queue, or scheduler group as destructive and requiring explicit approval
- [x] 7.4 Add the deploy workflow running on merge to main: dev, then staging, then the staging end-to-end verification job
- [x] 7.5 Create the three GitHub Environments and add a required-reviewer protection rule on production
- [x] 7.6 Add the production deploy job gated on that protection rule, deploying the same commit staging verified (design.md D7)
- [x] 7.7 Add a concurrency group per environment so two runs can never apply the same stack simultaneously (design.md D1)
- [x] 7.8 Confirm each job assumes only its own environment's role and holds no long-lived credentials
- [x] 7.9 Add a scheduled drift detection workflow reporting differences against expected definitions

## 8. Verification

- [x] 8.1 Verify a staging deploy cannot read or modify a production resource
- [x] 8.2 Verify a failing staging verification blocks the production deploy
- [x] 8.3 Verify production remains unchanged while approval is pending
- [x] 8.4 Verify rollback by deploying a known-bad change to dev and restoring the previous known-good commit through the pipeline
- [x] 8.5 Verify drift detection reports a deliberate out-of-band change, then revert it
- [x] 8.6 Update `architecture.md` §21.9 with the concrete local commands and §21.1 with the state backend and promotion model
- [x] 8.7 Run `openspec validate establish-environments-and-deployment --strict` and resolve any findings
