# Release Candidate Notes

## Classification

Ship.

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`

## Known Limits

Keyword and same-clause context classification can miss implicit or unusually phrased side effects. Quoted text is treated as descriptive, and mixed-polarity clauses may require human review.
