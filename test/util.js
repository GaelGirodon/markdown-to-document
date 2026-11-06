/*
 * util.js
 *
 * Test utilities
 */

import { resolve } from "node:path";

import { cli } from "../src/cli.js";

/**
 * Transform a path relative to the project root into an absolute path.
 * @param {string} path Path relative to the project root
 * @return {string} The absolute path
 */
export function buildPath(path) {
  return resolve(import.meta.dirname, "..", path);
}

/**
 * Transform a path relative to the test/data directory into an absolute path.
 * @param {string} path Path relative to the test/data directory
 * @return {string} The absolute path
 */
export function buildDataPath(path) {
  return resolve(import.meta.dirname, "data", path);
}

/**
 * Run the program, and catch Commander output and exit.
 * @param {...string} args Command-line arguments
 * @return {{stdout: string, stderr: string, error?: import("commander").CommanderError}} Command output
 */
export async function runCli(...args) {
  let stdout = "";
  let stderr = "";
  try {
    await cli()
      .configureOutput({
        writeOut: (str) => (stdout += str),
        writeErr: (str) => (stderr += str),
      })
      .exitOverride((err) => {
        throw err;
      })
      .parseAsync(args, { from: "user" });
  } catch (error) {
    return { stdout, stderr, error };
  }
  return { stdout, stderr };
}
