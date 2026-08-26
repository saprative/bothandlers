## Context

See `proposal.md` — Why. Three constraints shape the approach.

First, there is a bootstrap paradox: the pipeline needs a state backend, an identity provider, and deploy roles, but those are themselves infrastructure. Something has to exist before the thing that creates everything.

Second, the platform is serverless and idle-cheap, so running three permanent environments costs almost nothing. The usual pressure to collapse environments does not apply here, and the pipeline can be built assuming all three exist.

Third, resource definitions will exist twice — once for the cloud and once for the local emulator. That duplication is the most likely source of the local-versus-deployed divergence the specs exist to prevent.

## Goals / Non-Goals

**Goals:**

- A developer with no cloud account can run and exercise the platform.
- Every deployed resource traces to a commit, and nothing reaches production without passing staging and a human.
- No long-lived cloud credential exists anywhere in the repository or its settings.
- The deploy path is proven end to end before any feature code depends on it.

**Non-Goals:**

- Multi-region or data residency. Single region, consistent with the existing open question.
- Separate cloud accounts per environment. The design records the migration path but does not take it now.
- Application behaviour. Deployed functions return health responses; the critical path arrives separately.
- Blue/green or canary release. Rollback is redeploy-known-good, which is sufficient while there are no users.

## Decisions

### D1: Self-managed object-storage state backend, with pipeline serialization compensating for weak locking

**Decision:** Pulumi state lives in a versioned, encrypted S3 bucket with a per-environment KMS key for secret encryption. Self-managed state locking is explicitly enabled, and every deploy workflow additionally runs under a concurrency group keyed by environment so two runs can never apply the same stack at once.

**Why:** State and secrets stay in the same account as the resources they describe, with no third-party account and no per-resource pricing. Bucket versioning gives state history, which is the main thing the managed backend otherwise provides.

**The honest weakness:** the self-managed backend's locking is opt-in and less battle-tested than the managed service's. Rather than rely on it alone, the pipeline is the real serialization mechanism — one workflow path per environment, with concurrency groups — and human-run deploys are documented as an emergency-only path. This is the trade that makes D1 safe rather than merely cheaper.

**Alternatives considered:** Managed Pulumi Cloud — better concurrency safety and history for free, rejected on the vendor account and cost. Committing state to git — rejected outright; it stores secrets and races badly.

### D2: A one-time bootstrap stack, applied by a human, that later self-hosts its own state

**Decision:** A separate `bootstrap` stack creates the state bucket, the KMS keys, the identity provider, and the per-environment deploy roles. It is applied once by an operator holding elevated credentials, using local state, and its state is then migrated into the bucket it just created. Every subsequent change to it runs through the same review as any other stack.

**Why:** This is the only way out of the paradox, and pretending otherwise produces undocumented click-ops. Making the exception explicit, one-time, and audited is better than leaving it implicit.

**Alternatives considered:** Creating the backend by hand and documenting it — rejected, it is the same work with no record of what was created. A second infrastructure tool for bootstrap only — rejected, a whole extra toolchain for one stack.

### D3: Federated identity with one deploy role per environment

**Decision:** A GitHub OIDC identity provider is registered in the account. Each environment has a deploy role whose trust policy is scoped to this repository *and* to the specific GitHub Environment, so the token minted for a staging job cannot assume the production role. Permissions on each role are scoped to that environment's resources.

**Why:** This is what makes "no long-lived keys" true rather than aspirational, and it is what makes the environment-isolation requirement enforceable rather than a naming convention. A stolen workflow log yields nothing reusable.

**Detail that matters:** the trust policy must condition on the full subject claim, not a wildcard. A trust policy matching only the repository lets any branch or environment in the repository assume any role, which silently defeats the isolation the specs require.

### D4: One account now, isolation by role and naming, with a recorded migration path

**Decision:** All three environments live in one account, isolated by deploy role, resource naming prefix, and stack. The migration to per-account isolation is documented as a hardening step to take before the first production customer.

**Why:** Per-account isolation is the correct end state, but it front-loads organization setup and cross-account role chaining before anything has ever deployed. Taking it later costs a state migration, which is bounded and well understood; taking it now costs weeks before the first deploy.

**Risk accepted, and named:** a misconfigured production role is a same-account blast radius. D3's per-environment scoping is what keeps this acceptable, which is why the trust-policy detail above is not optional.

### D5: Resource definitions are declared once and consumed by both cloud and local provisioning

**Decision:** Table names, key schemas, index definitions, queue names, and redrive policies live in a single shared module. The infrastructure code imports it to create cloud resources; the local bootstrap script imports the same module to provision the emulator.

**Why:** This is the highest-value decision here. Two hand-maintained copies of a table definition diverge quietly — a missing index locally means an access pattern that works in development and throws in staging, and the specs' parity guarantee becomes fiction. One definition makes drift structurally impossible rather than a review responsibility.

**Trade-off accepted:** the shared module sits between infrastructure and application code and must not accrue logic. It declares shapes only, and the boundary rules treat it as configuration.

### D6: Deployed functions carry placeholder handlers

**Decision:** All seven functions deploy with handlers that return a health response and nothing else, wired to their real triggers, roles, queues, and schedules.

**Why:** A pipeline that has never deployed anything is not a working pipeline — it is an untested script that happens to exit zero. Deploying real triggers with trivial handlers exercises packaging, permissions, event source wiring, and rollback while the cost of being wrong is nil. The first feature change then replaces handler bodies rather than discovering that the event source mapping was never right.

**Trade-off accepted:** placeholders can linger. They are replaced by the critical-path change, and the health responses make it obvious when one has been forgotten.

### D7: Promotion is one sequential workflow with a protection-rule gate

**Decision:** A single workflow runs on merge to main: deploy dev → deploy staging → run staging end-to-end verification → wait on the production GitHub Environment's protection rule → deploy production. Approval is a GitHub Environment reviewer requirement, not a bespoke mechanism.

**Why:** Sequential jobs in one workflow make the promotion path readable as a single artifact, and the protection rule gives approval, audit, and the credential scoping from D3 in one construct. Splitting into separate workflows loses the visible through-line and invites deploying production from a different commit than the one staging verified.

## Risks / Trade-offs

- **Self-managed state locking is weaker than managed** → Concurrency groups per environment, a single deploy path, and human-run deploys documented as emergency-only.
- **Single-account blast radius** → Per-environment roles with full-subject-claim trust conditions; migration path to separate accounts recorded and scheduled before first production customer.
- **The bootstrap step is manual and privileged** → One-time, documented, audited, and its state moves under management immediately afterwards.
- **Emulator fidelity is limited** → The specs already forbid treating local as a correctness oracle; provider-specific semantics are verified in staging before production.
- **Drift detection produces noise that gets ignored** → Scope it to the resources that matter and route it somewhere a person actually reads; a permanently red drift check is worse than none.
- **Placeholder handlers are mistaken for working features** → Health-only responses, and replacement tracked in the critical-path change.
- **Shared resource-definition module becomes a dumping ground** → It declares shapes only, and the existing dependency-boundary rules cover it.

## Migration Plan

Nothing exists, so this is a build order rather than a migration. Rollback at every step is destroying what was just created.

1. Apply the bootstrap stack manually; migrate its state into the created bucket.
2. Build the shared resource-definition module.
3. Stand up the local environment against it; confirm the seeded critical path runs locally.
4. Build infrastructure components; deploy the dev stack from a developer machine to validate them.
5. Wire federated identity into the workflows; confirm the pipeline can deploy dev with no static credentials.
6. Deploy staging through the pipeline; add the preview job to pull requests.
7. Add the production stack, its protection rule, and the promotion sequence.
8. Verify rollback by deploying a known-bad change to dev and restoring it.

Steps 1–3 deliver the local environment independently of the pipeline, and are useful even if 4–8 are deferred.

## Open Questions

None of these changes the specs, the approach, or the task breakdown.

- Which region. The existing multi-region and data-residency question governs the eventual answer.
- Drift detection frequency, and where its findings are routed.
- Log retention per environment, balancing the seven-year audit requirement against non-production noise.
- Whether staging seeds a demo organization permanently or provisions one per verification run.
- Whether operational alarms eventually route into BotHandlers itself, and at what point dogfooding the pager becomes sensible rather than circular.
