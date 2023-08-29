/*
 * test-readme.js
 * Test that usage examples on README.md are working fine.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, unlinkSync } from "node:fs";
import { chdir } from "node:process";

import { ROOT_DIR } from "../src/files.js";

// Change current working directory to project root
chdir(ROOT_DIR);

/**
 * Print and run a command.
 * @param {string} cmd The command to run
 * @returns {number} The process exit code
 */
const exec = (cmd) => {
  console.log("$ %s", cmd);
  return spawnSync(cmd, { stdio: "inherit", shell: true }).status ?? 0;
};

// Make "mdtodoc" command available on PATH if required
if (exec("mdtodoc --help") !== 0) {
  exec("npm link");
}

// Extract commands from README.md
const readme = readFileSync("README.md", { encoding: "utf8" });
const matches = readme.matchAll(/^mdtodoc .+\.md.*$/gm);
const commands = [...matches].map(
  (match) =>
    match[0]
      .replace(/doc\.md/g, "README.md") // Use README.md as input file
      .replace(/--?w(atch)?/g, "") // Remove --watch option
);

process.exitCode = 0;

// Run commands
for (const cmd of commands) {
  process.exitCode += exec(cmd);
}

// Remove output files
for (const file of readdirSync(".").filter((f) => f.match(/MERGED\.|\.html/))) {
  unlinkSync(file);
}

console.log("=== %s ===", process.exitCode === 0 ? "Success" : "Fail");
