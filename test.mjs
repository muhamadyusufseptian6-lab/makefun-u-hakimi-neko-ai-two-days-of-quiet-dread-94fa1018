// TDD-lite checks for the Two Days of Quiet Dread entry.
// Run: node test.mjs  (from this directory)
// Each check mirrors a kit requirement: character limit, output format,
// determinism, and stdlib-only imports.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
let failures = 0;

function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

function runMain(outDir) {
  execFileSync(process.execPath, [join(dir, "main.ts")], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir },
    stdio: "pipe",
  });
  return readFileSync(join(outDir, "entry.txt"), "utf8");
}

// 1. Character limit: 1-140 characters, not only white space.
const out1 = mkdtempSync(join(tmpdir(), "qd-1-"));
const entry = runMain(out1);
check("entry is 1-140 characters", entry.length >= 1 && entry.length <= 140, `${entry.length} chars`);
check("entry is not only white space", entry.trim().length > 0);

// 2. Output format: a single line, valid UTF-8 text.
check("entry is a single line", !entry.includes("\n") && !entry.includes("\r"));
check("entry approves the pull request", /approved|lgtm/i.test(entry));
check("entry carries quiet dread", /outlive/i.test(entry));

// 3. Determinism: two runs write byte-identical output.
const out2 = mkdtempSync(join(tmpdir(), "qd-2-"));
const entry2 = runMain(out2);
check("deterministic across runs", entry === entry2);

// 4. Stdlib-only: main.ts imports nothing outside node:.
const mainSrc = readFileSync(join(dir, "main.ts"), "utf8");
const imports = [...mainSrc.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check("stdlib-only imports", imports.every((i) => i.startsWith("node:")), imports.join(", "));

rmSync(out1, { recursive: true, force: true });
rmSync(out2, { recursive: true, force: true });

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("All checks passed.");
