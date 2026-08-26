## Context

We are implementing the backend for the `routing/agentic-engine` capability (defined in the `openspec/specs`). The system requires a Dispatcher Agent to execute prompt-based logic against the BotHandlers directory context. See `proposal.md` for framework selection context.

## Goals / Non-Goals

**Goals:**
- Provide a `evaluateAgenticRouting(intervention)` function in `backend/workers/routing.ts`.
- Integrate the Vercel AI SDK (`ai` and `@ai-sdk/openai`).
- Expose the BotHandlers domain directory (users, teams, skills, schedules) as tools to the LLM.
- Persist the LLM's Chain-of-Thought (CoT) reasoning to the intervention audit log.

**Non-Goals:**
- Do not implement custom UI for the agentic engine in this change.
- Do not build complex LangGraph-style state machines; stick to single-shot or tool-loop text generation.

## Decisions

### 1. Framework: Vercel AI SDK
**Rationale:** The backend runs in AWS Lambda (`backend/workers`). Vercel AI SDK is incredibly lightweight and natively supports typed tool calling in TypeScript. 
**Alternatives:** LangChain (too heavy, slow cold starts), AWS Bedrock Raw SDK (clunky developer experience), OpenAI raw SDK (vendor lock-in).

### 2. Model Agnosticism
**Rationale:** While we will start with OpenAI's `gpt-4o-mini` for the Dispatcher Agent for speed and cost, we will structure the code to use the Vercel AI SDK's abstraction layer. This allows enterprise customers to bring their own AWS Bedrock models later simply by changing the provider string.

### 3. Tool Definition Strategy
**Rationale:** The Dispatcher Agent needs context. Instead of stuffing the entire organization directory into the system prompt (which wastes tokens and could hit limits for large organizations), we will define strict `zod` schema tools:
- `getTeams(skill)`: Returns teams matching a specific skill.
- `getOnCall(teamId)`: Returns the currently available human on a team.
The Vercel AI SDK will execute these tools, run the domain logic, and return the result to the LLM.

### 4. Chain-of-Thought Logging
**Rationale:** We need to satisfy the requirement that routing decisions are fully explainable. We will use the Vercel AI SDK's `generateText` with `steps` or a strict JSON output schema that requires a `rationale` field before the `assignedUserId` field. We will save this `rationale` string directly into the DynamoDB `audit_trail` list for the intervention.

## Risks / Trade-offs

- **Risk: Cold Starts** → Using Vercel AI SDK over raw fetch adds a small dependency size to the Lambda deployment.
- **Mitigation:** We will ensure `backend/workers` bundles cleanly via Turborepo/esbuild so the deployment package stays under a few MBs.
- **Risk: Hallucination in Routing** → The LLM could route to a non-existent user.
- **Mitigation:** We will validate the LLM's final selected `assignedUserId` against the actual database before applying the route. If it fails validation, it falls back to a default escalation path.
