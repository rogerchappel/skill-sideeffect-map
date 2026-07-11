export function renderJson(report) {
  return JSON.stringify(report, null, 2);
}

export function renderMarkdown(report) {
  const lines = [`# Side Effect Map`, "", `Target: \`${report.target}\``, ""];
  if (report.categories.length === 0) {
    lines.push("No side effects detected.", "");
  } else {
    lines.push("| Category | Risk | Evidence |", "|---|---|---:|");
    for (const item of report.categories) {
      lines.push(`| ${item.category} | ${item.maxRisk} | ${item.count} |`);
    }
    lines.push("");
  }
  if (report.check) {
    lines.push(`Check: ${report.check.ok ? "pass" : "fail"}`, "");
    for (const failure of report.check.failures) lines.push(`- ${failure}`);
  }
  lines.push("## Evidence", "");
  for (const item of report.evidence) {
    lines.push(`- \`${item.file}:${item.line}\` ${item.risk} ${item.category}: ${item.text}`);
  }
  lines.push("", "## Recommendations", "");
  for (const item of report.recommendations) lines.push(`- ${item}`);
  return lines.join("\n");
}
