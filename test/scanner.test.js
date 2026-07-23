import test from "node:test";
import assert from "node:assert/strict";
import { scanPath } from "../src/scanner.js";
import { checkReport } from "../src/checker.js";

test("scans skill docs for side effect categories", async () => {
  const report = await scanPath("fixtures/skill-basic");
  assert.ok(report.categories.some((item) => item.category === "messaging"));
  assert.ok(report.categories.some((item) => item.category === "filesystem write"));
});

test("fails high risk reports without approval language", async () => {
  const report = await scanPath("fixtures/skill-missing-approval");
  const result = checkReport(report);
  assert.equal(result.ok, false);
});

test("unrelated approval and negated confirmation do not approve messaging", async () => {
  const report = await scanPath("fixtures/skill-unrelated-approval");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  assert.ok(result.failures.some((failure) =>
    failure.includes("fixtures/skill-unrelated-approval/SKILL.md:4 messaging")
  ));
});

test("explicit approval tied to high-risk messaging passes", async () => {
  const report = await scanPath("fixtures/skill-scoped-approval");
  const result = checkReport(report);

  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
});

test("each high-risk evidence item needs its own approval", async () => {
  const report = await scanPath("fixtures/skill-multiple-high-risk");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  assert.ok(result.failures.every((failure) => failure.includes(":4 ")));
  assert.ok(result.failures.some((failure) => failure.includes("messaging")));
  assert.ok(result.failures.some((failure) => failure.includes("credentialed connector")));
});
