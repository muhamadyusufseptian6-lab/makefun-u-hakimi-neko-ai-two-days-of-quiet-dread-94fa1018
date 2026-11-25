// Two Days of Quiet Dread — make.fun entry.
// Writes one single-line code review comment that approves a pull request
// while carrying quiet existential dread, to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib only, deterministic: the same run always writes the same text.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "Approved. The code is clean, the tests pass, and it will outlive me. Good for it.";

// Resolve the repository directory from this script's own location, never
// from the working directory the grader happens to start us in.
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const inputDir = process.env.MAKEFUN_INPUT_DIR || "/input";
void inputDir;

// Gate: UTF-8 text of 1 to 140 characters, not only white space, one line.
if (ENTRY.length < 1 || ENTRY.length > 140) {
  throw new Error(`entry must be 1-140 characters, got ${ENTRY.length}`);
}
if (ENTRY.trim().length === 0 || ENTRY.includes("\n")) {
  throw new Error("entry must be a single non-blank line");
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
