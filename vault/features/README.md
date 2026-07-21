# Features

This folder tracks the product surface of BothAndlers: what users can do, what agents can do, and how orchestration should feel in real workflows.

## MVP Features

### Agent Registry

- Register agents with name, description, capabilities, limits, and supported tools.
- Mark agents as local, remote, hosted, or user-provided.
- Store agent metadata in a readable project config.
- Enable or disable agents per workspace.
- Support agent tags such as `coding`, `research`, `planning`, `review`, `ops`, and `docs`.

### Task Intake

- Accept a user goal in natural language.
- Convert the goal into a structured task with objective, constraints, expected output, and risk level.
- Detect missing information before starting when assumptions would be risky.
- Allow task priority and timeout settings.

### Planning

- Generate an execution plan before action.
- Split complex work into steps and assign each step to an agent.
- Track step status as `pending`, `in_progress`, `blocked`, `failed`, or `complete`.
- Support replanning when an agent fails, new context appears, or the user redirects the task.

### Agent Selection

- Choose agents based on task type, declared capabilities, past outcomes, cost, latency, and permission level.
- Allow manual agent override.
- Support fallback agents when the preferred agent is unavailable.
- Prevent agents from taking work outside their declared scope.

### Tool Routing

- Route tool calls through the orchestrator instead of letting agents call tools directly.
- Match tools to agent capabilities and user permissions.
- Record every tool request, approval, result, and error.
- Support tool adapters for shell commands, HTTP APIs, databases, browsers, GitHub, Linear, Slack, Notion, and local files.

### Human Approval

- Pause before high-impact actions such as deleting files, spending money, sending messages, deploying, or changing production systems.
- Show the proposed action, expected effect, and rollback options before approval.
- Support approval policies such as always ask, ask for important actions, and allow safe actions.
- Let users deny, edit, or approve a proposed action.

### Memory And Context

- Keep short-term run context for the current task.
- Keep long-term project memory for durable decisions, conventions, and recurring facts.
- Separate user memory, workspace memory, and agent memory.
- Make memory citations visible when prior context influences an answer.
- Support forgetting or editing stored memory.

### Run History

- Store a timeline of plans, agent messages, tool calls, approvals, errors, and outputs.
- Make runs searchable by task, agent, status, date, and tool.
- Let users resume a paused or failed run.
- Export run logs for debugging and audits.

### Observability

- Show active agents, current step, tool calls, pending approvals, and token or cost usage.
- Emit structured events for dashboards and logs.
- Surface failure reasons clearly instead of hiding them in raw logs.
- Provide a compact summary at the end of every run.

### Workflow Templates

- Save reusable workflows such as code review, issue triage, release prep, research brief, data cleanup, and documentation update.
- Allow workflows to define required agents, tools, approval rules, and output formats.
- Support parameters so templates can be reused across projects.

### Failure Recovery

- Retry transient failures with limits.
- Replan after repeated failures.
- Ask the user for help only when the orchestrator cannot make meaningful progress.
- Preserve partial work and explain what is complete, failed, or blocked.

## Later Features

- Multi-user workspaces.
- Hosted control plane.
- Agent marketplace or plugin registry.
- Policy engine for organizations.
- Cost budgets per workspace, user, agent, or run.
- Evaluation harness for comparing agents.
- Visual workflow builder.
- Scheduled or event-triggered workflows.
- Sandboxed remote execution.
- Team review queues.

## Example Workflows

### Code Change Workflow

1. User describes a bug or feature.
2. Planner agent breaks the work into steps.
3. Coding agent edits files.
4. Test agent runs verification.
5. Review agent checks for regressions.
6. Orchestrator summarizes changes and remaining risks.

### Research Workflow

1. User asks for a research brief.
2. Research agent gathers sources.
3. Analysis agent extracts claims, tradeoffs, and open questions.
4. Writing agent drafts the final brief.
5. Review agent checks citations and unsupported claims.

### Operations Workflow

1. User asks to investigate an incident.
2. Orchestrator gathers logs, metrics, deployments, and recent changes.
3. Diagnosis agent proposes likely causes.
4. Human approves any production-impacting action.
5. Fix agent applies or prepares the remediation.
6. Orchestrator writes the incident summary.
