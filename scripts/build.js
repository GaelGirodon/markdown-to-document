/*
 * build.js
 * Build assets
 */

const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");

/*
 * Build the `github` theme from the CSS provided by
 * the github-markdown-css npm package.
 */

const src = path.join(__dirname, "../node_modules/github-markdown-css/github-markdown-light.css");
const dst = path.join(__dirname, "../assets/themes/github.min.css");
const css = fs
  .readFileSync(src, "utf8")
  .replace(/\.markdown-body/g, "body")
  .replace(/(list-style-type: lower-.*;)/g, "/* $1 */")
  .replace("{\n  padding: 16px;\n", "{\n  padding: 16px !important;\n");
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, new CleanCSS().minify(css).styles);
