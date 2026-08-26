## Context

Currently, the BotHandlers infrastructure is entirely defined within AWS (Lambda, API Gateway, DynamoDB, SQS, EventBridge). Due to limitations with local AWS emulation (Floci), local development of the REST API is hindered. Additionally, AWS API Gateway introduces noticeable cold-start latency. See `proposal.md` for the motivation to split compute between Cloudflare Workers and AWS Lambda.

## Goals / Non-Goals

**Goals:**
- Move `backend/api` (the Hono application) to Cloudflare Workers using Wrangler.
- Continue to use DynamoDB and SQS securely from the Cloudflare Worker.
- Keep `backend/workers` (async LLM routing, callbacks) running on AWS Lambda triggered by SQS.
- Update the Pulumi deployment scripts to remove API Gateway and provision Cloudflare Workers instead.

**Non-Goals:**
- Do not migrate DynamoDB to Cloudflare D1 or KV.
- Do not migrate AWS SQS to Cloudflare Queues. We explicitly want the 15-minute AWS Lambda timeout for the Agentic LLM Engine.

## Decisions

### 1. API Deployment: Cloudflare Workers
**Rationale:** The existing `backend/api` is built with Hono. Hono is edge-native and treats Cloudflare Workers as a first-class deployment target. It requires almost zero application code changes to migrate from the `hono/aws-lambda` adapter to the standard Cloudflare Worker export (`export default app`).
**Alternatives:** Retain AWS API Gateway and Lambda (suffers cold starts, harder local dev).

### 2. Cross-Cloud Authentication (Worker to AWS)
**Rationale:** The Cloudflare Worker must authenticate with AWS to save interventions to DynamoDB and enqueue messages into SQS. We will provide the Cloudflare Worker with AWS IAM Access Keys via Cloudflare Secrets. We will use the `@aws-sdk/client-dynamodb` and `@aws-sdk/client-sqs` libraries, which are modular and function correctly within the V8 isolate environment of a Worker.
**Alternatives:** AWS Signature V4 with raw `fetch` (more manual boilerplate but slightly smaller bundle size).

### 3. Local Development with Wrangler
**Rationale:** We will completely drop `floci` from the local development loop. Instead, engineers will run `pnpm run dev` in `backend/api`, which will invoke `wrangler dev`. This spins up a high-fidelity local emulator for the Cloudflare Worker instantly.

## Risks / Trade-offs

- **Risk: AWS Egress/Ingress Costs** → Moving compute outside of AWS means AWS will charge standard Data Transfer Out rates if DynamoDB/SQS responses are large. 
- **Mitigation:** API payloads and database reads are tiny JSON objects (kilobytes). Free tier includes 100GB of egress.
- **Risk: Bundle Size** → Including the AWS SDK inside a Cloudflare Worker could bloat the bundle.
- **Mitigation:** The AWS SDK v3 is highly modular. We will only import the exact clients needed (`@aws-sdk/client-sqs`, etc.) to stay well under the 1MB Cloudflare Worker size limit.

## Migration Plan

1. Create a `wrangler.toml` file in `backend/api`.
2. Update the `index.ts` entrypoint in `backend/api` from the AWS Lambda adapter to the Cloudflare Worker default export.
3. Add Cloudflare provider configuration to `infra/pulumi`.
4. Remove `apigw.ts` and the API Lambda from Pulumi.
5. Provision the Cloudflare Worker via Pulumi or GitHub Actions using the `CLOUDFLARE_API_TOKEN`.
