## 1. Local Development Setup

- [x] 1.1 Add `wrangler` as a dev dependency to `backend/api`.
- [x] 1.2 Create `backend/api/wrangler.toml` configured for the REST API.
- [x] 1.3 Update the `backend/api/package.json` scripts to run `wrangler dev` instead of the local Hono server.

## 2. API Migration

- [x] 2.1 Refactor `backend/api/index.ts` to export the Cloudflare Worker default export (`export default app`).
- [x] 2.2 Install `@aws-sdk/client-dynamodb` and `@aws-sdk/client-sqs` into `backend/api` for AWS connectivity.
- [x] 2.3 Refactor the database and queue ports in `backend/api` to use standard AWS SDK v3 with IAM Access Keys injected via environment variables.

## 3. Infrastructure (Pulumi)

- [x] 3.1 Remove the AWS API Gateway components from `infra/pulumi`.
- [x] 3.2 Update `infra/pulumi` to optionally provision the Cloudflare Worker using the Cloudflare Pulumi provider.
- [x] 3.3 Ensure the IAM role for the `backend/api` Cloudflare Worker has an associated IAM User with Access Keys for DynamoDB and SQS.

## 4. CI/CD

- [x] 4.1 Update `.github/workflows/deploy-dev.yml` to run `npx wrangler deploy` for the `backend/api`.
- [x] 4.2 Update `.github/workflows/deploy-prod.yml` to run `npx wrangler deploy` for the `backend/api`.
- [x] 4.3 Add `CLOUDFLARE_API_TOKEN` documentation to `README.md` for GitHub Secrets.
