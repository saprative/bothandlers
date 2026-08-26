# BotHandlers — Agent Entry Point

**Read [`vission.md`](./vission.md) first. It is the source of truth for this project.**

This file is the shared working brief for any AI agent contributing to BotHandlers. It
summarizes the project and states the working rules. Where this file and `vission.md`
disagree, `vission.md` wins.

## What We Are Building

BotHandlers is a production-ready, multi-tenant SaaS: **a human-in-the-loop management
platform.** When an autonomous agent hits an exception, uncertainty, policy boundary, or an
action it is not authorized to take, BotHandlers routes that moment to the right
non-technical business human, obtains a structured decision, and returns it so the agent can
resume.

```
AI Agent → Human Intervention Request → Policy Evaluation → Skill/Authority Routing
        → On-Call Human → Page → Acknowledge → Human Decision → Agent Resume
```

Product detail — domain model, lifecycle, routing engine, integration surface, security model,
analytics and build order — lives in [`vission.md`](./vission.md). Technical detail — data
model, state machine, routing algorithm, API surface and delivery guarantees — lives in
[`architecture.md`](./architecture.md).

## Quick Orientation

- **Central object:** `Intervention` — see `vission.md` §4, `architecture.md` §5.3.
- **Lifecycle:** `OPEN → ROUTING → PAGED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED`, plus
  `ESCALATED`, `EXPIRED`, `CANCELLED` — see `vission.md` §5, `architecture.md` §7.
- **Routing:** team + skill + authority + availability + on-call + workload, and must be
  explainable. Authority is independent from RBAC — see `vission.md` §6,
  `architecture.md` §8–9.
- **Stack:** TypeScript end to end. AWS Lambda + API Gateway + DynamoDB + SQS + EventBridge
  Scheduler; Hono + Zod; Next.js and React Native + Expo; Pulumi; Floci locally. Serverless
  and event-driven — see `vission.md` §17, `architecture.md` §3.
- **Non-goals:** not an agent framework, agent builder, ticketing system, project manager,
  CRM, or external-human marketplace — see `vission.md` §2.

## The Serverless Model

Everything below follows from one fact: an intervention is created, and then the system waits
minutes or hours for a human. **The waiting is done by durable state plus a timer, never by a
running process.**

```
Create intervention → persist state → enqueue work → invocation exits
                                                          ↓
                      human responds later → new request/event → new invocation
```

- **A handler must never wait for a human.** No blocking calls, no held connections, no
  polling loops inside an invocation.
- **Persist, then enqueue.** State is committed before any notification, webhook or
  downstream effect is dispatched. No request path synchronously depends on an external
  provider — see `architecture.md` ADR-004.
- **DynamoDB is the source of truth**, modeled from access patterns. Conditional writes give
  the exactly-one-outcome guarantee when two humans act at once; no request path may `Scan`.
- **SQS is at-least-once**, so every consumer re-reads authoritative state, re-validates
  tenancy, writes conditionally, and treats "already applied" as success.
- **Timers fire late, twice, or after the fact.** Every scheduled handler re-reads state and
  checks the intervention's `escalation_epoch` before acting; a stale timer must be a clean
  no-op — see `architecture.md` §10.5.
- **Handlers are thin adapters.** Lambda, MCP and queue entrypoints parse, authenticate,
  establish tenant context and call an application service. Domain logic lives in
  `backend/domain` and must not import AWS SDKs, Hono, Lambda types or any agent framework.
- **Idle cost should be near zero.** If a design needs something always running, it is
  fighting the architecture — raise it rather than adding a process.

## The Critical Path

Every decision is judged against one end-to-end flow working reliably:

```
Agent raises intervention → BotHandlers identifies the right human → pages them
  → human acknowledges → human decides → BotHandlers returns the structured decision
  → agent resumes → complete audit trail
```

**Do not over-engineer secondary functionality until this flow works end to end.**

## Working Rules

- Check `vission.md` before proposing scope. If a request falls under the non-goals in §2,
  say so rather than building it.
- Build order is design-first: architecture → database schema → APIs → state machine →
  routing algorithm → repository structure → MVP implementation (`vission.md` §19).
- Preserve the layering: transport → application → domain → ports → infrastructure adapters
  (`architecture.md` §4.4). Anything that couples a layer to AWS, HTTP or an agent framework
  should be raised, not quietly introduced.
- Assume duplicate events, late timers, racing humans, failing providers and retried
  invocations as normal operating conditions — not edge cases to handle later.
- Follow the expanded architectural invariants: identity and emulator replaceability,
  agent-pricing neutrality, organization-owned shared capacity, and the guarantee that
  billing exhaustion never drops a human escalation.
- Every state transition produces an immutable audit entry (`vission.md` §13,
  `architecture.md` §6.4). New transitions ship with their audit entry, not after it.
- A human decision must never be silently lost (`vission.md` §10). Anything touching the
  callback path needs retries, idempotency and visible delivery status.
- The human-facing surface is for non-technical business operators. No LLM, agent-framework,
  MCP or orchestration vocabulary in operator-facing UI or copy (`vission.md` §11).
- Open questions are tracked in `vission.md` §20 (product) and `architecture.md` §24
  (technical). If you resolve one, update that section.

## Model-Specific Notes

- [`claude.md`](./claude.md) — Claude-specific integration notes
- [`gemini.md`](./gemini.md) — Gemini-specific integration notes

These cover model-specific configuration only. Project context belongs in `vission.md`.
