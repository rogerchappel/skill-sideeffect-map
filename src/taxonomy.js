const rules = [
  ["credentialed connector", "high", /\b(slack|gmail|notion|salesforce|hubspot|connector|accountid|token|api key|secret)\b/i, "Mentions credentialed service or secret-bearing connector."],
  ["messaging", "high", /\b(send|post|notify|dm|email|message)\b/i, "May communicate outside the workspace."],
  ["repository action", "medium", /\b(git push|pull request|merge|release|tag|github)\b/i, "May change repository state or release surfaces."],
  ["scheduled job", "medium", /\b(cron|schedule|recurring|automation turn)\b/i, "May run without direct user presence."],
  ["shell execution", "medium", /\b(shell|exec|command|npm|pnpm|yarn|bash|python|node)\b/i, "May execute local commands."],
  ["filesystem write", "medium", /\b(write|edit|patch|delete|remove|rename|create file|apply_patch)\b/i, "May alter local files."],
  ["network fetch", "medium", /\b(fetch|download|web_search|browser|http|https|network)\b/i, "May read from the network."],
  ["media generation", "low", /\b(image|video|audio|tts|render|generate media)\b/i, "May create media artifacts."],
  ["browser automation", "medium", /\b(playwright|screenshot|click|navigate|headless chrome)\b/i, "May automate a browser session."]
];

export function classifyLine(line) {
  return rules
    .filter(([, , pattern]) => pattern.test(line))
    .map(([category, risk, , reason]) => ({ category, risk, reason }));
}
