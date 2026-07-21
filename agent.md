# BothAndlers Agent Orchestrator

BothAndlers is an open source agent orchestrator focused on coordinating many specialized agents without hiding the tradeoffs between autonomy, control, cost, and reliability.

## Purpose

- Route work to the right agent or tool.
- Keep agent decisions inspectable and auditable.
- Support human review where risk or ambiguity is high.
- Make orchestration reusable across local, server, and workflow environments.

## Principles

- Explicit over implicit: plans, tool calls, permissions, and state transitions should be visible.
- Composable over monolithic: agents, tools, memory, policies, and runtimes should be replaceable parts.
- Human-centered autonomy: users should be able to approve, pause, redirect, or override important actions.
- Open source first: documentation, examples, and extension points should be understandable without private infrastructure.

## Core Areas

- [[documentation-guideline|Documentation Guideline]]: required workflow for build requests.
- [[features/README|Features]]: product capabilities, user workflows, agent behaviors, and roadmap.
- [[tech/README|Tech]]: architecture, runtime model, data model, integrations, and implementation decisions.

## Starting Questions

- What is the smallest useful orchestration loop?
- How are agents registered, selected, and supervised?
- What state needs to persist between runs?
- Which actions require explicit user approval?
- How should failures, retries, and partial progress be represented?

## Initial Milestones

1. Follow [[documentation-guideline|Documentation Guideline]] for every build request.
2. Define the orchestration model in [[tech/README|Tech]].
3. Prioritize the MVP feature set in [[features/README|Features]].
4. Specify agent, tool, memory, and approval interfaces.
5. Build a minimal local runner.
6. Publish examples that show real multi-agent workflows.
