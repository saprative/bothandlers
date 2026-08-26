## Why

The Agentic Routing Engine requires an internal "Dispatcher Agent" to evaluate interventions using natural language SOPs. Because the BotHandlers backend is built in TypeScript on AWS Lambda, we need a lightweight, Serverless-friendly LLM framework. We are adopting the **Vercel AI SDK** because it provides native TypeScript tool-calling (`generateText`), avoids the extreme cold-start penalties of heavier frameworks like LangChain, and allows us to easily swap underlying models (OpenAI, Anthropic, Bedrock) in the future.

## What Changes

- Implement the Dispatcher Agent using Vercel AI SDK inside a new AWS Lambda handler (`backend/workers/routing.ts`).
- Integrate the Vercel AI SDK's tool-calling capabilities so the Dispatcher Agent can securely query the BotHandlers directory (Teams, Schedules, Skills).
- Ensure the agent emits a Chain-of-Thought (CoT) trace that can be persisted to the intervention's immutable audit log.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- This is a pure implementation change to fulfill the existing `routing/agentic-engine` specification. No spec-level behaviors are changing, so specs are skipped for this change.

## Impact

- **Backend Workers:** Introduces a new dependency (`ai`, `@ai-sdk/openai`, etc.) to the `backend/workers` package.
- **Infrastructure:** The `routing` Lambda function will require network access and API keys to reach the chosen LLM provider.
