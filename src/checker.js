export function checkReport(report) {
  const high = report.evidence.filter((item) => item.risk === "high");
  const unapproved = high.filter((item) => !hasExplicitApproval(item.actionText ?? item.text));
  return {
    ok: unapproved.length === 0,
    failures: unapproved.map(
      (item) => `${item.file}:${item.line} ${item.category} requires explicit approval on the same evidence line.`
    ),
    highRiskCount: high.length
  };
}

function hasExplicitApproval(text) {
  const approval = String.raw`(?:explicit\s+)?(?:user\s+)?(?:approval|confirm(?:ation)?|consent)`;
  const nonAuthorizing = [
    new RegExp(String.raw`\b(?:without|no|not|never)\s+${approval}\b`, "i"),
    new RegExp(String.raw`\b(?:do\s+not|don't|need\s+not)\b[^.]*\b${approval}\b`, "i"),
    new RegExp(String.raw`\b${approval}\s+(?:is\s+not|isn't|was\s+not|wasn't)\b`, "i"),
    new RegExp(String.raw`\b${approval}\s+(?:is\s+)?(?:optional|unnecessary)\b`, "i")
  ];
  const positiveGates = [
    new RegExp(
      String.raw`\b(?:ask|request|obtain|get|receive|secure|require|wait)\s+(?:for\s+)?${approval}\s+(?:before|prior\s+to)\b`,
      "i"
    ),
    new RegExp(
      String.raw`\b${approval}\s+(?:is\s+)?(?:required|needed|necessary)\s+(?:before|prior\s+to)\b`,
      "i"
    ),
    new RegExp(
      String.raw`\bonly\b.+\b(?:after|upon)\s+(?:obtaining|receiving|getting|securing)\s+${approval}\b`,
      "i"
    ),
    new RegExp(
      String.raw`\b(?:if|once|when|after)\s+(?:the\s+)?(?:user\s+)?(?:gives?|grants?|provides?|confirms?|has\s+given|has\s+granted|has\s+provided)\s+${approval}\b`,
      "i"
    )
  ];
  return !nonAuthorizing.some((pattern) => pattern.test(text))
    && positiveGates.some((pattern) => pattern.test(text));
}
