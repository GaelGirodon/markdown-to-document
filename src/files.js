import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Path to the root directory of the tool
 * @type {string}
 */
export const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Tests that the file specified by path exists.
 * @param {string} path A path to a file or directory
 * @return {Promise<boolean>} true if the file exists
 */
export async function exists(path) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Tests that the file specified by path is a directory.
 * @param {string} path A path to a file or directory
 * @return {Promise<boolean>} true if the file is a directory
 */
export async function isDirectory(path) {
  return (await exists(path)) && (await fs.stat(path)).isDirectory();
}

/**
 * Tests that the file specified by path exists and is readable.
 * @param {string} path A path to a file or directory
 * @return {Promise<boolean>} true if the file exists and is readable
 */
export async function isReadable(path) {
  try {
    await fs.access(path, fs.constants.F_OK | fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Check whether the file specified by path is a local
 * or remote resource (HTTP/network).
 * @param {string} path A path to a file or directory
 * @return {boolean} true if the file is a remote file
 */
export function isRemote(path) {
  return /^https?:\/\/|^\/\//.test(path);
}

/**
 * Transform a local absolute path to a URL (ignores remote paths).
 * @example
 * localToUrl("C:\\path\\assets\\file.ext", "C:\\path\\") -> "assets/file.ext"
 * @param {string} path A path to a file
 * @param {string} base Web root path (the output URL will be relative to this)
 * @return {string} The URL
 */
export function localToUrl(path, base) {
  if (isRemote(path)) return path;
  return relative(base, path).replace(/\\/g, "/");
}

/**
 * Resolve the path to the directory of a module.
 * @param {string} module The module name
 * @return {string} The module directory path
 */
export function resolveModuleDirectory(module) {
  return dirname(createRequire(import.meta.url).resolve(`${module}/package.json`));
}

/**
 * Opens a text file, reads all the text in the file into a string,
 * and then closes the file.
 * @param {string} path The path to the file to read
 * @return {Promise<string>} A string containing all the text in the file.
 */
export function readAllText(path) {
  return fs.readFile(path, "utf8");
}

/**
 * Creates a new file, write the contents to the file, and then closes the file.
 * If the target file already exists, it is overwritten.
 * @param {string} path The path to the file to read
 * @param {string} contents The string to write to the file.
 * @return {Promise}
 */
export function writeAllText(path, contents) {
  return fs.writeFile(path, contents, "utf8");
}
