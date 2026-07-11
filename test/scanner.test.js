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
