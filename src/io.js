const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

/**
 * Tests that the file specified by path exists.
 * @param {string} path A path to a file or directory.
 * @return {Promise<boolean>} true if the file exists.
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
 * @param {string} path A path to a file or directory.
 * @return {Promise<boolean>} true if the file is a directory.
 */
async function isDirectory(path) {
    return (await fs.statAsync(path)).isDirectory();
}

/**
 * Tests that the file specified by path exists and is readable.
 * @param {string} path A path to a file or directory.
 * @return {Promise<boolean>} true if the file exists and is readable.
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
 * Opens a text file, reads all the text in the file into a string,
 * and then closes the file.
 * @param {string} path The path to the file to read.
 * @return {Promise<string>} File content.
 */
function readAllText(path) {
    return fs.readFileAsync(path, "utf8");
}

module.exports = {
    exists,
    isDirectory,
    isReadable,
    readAllText
};
