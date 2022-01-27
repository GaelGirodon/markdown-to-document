const axios = require("axios");

/**
 * Fetch text from an HTTP URL.
 * @param url HTTP URL.
 * @param failIfEmpty Throw an error if the fetched text is empty.
 * @returns {Promise<string>} Fetched text.
 */
async function fetchText(url, failIfEmpty) {
  let res;
  try {
    res = await axios.get(url, { responseType: "text" });
  } catch (e) {
    throw new Error(`an error occurred fetching content (${e})`);
  }
  if (res.status >= 300) {
    throw new Error(`an error occurred fetching content (${res.status} ${res.statusText})`);
  }
  if (failIfEmpty && !res.data) throw new Error(`content is empty`);
  return res.data;
}

module.exports = {
  fetchText,
};
