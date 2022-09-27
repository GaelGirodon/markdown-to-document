/*
 * util.js
 *
 * Test utilities
 */

import { resolve } from "path";
import { ROOT_DIR } from "../src/files.js";

/**
 * Transform a path relative to the project root into an absolute path.
 * @param {string} path Path relative to the project root
 * @return {string} The absolute path
 */
export function buildPath(path) {
  return resolve(ROOT_DIR, path);
}

/**
 * Transform a path relative to the test/data directory into an absolute path.
 * @param {string} path Path relative to the test/data directory
 * @return {string} The absolute path
 */
export function buildDataPath(path) {
  return resolve(ROOT_DIR, "test/data", path);
}
