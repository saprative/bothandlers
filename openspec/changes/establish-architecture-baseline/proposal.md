## Why

`architecture.md` is a thorough design of record for the intervention platform, but it predates three decisions the business now depends on: how humans authenticate without coupling the domain to an identity vendor, how the product is billed (active seats feeding a shared organization-wide intervention pool), and how enterprise directory provisioning stays separate from paid seats. None of that exists in any document today.

At the same time the repository is documentation-only. The monorepo layout, workspace wiring, and the dependency boundaries that keep AWS and agent frameworks out of the domain layer are specified but not enforceable, so the first feature commit has nothing to violate. This change closes both gaps: it makes `architecture.md` complete and current, and turns the structure it describes into a buildable skeleton with the boundary rules wired into CI.

## What Changes

- **Rewrite `architecture.md`** to cover the full brief, retaining the existing data model, state machine, routing engine, authority model, and delivery guarantees.
- **New: billing and seat model.** Active seat definition, `billable_active_seat_count`, Free/Basic/Pro/Enterprise plans anchored at $25/active seat/month, per-seat capacity contributing to a shared organization pool, unlimited connected agents, and a strict list of what is never billed (API calls, notifications, retries, webhook attempts, audit events).
- **New: seat lifecycle and enterprise directory.** Directory users are not seats. `Membership` carries `seat_status` (`ACTIVE` / `VIEWER` / `DISABLED`); SCIM, SSO, and group/role mapping are adapters over BotHandlers' own organization and membership model.
- **Expanded: authentication.** Human OIDC/JWT and agent API-key paths specified as fully separate; vendor-neutral provider support (Google, GitHub, Okta, Entra ID, Keycloak); multi-organization membership with one active organization per request; the `TenantContext` shape and the rule that it is constructed only in authentication middleware.
- **Expanded: architectural invariants.** Grow the existing 12 to the brief's 17, adding identity-vendor replaceability, Floci replaceability, agent-pricing neutrality, shared-pool ownership, and the rule that exceeding a billing allowance must never drop a human escalation.
- **New: buildable monorepo skeleton.** `pnpm-workspace.yaml`, `turbo.json`, shared `tsconfig` bases, and placeholder packages for every directory in the target layout.
- **New: mechanically enforced boundaries.** Dependency-cruiser rules failing CI when `backend/domain` imports an AWS SDK, Hono, Lambda types, Floci, or an agent framework — and when `sdk/*` imports backend internals.
- **Align sibling documents** (`vission.md`, `README.md`, `agents.md`) with the billing model and the widened invariant list.

Resolved during proposal, and recorded in `design.md`:

- The brief's §7 DynamoDB examples are read as **principles** (tenant identity in keys, indexes preserve isolation, no production scans). The existing physical model already satisfies all three and is retained, keeping the access-pattern catalog, the sparse active-set index, monotonic `seq` audit ordering, and IAM-enforced audit immutability.
- Credentials are verified in **Hono middleware, not an API Gateway JWT authorizer** — one `api` Lambda serves both human JWTs and agent API keys, and a JWT authorizer cannot validate the latter.

No **BREAKING** changes: there is no implementation or published API to break.

## Capabilities

### New Capabilities

- `platform-architecture`: The architectural invariants, layering rules, and serverless runtime model the platform is built against — including the boundary constraints that CI enforces mechanically.
- `identity/authentication`: Separation of human and agent authentication, identity-vendor neutrality, multi-organization membership, and derivation of tenant context from authenticated credentials only.
- `billing/seat-model`: Active-seat billing, the shared organization-wide intervention pool, overage metering, and the separation of directory users from paid seats.

### Modified Capabilities

None — `openspec/specs/` is currently empty; every capability above is new.

## Impact

**Documents:** `architecture.md` (substantial rewrite), `vission.md`, `README.md`, `agents.md`.

**Repository:** new `apps/`, `backend/`, `packages/`, `sdk/`, `docs/`, `infrastructure/`, `tests/`, `scripts/` trees; new `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.dependency-cruiser.cjs`; `package.json` converted to a workspace root.

**CI:** a new GitHub Actions workflow running lint, typecheck, and the dependency-boundary check on every PR.

**Not in scope:** feature implementation. No handler, worker, repository, or Pulumi resource is written here — the critical path (§15) remains unbuilt and is the natural follow-up change. Billing enforcement code is likewise out of scope; this change specifies the model, it does not meter anything.

**Deferred and flagged:** `apps/mobile/` is scaffolded as a placeholder only. Its sole V1-differentiating capability is push notification, which `vission.md` §19 defers, so no mobile client work is proposed here.
