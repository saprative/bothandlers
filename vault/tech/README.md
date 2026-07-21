# Tech

This folder tracks the technical architecture and implementation plan for BothAndlers.

## Architecture Overview

BothAndlers should be built around a small orchestration core. Agents, tools, memory stores, policy checks, and execution backends plug into that core through explicit interfaces.

```text
User / API / CLI
      |
      v
Orchestrator Core
      |
      +-- Planner
      +-- Scheduler
      +-- Agent Runtime
      +-- Tool Router
      +-- Policy Engine
      +-- Memory Manager
      +-- Event Log
      |
      v
Storage + Integrations + Execution Backends
```

## Core Components

### Orchestrator Core

- Owns the lifecycle of a run.
- Converts user goals into tasks, plans, steps, and events.
- Coordinates agents and tools.
- Enforces permissions before actions happen.
- Produces final outputs and run summaries.

### Planner

- Turns a task into a structured plan.
- Defines steps, dependencies, expected outputs, and risk levels.
- Updates the plan when new information or failures appear.

### Scheduler

- Decides which step runs next.
- Assigns steps to agents.
- Supports sequential, parallel, and dependency-based execution.
- Prevents conflicting actions from running at the same time.

### Agent Runtime

- Runs agents through a common interface.
- Supports local model calls, remote agents, hosted services, and scripted agents.
- Passes agents only the context and tools they are allowed to use.
- Converts agent output into structured events.

### Tool Router

- Receives tool requests from agents.
- Checks tool availability, permissions, and required approvals.
- Executes tools through adapters.
- Normalizes tool results and errors.

### Policy Engine

- Decides whether an action is allowed, denied, or requires approval.
- Uses workspace policy, user preference, tool risk, and task context.
- Should be deterministic and auditable.

### Memory Manager

- Loads relevant context for a run.
- Writes durable decisions and reusable facts after approval or clear signal.
- Separates short-term context from long-term memory.
- Tracks provenance so memory can be inspected.

### Event Log

- Stores every important state transition.
- Acts as the source of truth for run history, debugging, replay, and audit.
- Emits events to the CLI, UI, logs, or external observability systems.

## Data Model

### Run

- `id`
- `objective`
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `workspace_id`
- `plan_id`
- `summary`

### Plan

- `id`
- `run_id`
- `version`
- `steps`
- `assumptions`
- `risks`
- `status`

### Step

- `id`
- `plan_id`
- `title`
- `description`
- `status`
- `assigned_agent_id`
- `dependencies`
- `expected_output`
- `risk_level`

### Agent

- `id`
- `name`
- `description`
- `capabilities`
- `allowed_tools`
- `limits`
- `runtime`
- `status`

### Tool

- `id`
- `name`
- `description`
- `input_schema`
- `output_schema`
- `risk_level`
- `adapter`
- `approval_required`

### Event

- `id`
- `run_id`
- `type`
- `timestamp`
- `actor`
- `payload`
- `parent_event_id`

## Suggested Interfaces

### Agent Interface

```ts
type AgentInput = {
  runId: string;
  stepId: string;
  objective: string;
  context: ContextBlock[];
  allowedTools: ToolDefinition[];
};

type AgentOutput = {
  status: "complete" | "blocked" | "failed" | "needs_tool";
  message: string;
  toolRequest?: ToolRequest;
  artifacts?: Artifact[];
};
```

### Tool Interface

```ts
type ToolRequest = {
  toolName: string;
  input: unknown;
  reason: string;
  riskLevel: "low" | "medium" | "high";
};

type ToolResult = {
  status: "success" | "error" | "denied";
  output?: unknown;
  error?: string;
};
```

### Policy Interface

```ts
type PolicyDecision = {
  decision: "allow" | "deny" | "needs_approval";
  reason: string;
  approvalPrompt?: string;
};
```

## Runtime Modes

### Local CLI

- Best first target for open source adoption.
- Runs from a project directory.
- Uses local config files.
- Writes run history to local storage.

### Server

- Exposes API endpoints for creating and managing runs.
- Supports multiple users and workspaces.
- Stores events and state in a database.

### Worker

- Executes long-running steps.
- Handles retries, queues, and background workflows.
- Can run in containers or sandboxed environments.

## Storage

### MVP

- Local filesystem for config, memory, and run logs.
- SQLite for structured run history if queries become important.

### Later

- Postgres for hosted or team deployments.
- Object storage for artifacts.
- Vector storage for semantic memory search.

## Configuration

Suggested project config:

```yaml
project: bothandlers
agents:
  - id: planner
    runtime: local
    capabilities: [planning, decomposition]
    tools: []
  - id: coder
    runtime: local
    capabilities: [code_editing, debugging]
    tools: [filesystem, shell, git]
policies:
  shell:
    approval: important_actions
  filesystem:
    approval: destructive_actions
memory:
  provider: filesystem
```

## Technical Decisions To Make

- Primary implementation language.
- Config format and file layout.
- Whether the event log is append-only from day one.
- How strict agent schemas should be in the MVP.
- Which model providers are supported first.
- Whether tools are built in-process, through MCP, or both.
- How sandboxing works for local shell and filesystem actions.

## MVP Implementation Path

1. Build a CLI that accepts a goal and creates a run.
2. Store run events as JSONL.
3. Implement a planner agent and one worker agent.
4. Add a tool router with filesystem and shell adapters.
5. Add approval checks for risky shell and file actions.
6. Print a final run summary.
7. Add examples and developer documentation.
