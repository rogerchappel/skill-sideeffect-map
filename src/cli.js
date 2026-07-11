import { scanPath } from "./scanner.js";
import { checkReport } from "./checker.js";
import { renderJson, renderMarkdown } from "./renderers.js";

const usage = `Usage:
  skill-sideeffect-map scan <path> [--format json|markdown]
  skill-sideeffect-map check <path>
  skill-sideeffect-map render <path> [--format json|markdown]
`;

export async function main(argv) {
  const [command, target, ...flags] = argv;
  if (!command || command === "--help" || command === "-h") {
    console.log(usage.trim());
    return;
  }
  if (!target) {
    throw new Error(usage.trim());
  }

  const format = readFlag(flags, "--format") ?? (command === "scan" ? "json" : "markdown");
  const report = await scanPath(target);

  if (command === "scan" || command === "render") {
    console.log(format === "markdown" ? renderMarkdown(report) : renderJson(report));
    return;
  }
  if (command === "check") {
    const result = checkReport(report);
    console.log(renderMarkdown({ ...report, check: result }));
    if (!result.ok) {
      process.exitCode = 1;
    }
    return;
  }
  throw new Error(`Unknown command: ${command}\n${usage.trim()}`);
}

function readFlag(flags, name) {
  const index = flags.indexOf(name);
  return index === -1 ? undefined : flags[index + 1];
}
