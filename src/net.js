import http from "node:http";
import https from "node:https";

/**
 * Fetch content from an HTTP(S) URL using a basic wrapper
 * around Node.js http[s].request() to be used internally
 * until the Fetch API reaches a stable state.
 * @param {string} url HTTP(S) URL
 * @param {boolean} [failIfEmpty] Throw an error if the fetched content is empty.
 * @returns {Promise<{status?:number,body:Buffer}>} Response with fetched content
 */
export async function request(url, failIfEmpty) {
  const u = new URL(url);
  const proto = u.protocol.slice(0, -1);
  return new Promise((resolve, reject) => {
    ({ http, https })[proto]
      .request(u, (res) => {
        let body = Buffer.alloc(0);
        res.on("data", (chunk) => {
          body = Buffer.concat([body, chunk]);
        });
        res.on("end", () => {
          if (res.statusCode >= 300) {
            reject(new Error(`an error occurred fetching content (status: ${res.statusCode})`));
          } else if (failIfEmpty && body.length <= 0) {
            reject(new Error("content is empty"));
          } else {
            resolve({ status: res.statusCode, body });
          }
        });
      })
      .on("error", (e) => {
        reject(new Error(`an error occurred fetching content (${e})`));
      })
      .end();
  });
}
