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

Approval is scoped to each high-risk evidence line and must positively require approval. For example, `Ask for approval before you send an email` passes for that messaging action. Approval mentioned only for a different action does not carry over.

Supported positive gates put the approval and action on the same line using an explicit ordering or condition, such as:

- requesting, obtaining, requiring, or waiting for approval before the action;
- performing the action only after receiving approval; or
- performing the action if, when, or once the user gives approval.

Negated and non-requirement wording fails, including:

- `Send an email without confirmation.`
- `Approval is not required before sending an email.`
- `You do not need confirmation before posting a message.`
- `Consent is optional before you message the customer.`

Merely describing an approval outcome is also insufficient. Wording such as `If approval is denied, send the email anyway`, or actions taken when approval fails, is refused, or is absent, does not authorize the action.

Failure output identifies the file, line, and high-risk category that needs an explicit approval instruction.

## Safety Notes

The CLI does not call remote services, install skills, enforce runtime permissions, or read secret values. It is an evidence helper for humans and agents reviewing side-effect boundaries.

## Limitations

Classification is keyword based. Treat the output as a review queue, not a security guarantee.
