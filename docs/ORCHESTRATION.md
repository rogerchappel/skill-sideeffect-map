# Orchestration

1. Collect candidate skill docs.
2. Run the scanner locally.
3. Inspect high-risk categories.
4. Patch docs with approval, dry-run, and side-effect boundaries.
5. Re-run `check` and include the Markdown report in release-candidate notes.

No command in this workflow writes outside the project unless the caller separately edits documentation.
