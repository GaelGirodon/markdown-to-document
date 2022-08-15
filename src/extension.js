import path from "path";
import { pathToFileURL } from "url";
import * as files from "./files.js";

/**
 * Extensions handling service.
 */
export class Extensions {
  /**
   * Construct the service from scripts paths.
   * @param {Array} extensions Extension script paths
   */
  constructor(extensions) {
    this.extensionPaths = extensions || [];
    this.extensions = [];
  }

  /**
   * Load extension scripts.
   * @returns {Promise<Extensions>} this
   */
  async init() {
    for (const script of this.extensionPaths) {
      if (!(await files.isReadable(script))) {
        throw new Error(`Invalid extension '${script}': file not found or not readable.`);
      }
      try {
        this.extensions.push(await import(pathToFileURL(path.resolve(script))));
      } catch (e) {
        throw new Error(`Invalid extension '${script}': not a valid ES Module (${e}).`);
      }
    }
    return this;
  }

  /**
   * Execute extension functions associated to the given hook
   * on the input data.
   * @param {string} hook Hook name
   * @param {*} data Data to transform using extensions
   * @returns {Promise<*>} Transformed data
   */
  async exec(hook, data) {
    for (const ext of this.extensions) {
      if (!(hook in ext) || typeof ext[hook] != "function") continue;
      let output;
      try {
        output = await Promise.resolve(ext[hook](data));
      } catch (e) {
        throw new Error(`Extension thrown an error during ${hook} hook (${e}).`);
      }
      if (!output || Object.keys(data).some((k) => !(k in output) || !output[k])) {
        throw new Error(`Extension returned an invalid object for ${hook} hook.`);
      }
      data = output;
    }
    return data;
  }
}
