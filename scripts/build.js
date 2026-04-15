/*
 * build.js
 * Build assets
 */

import CleanCSS from "clean-css";
import fs from "node:fs";
import path from "node:path";
import UglifyJS from "uglify-js";

/*
 * Build the `github` theme from the CSS provided by
 * the github-markdown-css npm package.
 */

const root = path.join(import.meta.dirname, "..");
const src = path.join(root, "node_modules/github-markdown-css/github-markdown-light.css");
const dst = path.join(root, "assets/themes/github.min.css");
const css = fs
  .readFileSync(src, { encoding: "utf8" })
  .replace(/\.markdown-body/g, "body") // Apply styles to the whole document
  .replace(/(list-style-type: lower-.*;)/g, "/* $1 */") // Reset list-style-type to default
  .replace(/(\{\s*padding: 16px)(;\n)/, "$1 !important$2") // Force padding in <pre> blocks
  .replace(/body code br[^{]*\{\s*display: none;?\s*}/, ""); // Mermaid needs <br> to be displayed
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, new CleanCSS().minify(css).styles);

/*
 * Minify additional features CSS & JS files
 */

const featureFiles = fs
  .readdirSync(path.join(import.meta.dirname, "../assets/features"), { encoding: "utf8" })
  .filter((f) => /^[^.]+\.(css|js)$/.test(f))
  .map((f) => path.join(import.meta.dirname, "../assets/features", f));
for (const f of featureFiles) {
  const content = fs.readFileSync(f, { encoding: "utf8" });
  fs.writeFileSync(
    f.replace(/\.(\w+)$/, ".min.$1"),
    f.endsWith(".css") ? new CleanCSS().minify(content).styles : UglifyJS.minify(content).code,
    { encoding: "utf8" }
  );
}
