import http from "got";

/**
 * Fetch text from an HTTP URL.
 * @param url HTTP URL.
 * @param failIfEmpty Throw an error if the fetched text is empty.
 * @returns {Promise<string>} Fetched text.
 */
export async function fetchText(url, failIfEmpty) {
  let data;
  try {
    data = await http.get(url).text();
  } catch (e) {
    throw new Error(`an error occurred fetching content (${e})`);
  }
  if (failIfEmpty && !data) {
    throw new Error("content is empty");
  }
  return data;
}
