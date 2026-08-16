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

test("ignores descriptive mentions and explicit prohibitions", async () => {
  const report = await scanPath("fixtures/skill-descriptive-and-prohibited");
  const result = checkReport(report);

  assert.equal(result.ok, true);
  assert.equal(result.highRiskCount, 0);
  assert.deepEqual(
    report.evidence.filter((item) => item.risk === "high"),
    []
  );
});

test("retains file, line, and category evidence for intended external actions", async () => {
  const report = await scanPath("fixtures/skill-intended-external-actions");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  assert.deepEqual(result.failures, [
    "fixtures/skill-intended-external-actions/SKILL.md:3 credentialed connector requires explicit approval on the same evidence line.",
    "fixtures/skill-intended-external-actions/SKILL.md:3 messaging requires explicit approval on the same evidence line."
  ]);
  assert.ok(report.evidence.some((item) =>
    item.file === "fixtures/skill-intended-external-actions/SKILL.md"
      && item.line === 4
      && item.category === "messaging"
  ));
  assert.ok(report.evidence.some((item) =>
    item.file === "fixtures/skill-intended-external-actions/SKILL.md"
      && item.line === 5
      && item.category === "credentialed connector"
  ));
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

test("predicate-negated and non-requirement wording does not approve messaging", async () => {
  const report = await scanPath("fixtures/skill-negated-approval");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  for (const line of [3, 4, 5, 6, 7]) {
    assert.ok(result.failures.some((failure) =>
      failure.includes(`fixtures/skill-negated-approval/SKILL.md:${line} messaging`)
    ));
  }
});

test("denied, failed, refused, and absent approval does not authorize messaging", async () => {
  const report = await scanPath("fixtures/skill-non-authorizing-approval");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  for (const line of [3, 4, 5, 6]) {
    assert.ok(result.failures.some((failure) =>
      failure.includes(`fixtures/skill-non-authorizing-approval/SKILL.md:${line} messaging`)
    ));
  }
});

test("positive approval gates authorize their high-risk actions", async () => {
  const report = await scanPath("fixtures/skill-positive-approval-gates");
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

test("approval is scoped to each action clause on the same line", async () => {
  const report = await scanPath("fixtures/skill-same-line-mixed-approval");
  const result = checkReport(report);

  assert.equal(result.ok, false);
  assert.deepEqual(result.failures, [
    "fixtures/skill-same-line-mixed-approval/SKILL.md:3 credentialed connector requires explicit approval on the same evidence line."
  ]);
  assert.equal(result.failures.some((failure) => failure.includes(":4 ")), false);
});

test("treats CommonMark fenced examples as descriptive and resumes after their closers", async () => {
  const report = await scanPath("fixtures/skill-fenced-examples");
  const result = checkReport(report);

  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(
    report.evidence
      .filter((item) => item.category === "messaging")
      .map((item) => [item.file, item.line]),
    [
      ["fixtures/skill-fenced-examples/backtick.md", 8],
      ["fixtures/skill-fenced-examples/tilde.md", 9]
    ]
  );
});
