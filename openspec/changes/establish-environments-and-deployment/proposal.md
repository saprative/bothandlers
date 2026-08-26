## Why

`architecture.md` §21 names four environments, forbids manually created production infrastructure, and requires least-privilege IAM per function — but none of it exists. There is no way to run BotHandlers locally, no way to deploy it, and no AWS account wired to the repository. Every hour of feature work until that changes is work that has never executed anywhere.

The local loop matters just as much as the pipeline. The design leans hard on behaviour that only appears at runtime — duplicate queue delivery, stale timers, conditional-write contention — and a developer who cannot exercise those locally will discover them in staging at best. Standing up Floci and the deploy path together means the first feature change has somewhere to run and somewhere to ship.

## What Changes

- **Local environment.** A `docker-compose` stack running Floci for DynamoDB, SQS, EventBridge Scheduler, SES-compatible mail, and CloudWatch-compatible APIs; a bootstrap script that creates tables, queues, DLQs, and the scheduler group; seed data for a demo organization, team, agent, and on-call schedule.
- **Local developer loop.** `pnpm install` → `docker compose up -d` → `pnpm dev` on a fresh clone, with no AWS account and no credentials. Handlers run as ordinary Node processes rather than emulated Lambdas for fast iteration.
- **Pulumi project.** Component resources for the DynamoDB tables and their indexes, the five SQS queues with DLQs and alarms, the EventBridge Scheduler group, API Gateway, and the seven Lambda functions wired to placeholder handlers — each with its own least-privilege role, including the deny on audit-table mutation.
- **Per-environment stacks.** `dev`, `staging`, and `production` stacks with environment-scoped configuration, resource naming, and retention settings; state in a versioned, self-managed S3 backend with a per-environment KMS key.
- **Credential-free CI.** A GitHub OIDC identity provider and per-environment deploy roles, scoped so a workflow can assume only the role for the environment it targets. No long-lived AWS access keys in the repository.
- **Deploy workflows.** Pull requests run `pulumi preview` and post the diff. Merges to `main` deploy `dev`, then `staging`, then run the real-AWS staging end-to-end suite, then hold for a human approval gate before `production`.
- **Operational safety.** Rollback by redeploying the last known-good commit, drift detection on a schedule, and budget and billing alarms per environment.

Recorded assumptions:

- Depends on `establish-architecture-baseline` for the workspace layout, `infrastructure/pulumi/`, `infrastructure/local/`, and the pull-request CI workflow this change extends. If that change has not been applied, the scaffolding tasks here absorb it.
- Single AWS region for all environments, consistent with the existing open question on multi-region and data residency.
- Separate AWS accounts per environment are treated as a later hardening step; this change isolates by stack, role, and resource naming within one account, and the design records the migration path.

No **BREAKING** changes: nothing is deployed today.

## Capabilities

### New Capabilities

- `deployment/local-environment`: The local development environment — what a developer can run without cloud access, and the parity guarantees between it and deployed environments.
- `deployment/release-pipeline`: How infrastructure and application code reach an environment — reproducibility, environment isolation, credential handling, promotion gating, and rollback.

### Modified Capabilities

None. `platform-architecture` already carries the emulator-replaceability and deploy-compatibility requirements this change implements; those requirements are unchanged, and the specs here cover the environment and pipeline behaviour around them rather than restating them.

## Impact

**New:** `infrastructure/local/docker-compose.yml` and bootstrap/seed scripts; `infrastructure/pulumi/` components and per-environment stacks; a bootstrap stack for the state bucket, KMS keys, OIDC provider, and deploy roles; `.github/workflows/` for preview, deploy, and drift detection; `.env.example`.

**Modified:** root `package.json` scripts (`dev`, `local:up`, `local:seed`); the existing pull-request CI workflow gains the preview job; `architecture.md` §21.9 gains the concrete local commands.

**External:** requires an AWS account with permission to create the bootstrap resources, and three GitHub Environments (`dev`, `staging`, `production`) with a protection rule on the last.

**Not in scope:** application logic. The seven Lambdas deploy placeholder handlers that return a health response — enough to prove the pipeline works end to end, and nothing more. The real-AWS staging E2E suite is wired into the pipeline as a job, but the tests it runs arrive with the critical-path change.
