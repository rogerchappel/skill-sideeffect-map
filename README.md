# skill-sideeffect-map

`skill-sideeffect-map` is a local-first CLI for reviewing agent skill docs before they are installed or shared. It scans Markdown and JSON files for tool use, external side effects, approval gaps, and dry-run recommendations.

## Quickstart

```bash
npm install
npm test
npm run release:check
node bin/skill-sideeffect-map.js scan fixtures/skill-basic --format markdown
node bin/skill-sideeffect-map.js check fixtures/skill-missing-approval
```

## Commands

- `scan <path>` emits a JSON or Markdown side-effect report.
- `check <path>` fails when any high-risk evidence line lacks its own positive approval language.
- `render <path>` produces release-note friendly Markdown.

## Release Verification

Run the release gate before opening a release-facing pull request:

```bash
npm run release:check
```

The gate runs syntax checks, the Node test suite, a fixture-backed CLI smoke, and an `npm pack --dry-run` package check. CI runs the same command on pull requests and pushes to `main`.

## Approval Check Semantics

Approval is scoped to each high-risk evidence line. For example, `Ask for approval before you send an email` passes for that messaging action. Approval mentioned only for a different action does not carry over, and negated wording such as `send an email without confirmation` fails. Failure output identifies the file, line, and high-risk category that needs an explicit approval instruction.

## Safety Notes

The CLI does not call remote services, install skills, enforce runtime permissions, or read secret values. It is an evidence helper for humans and agents reviewing side-effect boundaries.

## Limitations

Classification is keyword based. Treat the output as a review queue, not a security guarantee.
