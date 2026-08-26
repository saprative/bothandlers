# BotHandlers

**A human-in-the-loop management platform.**

BotHandlers is human-intervention infrastructure for autonomous AI agents. When an agent hits
an exception, an uncertainty, a policy boundary, or an action it is not authorized to take,
BotHandlers routes that moment to the right business human, obtains a structured decision, and
returns it so the agent can resume — with a complete audit trail.

```
AI Agent → Human Intervention Request → Policy Evaluation → Skill/Authority Routing
        → On-Call Human → Page → Acknowledge → Human Decision → Agent Resume
```

> **Status:** Design — pre-MVP. There is no implementation yet; this repository currently holds
> the design of record.

## What it is not

Not an agent framework, agent builder, ticketing system, project manager, task manager, CRM,
or marketplace for external humans. BotHandlers owns the human-intervention lifecycle; the
agent runtime keeps owning agent execution. That boundary is what keeps it framework-independent.

See `vission.md` §2 for the full list of non-goals.

## Three ideas worth knowing up front

**Authority is separate from RBAC.** RBAC answers *can this user operate BotHandlers?*
Authority answers *is this person empowered to make this business decision?* A finance operator
may be allowed to view and acknowledge an intervention and still be forbidden from approving a
₹10M transaction. Collapsing the two into roles is how compliance failures happen.

**Routing must be explainable.** For any intervention you can ask *"why did this go to Priya?"*
and get a real answer: who was considered, who was excluded and for which specific reason, how
the rest ranked, and what broke the tie.

**Billing is by active human seat, not by agent or activity.** You pay for explicitly enabled
human memberships, and those seats fund a shared, organization-wide intervention pool. Registering
agents is free, and exhausting the pool meters overage rather than dropping an escalation.

## Architecture

Serverless and event-driven on AWS and Cloudflare, in TypeScript.

| Layer | Technology |
|---|---|
| Language | TypeScript (Python SDK is a first-class deliverable) |
| Compute | Cloudflare Workers (API) + AWS Lambda (Background) |
| Database | DynamoDB |
| Async | SQS |
| Timers | EventBridge Scheduler |
| Web / mobile | Next.js · React Native + Expo |
| Infrastructure | Pulumi |
| Local | Wrangler (Cloudflare) |

The choice follows from the shape of the workload: an intervention is created, and then the
system waits minutes or hours for a human. Paying for idle capacity to wait on people is the
wrong cost shape, so **the waiting is done by durable state plus a timer, never by a running
process** — a request handler never waits for a human. State is persisted, work is enqueued, the
invocation exits; the human's response arrives later as a new event.

Two guarantees drive everything else:

> BotHandlers must never silently lose an intervention, and must never silently lose a human decision.

## Infrastructure Stack

BotHandlers utilizes a hybrid "Best of Both Worlds" architecture, leveraging Cloudflare for global edge delivery and security, and AWS for highly durable, transactional state.

### Cloudflare (Edge & Delivery)
* **Cloudflare Pages:** Hosts the Next.js frontend application (`apps/web`), providing global edge caching and instant static delivery.
* **Cloudflare DNS & CDN:** Manages global routing, SSL certificates, and caching for `bothandlers.com` and `dev.bothandlers.com`.
* **Cloudflare Zero Trust (Access):** Secures internal operator dashboards behind strict SSO policies.
* **Cloudflare Workers:** Runs the Hono REST API at the edge to eliminate cold-start latency before hitting the backend database.

### AWS (State & Orchestration)
* **Amazon DynamoDB:** The single source of truth. Handles highly consistent, transactional state for interventions, organizations, and the immutable audit trail.
* **Amazon SQS:** Provides at-least-once delivery guarantees for asynchronous tasks (e.g., delivering webhook callbacks back to the agents).
* **Amazon EventBridge Scheduler:** Manages durable, late-firing timers (e.g., escalating an intervention if an operator doesn't respond within 30 minutes).
* **AWS KMS:** Encrypts and manages application secrets and API keys.

## Local Development

With the migration to Cloudflare Workers for the REST API, local development is completely decoupled from Docker or AWS emulators.

### 1. Run the Frontend (UI)
```bash
cd apps/web
pnpm install
pnpm dev
```

### 2. Run the Backend API (Wrangler)
Because the API runs on Cloudflare Workers, you can use `wrangler` to run a high-fidelity local edge emulator:
```bash
cd backend/api
pnpm install
pnpm run dev
```

*Note: For testing background AWS Lambda workers or AWS infrastructure changes, continue to push your code to the `dev` branch to trigger a deployment to `dev.bothandlers.com`.*

## Deployment

The infrastructure is defined using Pulumi in `infra/pulumi/`. The system uses two environments: `dev` (which acts as staging/pre-production) and `production`.

### 1. Cloud Setup (One-Time Bootstrap)
Before GitHub can deploy to AWS, you must run the one-time Pulumi bootstrap stack from your local machine using your admin AWS credentials. This creates the S3 state bucket, the KMS keys, the GitHub OIDC provider, and the per-environment IAM deploy roles.

**Step-by-Step:**
1. **Authenticate Locally:** Authenticate your terminal with your AWS account using your admin credentials (e.g., `aws sso login`).
2. **Run Bootstrap:** Navigate to the bootstrap directory and run Pulumi to provision the foundational resources:
   ```bash
   cd infra/pulumi/bootstrap
   pulumi up
   ```
3. **Capture Outputs:** The bootstrap stack will output the ARNs of the IAM deploy roles it created (e.g., `arn:aws:iam::<account-id>:role/deploy-role-dev`).
4. **Update Workflows:** Open `.github/workflows/deploy.yml` and replace the `role-to-assume` placeholders with the exact ARNs output in step 3.
5. **Push to GitHub:** Commit your workflow changes and push to `main`. GitHub Actions will now securely assume the deploy roles via OIDC and deploy your `dev` and `production` environments!

### 2. CI/CD Promotion
The GitHub Actions workflow manages continuous deployment using a branch-to-environment mapping:
- **`dev` branch ➔ `dev.bothandlers.com`**: All day-to-day engineering work is merged into the `dev` branch. When pushed, GitHub Actions automatically deploys the code to the `dev` environment.
- **`main` branch ➔ `bothandlers.com`**: When a release is ready, you open a Pull Request from `dev` to `main`. Once this PR is manually reviewed and merged, GitHub Actions automatically deploys the code to the `production` environment.

*Note: Since the local Floci emulator is currently offline, developers should branch off `dev`, do their work, and merge back into `dev` to test in the cloud.*

### 3. Secrets and Environments

#### GitHub Actions Secrets
Because infrastructure state is stored in your own S3 bucket rather than Pulumi Cloud, **no AWS or Pulumi secrets are required** for deployment.
- AWS authentication is handled entirely via GitHub OIDC (you only need to update the `role-to-assume` ARN in the workflow files with your AWS Account ID).
- The Pulumi CLI connects to the S3 state backend using that same OIDC deploy role.

However, to publish the Python and TypeScript SDKs automatically when code is merged to `main` via the `.github/workflows/publish-sdks.yml` pipeline, you must add the following to your repository (**Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**):

* **`CLOUDFLARE_API_TOKEN`**: Generated from your Cloudflare dashboard (Edit Cloudflare Workers permissions). Required for the GitHub Actions pipeline to deploy the Hono REST API.
* **`NPM_TOKEN`**: Generated from your [npmjs.com](https://www.npmjs.com/) account (Automation type). Required to publish `@bothandlers/sdk-typescript`.
* **`PYPI_TOKEN`**: Generated from your [pypi.org](https://pypi.org/) account (Account Settings ➔ API tokens). Required to publish the `bothandlers-sdk` Python package.

#### Application Secrets (AWS KMS)
When your application needs sensitive configuration (like third-party API keys or webhook secrets), they are **not** stored in GitHub. Instead, they are managed via Pulumi secrets:
1. The one-time bootstrap stack creates a dedicated **AWS KMS Key** for each environment (`dev`, `production`).
2. When you run `pulumi config set --secret <key> <value>`, Pulumi automatically encrypts the value using that environment's KMS key before saving it to the state bucket.
3. The Lambda functions then receive these securely decrypted values at runtime as environment variables.

#### Local Development Secrets
The local `.env` file uses dummy AWS credentials (`test`/`test`) that are exclusively used to trick the AWS SDK into authenticating with the local Floci emulator on port 4566. Do not put real secrets here.

## Documentation

| Document | Audience | Contents |
|---|---|---|
| `README.md` | Humans | This overview |
| [`vission.md`](./vission.md) | Everyone | Product source of truth — problem, domain, workflow, non-goals, build order |
| [`architecture.md`](./architecture.md) | Engineers | Technical source of truth — data model, state machine, routing algorithm, API surface, delivery guarantees |
| [`agents.md`](./agents.md) | AI agents | Shared working brief and working rules for any agent contributing here |
| [`claude.md`](./claude.md) | Claude | Claude-specific configuration only |
| [`gemini.md`](./gemini.md) | Gemini | Gemini-specific configuration only |

`vission.md` wins on *what* and *why*; `architecture.md` wins on *how*. The model-specific files
carry configuration only — project context belongs in the first three.

## Repository layout

The target structure is specified in `architecture.md` §18: `apps/` (web, mobile, docs),
`backend/` (api, mcp, workers, application, domain, infrastructure), `packages/` (shared
contracts), `sdk/` (Python and TypeScript), `infrastructure/` (Pulumi), and `docs/` for
external documentation only — internal architecture docs stay at the repository root.

## License

ISC.
