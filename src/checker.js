export function checkReport(report) {
  const high = report.evidence.filter((item) => item.risk === "high");
  const hasApprovalLanguage = report.evidence.some((item) => /approval|confirm|consent/i.test(item.text));
  const ok = high.length === 0 || hasApprovalLanguage;
  return {
    ok,
    failures: ok ? [] : ["High-risk side effects require explicit approval language."],
    highRiskCount: high.length
  };
}
