export function checkReport(report) {
  const high = report.evidence.filter((item) => item.risk === "high");
  const unapproved = high.filter((item) => !hasExplicitApproval(item.text));
  return {
    ok: unapproved.length === 0,
    failures: unapproved.map(
      (item) => `${item.file}:${item.line} ${item.category} requires explicit approval on the same evidence line.`
    ),
    highRiskCount: high.length
  };
}

function hasExplicitApproval(text) {
  const approval = /\b(approval|confirm(?:ation)?|consent)\b/i;
  const negated = /\b(?:without|no|not|never)\s+(?:explicit\s+)?(?:user\s+)?(?:approval|confirm(?:ation)?|consent)\b|\bdo\s+not\s+(?:ask|require|wait)\s+for\s+(?:explicit\s+)?(?:user\s+)?(?:approval|confirm(?:ation)?|consent)\b/i;
  return approval.test(text) && !negated.test(text);
}
