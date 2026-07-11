# skill-sideeffect-map

Use this skill when reviewing an agent skill, playbook, or connector guide for side effects and approval boundaries.

## Inputs

- A directory containing `SKILL.md`, README files, Markdown docs, or JSON manifests.
- Optional release notes that need an approval summary.

## Workflow

1. Run `skill-sideeffect-map scan <path> --format markdown`.
2. Review high-risk categories: credentialed connectors, messaging, repository actions, scheduled jobs, shell execution, and filesystem writes.
3. Run `skill-sideeffect-map check <path>` before publishing the skill.
4. Add explicit approval or dry-run notes for every high-risk external action.

## Boundaries

This skill is read-only. It must not install, approve, publish, message, or push anything on behalf of the scanned skill.

## Validation

Run `npm test`, `npm run smoke`, and `bash scripts/validate.sh`.
