/*
 * util.js
 *
 * Test utilities
 */

const paths = require("path");

/**
 * Transform a path relative to the project root into an absolute path.
 * @param {string} path Path relative to the project root
 * @return {string} The absolute path
 */
function buildPath(path) {
  return paths.resolve(__dirname, "..", path);
}

/**
 * Require a file by name but without cache.
 * @param {string} moduleName Module name
 * @return {*} The module
 */
function requireForce(moduleName) {
  delete require.cache[require.resolve(moduleName)];
  return require(moduleName);
}

module.exports = {
  buildPath,
  requireForce,
};
