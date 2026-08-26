## 1. Setup

- [ ] 1.1 Install `ai` and `@ai-sdk/openai` to the `backend/workers` package dependencies.
- [ ] 1.2 Export OpenAI API Key configuration from Pulumi into the AWS Lambda environment for the `routing` worker.

## 2. Tools Implementation

- [ ] 2.1 Create `backend/workers/tools/get-teams.ts` defining a Vercel AI SDK tool that fetches team data based on skills.
- [ ] 2.2 Create `backend/workers/tools/get-on-call.ts` defining a Vercel AI SDK tool that fetches available on-call users for a team.

## 3. Dispatcher Agent Implementation

- [ ] 3.1 Create `evaluateAgenticRouting` function in `backend/workers/routing.ts` using `generateText`.
- [ ] 3.2 Wire the tools into the `generateText` call.
- [ ] 3.3 Implement the system prompt instructing the model to output reasoning and a final assigned user ID.
- [ ] 3.4 Extract the `rationale` from the model's response and save it to the DynamoDB audit trail.

## 4. Validation and Fallback

- [ ] 4.1 Implement a Zod validation step to verify the LLM's selected `assignedUserId` exists in the organization directory.
- [ ] 4.2 Implement a fallback route (e.g., assign to organization admin) if the LLM hallucinated an invalid user ID.
