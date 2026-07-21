# Documentation Guideline

This guideline defines the default workflow for building BothAndlers. When a user asks to build, change, or add something, the work should happen in this order.

## Build Workflow

1. Document the request.
2. Update the feature definition.
3. Update the technical design.
4. Start implementation.
5. Verify the change.
6. Update documentation again if implementation changes the plan.

## 1. Document The Request

Before implementation, write down what is being built and why.

Capture:

- User request
- Problem being solved
- Expected behavior
- Non-goals
- Assumptions
- Open questions
- Acceptance criteria

If the request is unclear, document the uncertainty before making a decision.

## 2. Update Features

Update files in `features/` before implementation.

Feature documentation should describe:

- User-facing behavior
- Main workflow
- Inputs and outputs
- Edge cases
- Required permissions or approvals
- Success and failure states
- MVP scope versus later scope

The feature document should be understandable without reading the code.

## 3. Update Tech

Update files in `tech/` after the feature behavior is clear.

Technical documentation should describe:

- Architecture impact
- Data model changes
- Interfaces or APIs
- Runtime behavior
- Tool, agent, or policy changes
- Storage changes
- Error handling
- Verification plan

The tech document should explain how the feature will be built and where it fits in the system.

## 4. Start Implementation

Only start coding after the documentation, feature definition, and technical design are updated enough to guide the work.

During implementation:

- Keep changes aligned with the documented feature scope.
- Update the plan if code reality changes the design.
- Avoid unrelated refactors.
- Preserve existing user work.

## 5. Verify The Change

Every implemented change should have a verification step.

Use the lightest reliable verification that fits the change:

- Unit tests for isolated logic.
- Integration tests for cross-component behavior.
- CLI runs for command workflows.
- Manual checks for documentation-only changes.

## 6. Final Update

Before finishing, check whether the implementation changed any assumptions.

If it did, update:

- `features/`
- `tech/`
- Any request or decision notes

Then summarize what changed and how it was verified.

## Default Rule

For any build request:

```text
document -> features -> tech -> implementation -> verification -> doc cleanup
```
