import { access } from "node:fs/promises";

await access("bin/skill-sideeffect-map.js");
await access("src/scanner.js");
console.log("build ok");
