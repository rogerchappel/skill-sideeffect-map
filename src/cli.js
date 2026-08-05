import { scanPath } from "./scanner.js";
import { checkReport } from "./checker.js";
import { renderJson, renderMarkdown } from "./renderers.js";

const usage = `Usage:
  skill-sideeffect-map scan <path> [--format json|markdown]
  skill-sideeffect-map check <path>
  skill-sideeffect-map render <path> [--format json|markdown]
`;

export async function main(argv) {
  const [command] = argv;
  if (!command || command === "--help" || command === "-h") {
    console.log(usage.trim());
    return;
  }

  const { target, format } = parseArgs(argv);
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
}

function parseArgs([command, target, ...args]) {
  if (!new Set(["scan", "render", "check"]).has(command)) {
    fail(`Unknown command: ${command}`);
  }
  if (!target || target.startsWith("--")) {
    fail(`Missing path for ${command}`);
  }

  let requestedFormat;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument !== "--format") {
      fail(argument.startsWith("--")
        ? `Unknown flag: ${argument}`
        : `Unexpected argument: ${argument}`);
    }
    if (command === "check") {
      fail("Flag --format is not valid for check");
    }
    if (requestedFormat !== undefined) {
      fail("Duplicate flag: --format");
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      fail("Missing value for --format");
    }
    if (!new Set(["json", "markdown"]).has(value)) {
      fail(`Unsupported format: ${value}`);
    }
    requestedFormat = value;
    index += 1;
  }

  return {
    target,
    format: requestedFormat ?? (command === "scan" ? "json" : "markdown")
  };
}

function fail(message) {
  throw new Error(`${message}\n\n${usage.trim()}`);
}
