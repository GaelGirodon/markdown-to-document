const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

/**
 * Tests that the file specified by path is a directory.
 * @param {string} path A path to a file or directory.
 * @return {Promise<boolean>} true if the file is a directory.
 */
async function isDirectory(path) {
    return (await fs.statAsync(path)).isDirectory();
}

/**
 * Tests that the file specified by path is readable.
 * @param {string} path A path to a file or directory.
 * @return {Promise<boolean>} true if the file is readable.
 */
async function isReadable(path) {
    const err = await fs.accessAsync(path, fs.constants.R_OK);
    return !err;
}

/**
 * Opens a text file, reads all the text in the file into a string,
 * and then closes the file.
 * @param {string} path The path to the file to read.
 * @return {Promise<string>} File content.
 */
function readAllText(path) {
    return fs.readFileAsync(path, "utf8");
}

module.exports = {
    isDirectory,
    isReadable,
    readAllText
};
