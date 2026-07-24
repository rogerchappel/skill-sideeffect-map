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
  const approvalToken = String.raw`(?:explicit\s+)?(?:user\s+)?(?:approval|confirm(?:ation)?|consent)`;
  const negated = [
    new RegExp(String.raw`\b(?:without|no|not|never)\s+${approvalToken}\b`, "i"),
    new RegExp(String.raw`\b(?:do\s+not|don't)\s+(?:ask|require|wait|need)\s+(?:for\s+)?${approvalToken}\b`, "i"),
    new RegExp(String.raw`\b${approvalToken}\s+(?:is\s+not|isn't)\s+(?:required|needed|necessary)\b`, "i"),
    new RegExp(String.raw`\b${approvalToken}\s+(?:is\s+)?(?:optional|unnecessary)\b`, "i"),
    new RegExp(String.raw`\bno\s+${approvalToken}\s+is\s+(?:required|needed|necessary)\b`, "i"),
    new RegExp(String.raw`\bneed\s+not\s+(?:ask\s+for|obtain|require|wait\s+for)\s+${approvalToken}\b`, "i")
  ];
  return approval.test(text) && !negated.some((pattern) => pattern.test(text));
}
