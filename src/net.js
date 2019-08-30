const fetch = require("node-fetch");

/**
 * Fetch text from an HTTP URL.
 * @param url HTTP URL.
 * @param failIfEmpty Throw an error if the fetched text is empty.
 * @returns {Promise<string>} Fetched text.
 */
async function fetchText(url, failIfEmpty) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(`an error occurred fetching content (${e})`);
  }
  if (!res.ok) {
    throw new Error(`an error occurred fetching content (${res.status} ${res.statusText})`);
  }
  const text = await res.text();
  if (failIfEmpty && !text) throw new Error(`content is empty`);
  return text;
}

module.exports = {
  fetchText,
};
