# Product Requirements

Build a local CLI that maps side effects in agent skill documentation and highlights missing approval language.

## Users

- Agent skill authors preparing public OSS packages.
- Reviewers checking reusable workflows before installation.

## Requirements

- Scan Markdown and JSON files recursively.
- Classify side-effect categories with evidence line numbers.
- Render JSON and Markdown reports.
- Fail checks for high-risk side effects without approval language.
- Include fixtures, tests, smoke command, and validation script.
