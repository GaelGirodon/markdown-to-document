/**
 * Generate a random id.
 * @return {string} A random id
 */
export function randomId() {
  return `_${Math.random().toString(36).substring(2, 11)}`;
}
