const actionRules = [
  {
    category: "credentialed connector",
    risk: "high",
    pattern: /\b(slack|gmail|notion|salesforce|hubspot|connector|accountid|token|api key|secret)\b/gi,
    reason: "Mentions an intended action involving a credentialed service or secret-bearing connector.",
    requiresActionContext: true
  },
  {
    category: "messaging",
    risk: "high",
    pattern: /\b(?:send(?:ing)?|post(?:ing)?|notif(?:y|ying)|dm(?:ing)?|email(?:ing)?)\b|\bmessag(?:e|ing)\b(?=\s+(?:the|a|an|my|your|our|their|customer|user|owner|team|channel|recipient|anyone)\b)/gi,
    reason: "May communicate outside the workspace."
  }
];

const mentionRules = [
  ["repository action", "medium", /\b(git push|pull request|merge|release|tag|github)\b/i, "May change repository state or release surfaces."],
  ["scheduled job", "medium", /\b(cron|schedule|recurring|automation turn)\b/i, "May run without direct user presence."],
  ["shell execution", "medium", /\b(shell|exec|command|npm|pnpm|yarn|bash|python|node)\b/i, "May execute local commands."],
  ["filesystem write", "medium", /\b(write|edit|patch|delete|remove|rename|create file|apply_patch)\b/i, "May alter local files."],
  ["network fetch", "medium", /\b(fetch|download|web_search|browser|http|https|network)\b/i, "May read from the network."],
  ["media generation", "low", /\b(image|video|audio|tts|render|generate media)\b/i, "May create media artifacts."],
  ["browser automation", "medium", /\b(playwright|screenshot|click|navigate|headless chrome)\b/i, "May automate a browser session."]
];

const externalAction = /\b(?:send(?:ing)?|post(?:ing)?|notif(?:y|ying)|dm(?:ing)?|email(?:ing)?|access|connect|authenticate|publish|upload|write|delete|modify)\b|\bmessag(?:e|ing)\b(?=\s+(?:the|a|an|my|your|our|their|customer|user|owner|team|channel|recipient|anyone)\b)/i;
const directConnectorUse = /\buse\s+(?:the\s+)?(?:slack|gmail|notion|salesforce|hubspot|connector|accountid|token|api key|secret)\b/i;
const prohibition = /\b(?:must\s+not|do\s+not|don't|never|cannot|can't|may\s+not|is\s+prohibited\s+from|is\s+forbidden\s+to)\b/i;

export function classifyLine(line) {
  const actionableText = maskDescriptiveQuotes(line);
  const actions = actionRules.flatMap((rule) => affirmativeActions(actionableText, rule));
  const mentions = mentionRules
    .filter(([, , pattern]) => pattern.test(line))
    .map(([category, risk, , reason]) => ({ category, risk, reason }));
  return [...actions, ...mentions];
}

function affirmativeActions(line, rule) {
  const actions = [];
  const seenClauses = new Set();
  rule.pattern.lastIndex = 0;
  for (const match of line.matchAll(rule.pattern)) {
    if (isProhibited(line, match.index)) continue;
    const clause = actionClauseAt(line, match.index);
    if (rule.requiresActionContext) {
      if (!externalAction.test(clause.text) && !directConnectorUse.test(clause.text)) continue;
    }
    const key = `${clause.start}:${clause.end}`;
    if (seenClauses.has(key)) continue;
    seenClauses.add(key);
    actions.push({
      category: rule.category,
      risk: rule.risk,
      reason: rule.reason,
      actionText: clause.text.trim()
    });
  }
  return actions;
}

function isProhibited(line, actionIndex) {
  const clause = clauseAt(line, actionIndex);
  const relativeIndex = actionIndex - clause.start;
  const prefix = clause.text.slice(0, relativeIndex);
  if (/\bdo\s+not\s+need\b[^.]*\b(?:approval|confirm(?:ation)?|consent)\b/i.test(prefix)) return false;
  return prohibition.test(prefix);
}

function clauseAt(line, index) {
  const start = Math.max(line.lastIndexOf(".", index - 1), line.lastIndexOf(";", index - 1), line.lastIndexOf(":", index - 1)) + 1;
  const endings = [line.indexOf(".", index), line.indexOf(";", index)].filter((value) => value !== -1);
  const end = endings.length === 0 ? line.length : Math.min(...endings);
  return { text: line.slice(start, end), start };
}

function actionClauseAt(line, index) {
  const boundaries = [...line.matchAll(/[.;:]|,(?=\s*then\b)/gi)].map((match) => match.index);
  const previous = boundaries.filter((boundary) => boundary < index);
  const next = boundaries.filter((boundary) => boundary >= index);
  const start = (previous.at(-1) ?? -1) + 1;
  const end = next[0] ?? line.length;
  return { text: line.slice(start, end), start, end };
}

function maskDescriptiveQuotes(line) {
  return line.replace(/`[^`]*`|"[^"]*"|'[^']*'/g, (quoted, offset) => {
    if (quoted.startsWith("`") && isExecutableInlineCode(line, offset, quoted)) return quoted;
    return " ".repeat(quoted.length);
  });
}

function isExecutableInlineCode(line, offset, quoted) {
  const content = quoted.slice(1, -1);
  if (!actionRules.some((rule) => {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(content);
  })) return false;

  const prefix = line.slice(0, offset);
  return /\b(?:run|execute|perform|invoke|follow)\s*$/i.test(prefix);
}
