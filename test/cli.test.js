import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/skill-sideeffect-map.js", import.meta.url));
const fixture = "fixtures/skill-basic";

function run(...args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
}

test("rejects malformed CLI arguments with usage diagnostics", () => {
  const cases = [
    { args: ["scan", fixture, "--unknown"], message: "Unknown flag: --unknown" },
    { args: ["scan", fixture, "--format"], message: "Missing value for --format" },
    { args: ["scan", fixture, "--format", "--other"], message: "Missing value for --format" },
    { args: ["scan", fixture, "--format", "json", "--format", "markdown"], message: "Duplicate flag: --format" },
    { args: ["scan", fixture, "--format", "yaml"], message: "Unsupported format: yaml" },
    { args: ["check", fixture, "--format", "json"], message: "Flag --format is not valid for check" },
    { args: ["scan", fixture, "extra"], message: "Unexpected argument: extra" },
    { args: ["unknown", fixture], message: "Unknown command: unknown" },
    { args: ["render"], message: "Missing path for render" }
  ];

  for (const { args, message } of cases) {
    const result = run(...args);
    assert.equal(result.status, 1, args.join(" "));
    assert.equal(result.stdout, "", args.join(" "));
    assert.match(result.stderr, new RegExp(`^${message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\nUsage:`), args.join(" "));
  }
});

test("supports documented scan, render, and check invocations", () => {
  for (const command of ["scan", "render"]) {
    for (const format of ["json", "markdown"]) {
      const result = run(command, fixture, "--format", format);
      assert.equal(result.status, 0, `${command} ${format}: ${result.stderr}`);
      assert.equal(result.stderr, "");
      if (format === "json") {
        assert.doesNotThrow(() => JSON.parse(result.stdout));
      } else {
        assert.match(result.stdout, /^# Side Effect Map/m);
      }
    }
  }

  const check = run("check", fixture);
  assert.equal(check.status, 0, check.stderr);
  assert.equal(check.stderr, "");
  assert.match(check.stdout, /^# Side Effect Map/m);
});

test("check rejects an unapproved executable inline-code action", () => {
  const result = run("check", "fixtures/skill-inline-code");

  assert.equal(result.status, 1);
  assert.match(result.stdout, /Check: fail/);
  assert.match(result.stdout, /SKILL\.md:3 messaging requires explicit approval/);
  assert.equal(result.stderr, "");
});
