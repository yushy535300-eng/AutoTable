const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const root = join(__dirname, "..");
const result = spawnSync("pnpm", ["vitest", "run", "tests/dg-card-frame.test.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(typeof result.status === "number" ? result.status : 1);
