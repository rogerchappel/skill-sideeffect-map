# skill-sideeffect-map

`skill-sideeffect-map` is a local-first CLI for reviewing agent skill docs before they are installed or shared. It scans Markdown and JSON files for tool use, external side effects, approval gaps, and dry-run recommendations.

## Quickstart

```bash
npm install
npm test
node bin/skill-sideeffect-map.js scan fixtures/skill-basic --format markdown
node bin/skill-sideeffect-map.js check fixtures/skill-missing-approval
```

## Commands

- `scan <path>` emits a JSON or Markdown side-effect report.
- `check <path>` fails when high-risk side effects lack approval language.
- `render <path>` produces release-note friendly Markdown.

## Safety Notes

The CLI does not call remote services, install skills, enforce runtime permissions, or read secret values. It is an evidence helper for humans and agents reviewing side-effect boundaries.

## Limitations

Classification is keyword based. Treat the output as a review queue, not a security guarantee.
