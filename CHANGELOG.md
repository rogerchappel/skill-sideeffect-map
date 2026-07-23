# Changelog

## Unreleased

- Scope approval checks to each high-risk evidence line and report actionable file, line, and category details.
- Treat negated approval wording as unapproved and add regression fixtures for unrelated, scoped, and partially approved actions.

## 0.1.0

- Initial release-candidate surface for the local side-effect mapping CLI.
- Includes deterministic scan/check commands, fixture smoke coverage, and npm package verification.
- Added public package metadata for the repository, issue tracker, homepage, license, and Node.js runtime support.
- Added an npm `files` allowlist and package smoke check that verifies CLI entrypoints and packed runtime fixtures.
- Added a `release:check` command and CI workflow for checks, tests, fixture smoke coverage, build, and npm pack verification.
