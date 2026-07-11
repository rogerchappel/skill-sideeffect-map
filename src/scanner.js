import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { classifyLine } from "./taxonomy.js";

const docNames = new Set(["SKILL.md", "README.md", "ORCHESTRATION.md", "TASKS.md"]);

export async function scanPath(targetPath) {
  const files = await collectFiles(targetPath);
  const evidence = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      for (const match of classifyLine(line)) {
        evidence.push({
          file: path.relative(process.cwd(), file),
          line: index + 1,
          category: match.category,
          risk: match.risk,
          reason: match.reason,
          text: line.trim()
        });
      }
    });
  }
  const categories = summarize(evidence);
  return {
    target: path.relative(process.cwd(), path.resolve(targetPath)) || ".",
    files: files.map((file) => path.relative(process.cwd(), file)),
    categories,
    evidence,
    recommendations: recommendations(categories)
  };
}

async function collectFiles(targetPath) {
  const full = path.resolve(targetPath);
  const info = await stat(full);
  if (info.isFile()) return [full];
  const entries = await readdir(full, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(full, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...await collectFiles(child));
    } else if (entry.isFile() && (docNames.has(entry.name) || entry.name.endsWith(".md") || entry.name.endsWith(".json"))) {
      files.push(child);
    }
  }
  return files.sort();
}

function summarize(evidence) {
  const counts = new Map();
  for (const item of evidence) {
    const current = counts.get(item.category) ?? { category: item.category, count: 0, maxRisk: "low" };
    current.count += 1;
    if (riskRank(item.risk) > riskRank(current.maxRisk)) current.maxRisk = item.risk;
    counts.set(item.category, current);
  }
  return [...counts.values()].sort((a, b) => riskRank(b.maxRisk) - riskRank(a.maxRisk) || a.category.localeCompare(b.category));
}

function recommendations(categories) {
  if (categories.length === 0) return ["No side effects detected; keep examples fixture-backed."];
  return categories.map((item) => {
    if (item.maxRisk === "high") return `Require explicit approval before ${item.category} steps and document dry-run behavior.`;
    if (item.maxRisk === "medium") return `Add a review note for ${item.category} usage and keep sample runs local.`;
    return `Document the expected ${item.category} boundary.`;
  });
}

function riskRank(risk) {
  return { low: 1, medium: 2, high: 3 }[risk] ?? 0;
}
