# Claude Agent Integration

**Project context lives in [`vission.md`](./vission.md) (source of truth) and
[`agents.md`](./agents.md) (shared working brief). Read those first.**

BotHandlers is a human-in-the-loop management platform — human-intervention infrastructure
for AI agents. It is *not* an agent framework or orchestrator; see `vission.md` §2 for
the explicit non-goals.

This file covers Claude-specific configuration only.

## Purpose

- Define Claude-specific system prompts for BotHandlers' own use of Claude.
- Outline Claude's tool-use capabilities and limitations relevant to the MCP surface
  (`human.request`, `human.review`, `human.choose`, `human.approve`,
  `human.request_information`, `human.takeover`, `human.escalate`, `human.status` —
  see `vission.md` §8).
- Document Claude-specific token and cost considerations.

## Working Rules

Follow the working rules in [`agents.md`](./agents.md). In particular: design before
implementation, keep the critical end-to-end path the priority, audit every state
transition, and keep operator-facing language free of LLM and agent-framework vocabulary.
