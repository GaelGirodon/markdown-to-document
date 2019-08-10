const paths = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

/**
 * Tests that the file specified by path exists.
 * @param {string} path A path to a file or directory
 * @return {Promise<boolean>} true if the file exists
 */
async function exists(path) {
  try {
    await fs.accessAsync(path, fs.constants.F_OK);
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
async function isDirectory(path) {
  return (await exists(path)) && (await fs.statAsync(path)).isDirectory();
}

/**
 * Tests that the file specified by path exists and is readable.
 * @param {string} path A path to a file or directory
 * @return {Promise<boolean>} true if the file exists and is readable
 */
async function isReadable(path) {
  try {
    await fs.accessAsync(path, fs.constants.F_OK | fs.constants.R_OK);
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
function isRemote(path) {
  return /^https?:\/\/|^\/\//.test(path);
}

/**
 * Transform a local absolute path to an URL (ignores remote paths).
 * @example
 * localToUrl("C:\\path\\assets\\file.ext", "C:\\path\\") -> "assets/file.ext"
 * @param {string} path A path to a file
 * @param {string} base Web root path (the output URL will be relative to this)
 * @return {string} The URL
 */
function localToUrl(path, base) {
  if (isRemote(path)) return path;
  return paths.relative(base, path).replace(/\\/g, "/");
}

/**
 * Opens a text file, reads all the text in the file into a string,
 * and then closes the file.
 * @param {string} path The path to the file to read
 * @return {Promise<string>} A string containing all the text in the file.
 */
function readAllText(path) {
  return fs.readFileAsync(path, "utf8");
}

/**
 * Creates a new file, write the contents to the file, and then closes the file.
 * If the target file already exists, it is overwritten.
 * @param {string} path The path to the file to read
 * @param {string} contents The string to write to the file.
 * @return {Promise}
 */
function writeAllText(path, contents) {
  return fs.writeFileAsync(path, contents, "utf8");
}

module.exports = {
  exists,
  isDirectory,
  isReadable,
  isRemote,
  localToUrl,
  readAllText,
  writeAllText,
};
