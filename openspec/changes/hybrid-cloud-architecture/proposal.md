## Why

The current deployment architecture heavily relies on AWS Lambda and API Gateway for the BotHandlers REST API. This introduces cold-start latencies and limits local development ergonomics since the local emulator (`floci`) is currently offline. We want to leverage a "Best of Both Worlds" hybrid compute model: migrating the synchronous REST API to Cloudflare Workers for instant edge responses, while retaining AWS Lambda for long-running asynchronous SQS background tasks (like the LLM routing engine).

## What Changes

- Migrate the `backend/api` Hono application to be deployed as a Cloudflare Worker.
- Remove AWS API Gateway from the Pulumi infrastructure definition.
- Keep AWS SQS, DynamoDB, EventBridge, and KMS.
- Keep `backend/workers` running as AWS Lambda functions triggered by SQS.
- Ensure the Cloudflare Worker API securely passes messages to AWS SQS using AWS API keys/SignV4.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- This is a pure architectural and infrastructure change. No spec-level behaviors are changing, so specs are skipped for this change.

## Impact

- **Infrastructure:** Reduces AWS costs (eliminates API Gateway), significantly improves API latency (zero cold starts).
- **Local Dev:** Allows using Cloudflare `wrangler dev` for running the API locally without Docker or Floci.
- **Complexity:** Requires the Cloudflare Worker to authenticate with AWS to enqueue SQS messages.
