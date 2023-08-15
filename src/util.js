/**
 * Generate a random id.
 * @return {string} A random id
 */
export function randomId() {
  return `_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get the text content of the first element matching the given tag
 * using a naive regex-base search which is very limited, but avoids
 * importing a full HTML parser library only to do that.
 * @param {string} html The HTML document
 * @param {string} tag The HTML tag name
 * @returns {string|null} The text content of the first matching tag
 */
export function getHtmlTagText(html, tag) {
  const startTagMatch = html?.match(new RegExp(`<${tag}[^>]*>`));
  if (!startTagMatch || startTagMatch.index === undefined) return null;
  const offset = startTagMatch.index + startTagMatch[0].length;
  const endTagMatch = html.slice(offset).match(new RegExp(`</${tag}>`));
  if (!endTagMatch?.input || endTagMatch.index === undefined) return null;
  return endTagMatch.input
    .slice(0, endTagMatch.index)
    .replace(/<[^>]+>/g, "") // Remove nested tags
    .replace(/\s{2,}/g, " ") // Collapse spaces
    .trim();
}
