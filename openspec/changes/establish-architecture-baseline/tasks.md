## 1. Architecture document — amend existing sections

- [x] 1.1 Expand the invariants table in §1.2 from 12 to 17, adding identity-vendor replaceability, emulator replaceability, agent-pricing neutrality, organization-owned shared pool, and "exceeding a billing allowance must never drop an escalation"; keep existing I1–I12 identifiers stable and append the new ones
- [x] 1.2 Add ADR-007 to §2 recording that credentials are verified in application middleware rather than an API Gateway authorizer, with the alternatives from design.md D2
- [x] 1.3 Add ADR-008 to §2 recording that usage metering is asynchronous and never gates the intervention path (design.md D5)
- [x] 1.4 Add the three tenant-key principles to §6.1 as normative rules — tenant identity participates in keys, indexes preserve tenant isolation, no production request path scans — and note that the model in §6.2–§6.7 satisfies them (design.md D1)
- [x] 1.5 Rewrite §11.2 Authentication: separate human and agent paths, OIDC provider neutrality with the supported provider list, the identity-token-to-session-token exchange, and multi-organization membership with one active organization per request
- [x] 1.6 Add the `TenantContext` shape and the rule that it is constructed only in authentication middleware to §16.1, and expand §16.2 with the human/agent separation guarantees
- [x] 1.7 Add the identity provider port and its adapter boundary to §4.4's dependency rules, so adding a provider cannot reach the domain layer
- [x] 1.8 Update §5.1's entity diagram and §6.5's `directory` table to carry `seat_status` on membership

## 2. Architecture document — new sections

- [x] 2.1 Move the existing Open Questions section from §22 to §24, leaving all other section numbers unchanged (design.md D6)
- [x] 2.2 Write §22 Billing and Seat Model: active seat definition, `billable_active_seat_count`, Free/Basic/Pro/Enterprise plans with the $25/active-seat/month Pro anchor, per-seat capacity feeding one organization-wide pool, unlimited connected agents, and the explicit non-billable list
- [x] 2.3 Add the overage behaviour to §22: capacity exhaustion meters overage and never blocks creation, routing, paging, or delivery; warnings fire before exhaustion
- [x] 2.4 Write §23 Enterprise Identity and Provisioning: directory users are not seats, the `ACTIVE`/`VIEWER`/`DISABLED` seat lifecycle, and SSO/SCIM/group-mapping as adapters over BotHandlers' own organization and membership model
- [x] 2.5 Add the deferred pricing decisions from design.md Open Questions into §24 as tracked questions
- [x] 2.6 Sweep every internal `§` cross-reference in `architecture.md` and confirm each resolves to the intended section after the §22→§24 move

## 3. Sibling document alignment

- [x] 3.1 Add a billing summary to `vission.md` pointing at `architecture.md` §22 as the normative model, without duplicating the numbers
- [x] 3.2 Record `apps/mobile/` as deferred in `vission.md` §19's V1 deferral list, naming push notification as the trigger to revisit
- [x] 3.3 Update `agents.md` with the widened invariant list and correct the `architecture.md` Open Questions reference from §22 to §24
- [x] 3.4 Add the seat-based billing model to `README.md`'s overview
- [x] 3.5 Verify no document contradicts another on stack, invariants, billing, or the deferral of mobile

## 4. Workspace scaffolding

- [x] 4.1 Convert the root `package.json` to a private workspace root — remove `main`, set `private: true`, add workspace scripts
- [x] 4.2 Add `pnpm-workspace.yaml` covering `apps/*`, `backend/*`, `packages/*`, `sdk/typescript`, and `infrastructure`
- [x] 4.3 Add `turbo.json` with `build`, `lint`, `typecheck`, and `test` pipelines
- [x] 4.4 Add `tsconfig.base.json` with strict mode enabled, and per-package `tsconfig.json` files extending it
- [x] 4.5 Add `.gitignore` covering `node_modules`, build output, `.DS_Store`, and local environment files

## 5. Package scaffolding

- [x] 5.1 Scaffold `backend/domain`, `backend/application`, and `backend/infrastructure` with `package.json`, `tsconfig.json`, and a placeholder entry point each
- [x] 5.2 Scaffold `backend/api`, `backend/mcp`, and `backend/workers` with the seven logical entrypoint stubs named in §4.3
- [x] 5.3 Scaffold `packages/contracts`, `packages/ui`, `packages/config`, and `packages/utilities`
- [x] 5.4 Scaffold `sdk/typescript` and `sdk/python` with package metadata and a placeholder client surface
- [x] 5.5 Scaffold `apps/web`, `apps/docs`, and `apps/mobile`, with a README in `apps/mobile` stating its post-V1 status
- [x] 5.6 Scaffold `docs/` with a README stating it holds public product documentation only and that internal architecture docs stay at the repository root
- [x] 5.7 Scaffold `infrastructure/pulumi` and `infrastructure/local`, plus `tests/` and `scripts/`
- [x] 5.8 Confirm a clean `pnpm install` and a full `pnpm build` succeed across the workspace

## 6. Boundary enforcement

- [x] 6.1 Add `.dependency-cruiser.cjs` forbidding `backend/domain` from importing cloud provider SDKs, HTTP frameworks, serverless runtime types, emulator libraries, or agent frameworks
- [x] 6.2 Extend it to forbid `sdk/*` from importing backend implementation code, and to restrict transports to calling application services only
- [x] 6.3 Add a fixture test asserting each boundary rule actually rejects a known violation, then confirm the fixtures are excluded from the production build (design.md D7)
- [x] 6.4 Add Vitest configuration and a smoke test so the `test` pipeline is real rather than a stub

## 7. CI and verification

- [x] 7.1 Add a GitHub Actions workflow running install, lint, typecheck, boundary check, and tests on every pull request
- [x] 7.2 Confirm the workflow passes on a clean checkout
- [x] 7.3 Deliberately introduce a domain-layer boundary violation, confirm CI fails with a clear message, then revert it
- [x] 7.4 Run `openspec validate establish-architecture-baseline --strict` and resolve any findings
