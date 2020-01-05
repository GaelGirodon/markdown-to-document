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

module.exports = {
  buildPath,
};
