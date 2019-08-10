/**
 * Generate a random id.
 * @return {string} A random id
 */
function randomId() {
  return `_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

module.exports = {
  randomId,
};
