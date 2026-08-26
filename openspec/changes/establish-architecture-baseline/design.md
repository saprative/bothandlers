## Context

See `proposal.md` — Why. The constraint that shapes everything below is that `architecture.md` is not a blank page: it is ~1,760 lines of design of record, densely self-referential (§9.3, §11.5, §8.3 and similar appear throughout), and referenced externally by `agents.md`, `README.md`, and `vission.md`. The brief overlaps it heavily but conflicts in two places and extends it in two more.

`openspec/specs/` is empty, and no implementation exists — no handlers, no infrastructure, no tests. That makes this a low-risk change to get wrong structurally and a high-risk one to get wrong normatively: everything built later inherits these definitions.

## Goals / Non-Goals

**Goals:**

- One coherent `architecture.md` covering the brief in full, with no contradictions against itself or its sibling documents.
- Preserve every internal cross-reference; a reader following `§9.3` after this change lands where they did before.
- A repository whose structure is enforced by CI rather than described in prose.

**Non-Goals:**

- Implementing billing metering, SCIM, or authentication. This change specifies them; no code counts a seat or validates a token.
- Re-deciding the settled parts of the architecture. The data model, state machine, routing engine, authority model, and delivery guarantees carry forward as written.
- Choosing an identity vendor. The design must make that choice reversible, which is a different requirement from making it.

## Decisions

### D1: The brief's §7 DynamoDB examples are principles, not a schema

**Decision:** Retain the existing physical model (`interventions` keyed `PK=ORG#<org>` / `SK=INT#<id>`, audit in a separate `intervention_events` table keyed by intervention with a zero-padded monotonic `seq`). Restate §7's three binding rules — tenant identity participates in keys, indexes preserve tenant isolation, no production request path scans — as normative, and note that the existing model satisfies all three.

**Why:** The existing model was derived from an explicit 18-entry access-pattern catalog, and three of its properties are load-bearing and would be lost by literal adoption:

- **Audit immutability is enforced at the IAM layer**, which requires audit events to live in a table where runtime roles can be denied `UpdateItem`/`DeleteItem` outright. Co-locating audit events in the intervention's own item collection makes that grant impossible to express — the same partition must be writable.
- **`seq` is gap-detectable and collision-free**, allocated from the version counter already advanced under a conditional write. The brief's `EVENT#<timestamp>` cannot order two events in the same millisecond and is vulnerable to clock skew across concurrent invocations.
- **The sparse active-set index** bounds reconciliation sweeps by live work rather than total history. It depends on an attribute deleted at terminal transition, which the collection layout does not naturally provide.

**Alternatives considered:** Literal adoption — rejected, costs the three properties above and rewrites all 18 access patterns for no stated benefit. Hybrid (collection for intervention + decision, separate audit table) — rejected as the worst of both: it splits the model without recovering anything, since decisions are already a field on the intervention rather than a hot independent read.

### D2: Credentials are verified inside the application, not at an API Gateway authorizer

**Decision:** A single identity middleware in the API function classifies the incoming credential — human bearer token verified against the provider's public keys, or agent API key resolved by hash lookup — and constructs the tenant context. No API Gateway JWT authorizer.

**Why:** One function serves both humans and agents (per the one-function-per-concern rule), and a Gateway JWT authorizer structurally cannot validate an opaque `bh_live_…` key. Splitting them across two layers means tenant context is constructed in two places, which defeats the lint rule that makes tenancy enforcement structural rather than remembered. Verifying in one middleware also makes revocation immediate rather than bounded by an authorizer cache TTL.

**Alternatives considered:** Gateway JWT authorizer for human routes plus in-function key auth for agent routes — rejected, two auth paths at two layers. A single Lambda REQUEST authorizer handling both — rejected: an extra hop and cold start on every request, and revocation lag proportional to the authorizer cache.

### D3: Identity providers authenticate; BotHandlers issues its own scoped session token

**Decision:** The provider issues an OIDC identity token proving *who*. BotHandlers exchanges it for its own short-lived access token carrying the active organization and the actor. The provider is reached through a port with one adapter per provider; nothing above the adapter knows which provider was used.

**Why:** The specs require that a user may hold membership in several organizations while every request operates in exactly one. A provider token proves identity but has no concept of which BotHandlers organization is active, so scoping has to be BotHandlers' own act. Minting our own token also makes provider swaps touch one adapter, and makes an eventual mobile client a new front-end rather than a new authorization model.

**Alternatives considered:** Pass the provider token through and verify it at the API — rejected, it cannot express active-organization scoping and couples every consumer to that provider's claim shape. Provider-managed organizations — rejected, it makes membership a vendor record when membership is a billing and audit record.

### D4: Roles and authority are read from BotHandlers records per request, never from token claims

**Decision:** The session token carries actor and active organization only. Roles, memberships, and authority grants are resolved from BotHandlers' own records on each request.

**Why:** The specs require that provider claims grant nothing, and that revoking a grant takes effect before the next decision — a token-embedded role stays valid for the token's remaining lifetime. Authority is already re-checked at decision time for exactly this reason; extending the same rule to roles keeps one story instead of two.

**Trade-off accepted:** One additional read per authenticated request. It targets a partition the request generally reads anyway, and is small against the read-latency target.

### D5: Usage metering is asynchronous and never gates the intervention path

**Decision:** Seat counts and intervention consumption are computed on the derived analytics path from the audit event stream. The intervention creation path performs no quota check and no usage write.

**Why:** The invariant that exceeding a billing allowance must never drop a human escalation is much stronger than a policy — it is a statement that billing state must not be able to fail an intervention. If creation consulted a counter, that counter becomes a dependency of the critical path, and a metering bug or a hot counter partition becomes an outage of the product's core promise. Counting after the fact makes overage a billing event rather than a runtime condition.

**Consequence:** Usage figures are eventually consistent, and warning notifications are threshold-triggered from the derived model rather than transactional. This is acceptable: the warnings are advisory, and the pool is monthly.

**Alternatives considered:** Synchronous counter with a conditional increment — rejected on the above. Synchronous check with fail-open — rejected as strictly worse: it accepts the dependency while abandoning the accuracy that was its only justification.

### D6: New sections are appended; only Open Questions moves

**Decision:** Add Billing and Seat Model as §22 and Enterprise Identity and Provisioning as §23, and move the existing Open Questions from §22 to §24. Every other section number is unchanged.

**Why:** `architecture.md` cross-references itself by section number in dozens of places. A full renumber to slot billing next to security would silently break most of them, and stale cross-references in the design of record are worse than imperfect ordering. Exactly one section number changes, and the only external references to it are in documents this change already touches.

### D7: The skeleton carries a minimal fixture per boundary rule

**Decision:** Each workspace package is scaffolded with a placeholder entry point and its `package.json`, not left as an empty directory, and the boundary configuration ships with a test that asserts a known violation is actually caught.

**Why:** Dependency-cruiser rules over empty packages pass trivially and prove nothing — the first real import is when you discover the rule was misconfigured. A rule nobody has seen fail is not a rule. Empty directories also cannot be committed to git at all.

## Risks / Trade-offs

- **Billing is specified long before it is built** → The specs are written as observable behavior with no implementation coupling, and `architecture.md` marks the section as design of record. Plan-tier numbers stay in Open Questions rather than being invented.
- **Documented structure diverges from reality once features land** → The boundary rules are the guard: the parts of the structure that matter (layering, domain purity, SDK isolation) fail CI when violated rather than relying on the document being reread.
- **Scaffolding `apps/mobile/` invites premature work** → The directory is scaffolded with a README stating it is post-V1 and naming push notification as the trigger to revisit. Deferral is recorded in `vission.md` §19 alongside the other V1 deferrals.
- **D5 means usage numbers lag** → Acceptable for a monthly pool; documented explicitly so nobody later "fixes" it by adding a synchronous check, which would reintroduce the failure mode the invariant exists to prevent.
- **D4 adds a read to every authenticated request** → Measured against the read-latency target during the first implementation change; if it becomes material, a short-TTL cache with explicit invalidation on role change is the escape hatch, not token-embedded roles.
- **Three capabilities are specified with no implementation to validate them** → The scenarios are written to be directly translatable into the required failure tests, so the first implementation change inherits its test list rather than inventing one.

## Migration Plan

No runtime exists, so there is nothing to migrate and nothing to roll back beyond reverting a commit. Sequence:

1. Rewrite `architecture.md` (§22/§23 added, Open Questions to §24, existing sections amended in place for auth and invariants).
2. Align `vission.md`, `README.md`, and `agents.md` to the widened invariant list and the billing model.
3. Scaffold workspace roots and packages; confirm a clean install and build.
4. Wire boundary rules plus their fixture test; confirm the fixture fails as expected, then confirm CI is green.

Steps 1–2 are independently useful if 3–4 are deferred.

## Open Questions

These are deferrable: none changes a spec, the approach, or the task breakdown.

- Per-seat included intervention allotment for Free, Basic, and Enterprise. Only the Pro anchor ($25/active seat/month) and the illustrative 150/seat figure are given.
- Whether the Free plan draws from a pooled allotment at all, or a flat organization cap independent of seats.
- Overage unit price and whether it is tiered.
- The warning threshold percentage, and whether it is fixed or configurable per organization.
- Whether `VIEWER` seat status is free or reduced-price.
