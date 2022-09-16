import path from "path";
import util from "util";
import Glob from "glob";
import watcher from "chokidar";
import * as cheerio from "cheerio";
import webResourceInliner from "web-resource-inliner";

import * as files from "./files.js";
import { Compiler } from "./compiler.js";
import { Style } from "./style.js";
import { Extensions } from "./extension.js";

const glob = util.promisify(Glob);
const inline = util.promisify(webResourceInliner.html);

/**
 * Markdown processor.
 */
export class Processor {
  /**
   * Construct a Markdown processor.
   * @param {*} opts Processor options
   */
  constructor(opts) {
    opts = opts || {};
    this.dest = opts.dest; // Output path
    this.join = opts.join; // Concatenate Markdown files
    this.watch = opts.watch; // Watch Markdown files
    this.embedMode = opts.embedMode || "default"; // Embed external resources
    this.style = new Style(opts);
    this.compiler = new Compiler(opts);
    this.extensions = new Extensions(opts.extension);
  }

  /**
   * Process Markdown files.
   * @param {string[]} src Path(s) to the Markdown file(s) to process
   */
  async process(src) {
    // List and check source files
    if (!src || src.length === 0) {
      throw new Error("Source file(s) are required.");
    }
    let sources = [];
    for (const s of src) {
      // Normalize and trim path
      const np = s.replace(/\\/g, path.posix.sep).replace(/^['"]+|['"]+$/g, "");
      // Expand with glob syntax
      sources.push(...(glob.hasMagic(np) ? await glob(np) : [np]));
    }
    // Remove duplicates
    sources = sources
      .map((s) => path.resolve(s)) // Resolve to an absolute path
      .filter((s, i, all) => all.indexOf(s) === i);
    if (!sources || sources.length === 0 || !sources.every((s) => /\.md$/.test(s))) {
      throw new Error("Invalid source file(s) (should be valid .md files).");
    }
    // Check destination path
    if (this.dest && !(await files.isDirectory(this.dest))) {
      throw new Error("Invalid output path (should be a valid directory).");
    }
    // Initialize style
    await this.style.init();
    // Initialize extensions
    await this.extensions.init();
    // Initialize compiler
    await this.compiler.init();
    // Compile source files
    if (this.watch) {
      for (const file of sources) {
        console.log(`[watch] ${file}`);
        watcher
          .watch(file, { awaitWriteFinish: { stabilityThreshold: 500 } })
          .on("change", async (path) => {
            const mergedPath = this.join ? await this.joinFiles(sources) : null;
            await this.compileFile(mergedPath || path, this.dest).catch((err) => {
              throw err;
            });
          });
      }
    } else {
      const filesList = this.join ? [await this.joinFiles(sources)] : sources;
      for (const file of filesList) {
        await this.compileFile(file, this.dest).catch((err) => {
          throw err;
        });
      }
    }
  }

  /**
   * Compile a Markdown file.
   * @param {string} src Path to the Markdown file to compile
   * @param {string} dest Output path
   * @return {Promise<string>} Output compiled file path
   */
  async compileFile(src, dest) {
    // Check source file
    if (!(await files.isReadable(src))) {
      throw new Error(`Invalid source file '${src}': file not found or not readable.`);
    }
    // Load and compile Markdown file
    let md = await files.readAllText(src);
    ({ md } = await this.extensions.exec("preCompile", { md }));
    const body = this.compiler.compile(md);
    const title = cheerio.load(body)("h1").first().text();
    // Use style
    const base = path.dirname(src);
    let data = {
      title: title || path.basename(src),
      styles: await this.style.styles(base),
      scripts: await this.style.scripts(base),
      body,
    };
    // Render output HTML
    data = await this.extensions.exec("preRender", data);
    let html = this.style.template(data);
    // Apply .code-block CSS class to all <pre> tags without class
    html = html.replace(/<pre>/g, '<pre class="code-block">');
    // Inline resources
    ({ html } = await this.extensions.exec("preInline", { html }));
    let options = { fileContent: html, relativeTo: base };
    if (this.embedMode === "light") {
      Object.assign(options, { images: 16, svgs: 16, scripts: 16 });
    } else if (this.embedMode === "default") {
      Object.assign(options, { images: true, svgs: true, scripts: 16 });
    } else if (this.embedMode === "full") {
      Object.assign(options, { images: true, svgs: true, scripts: true });
    }
    html = await inline(options);
    // Remove useless line breaks within script and style tags
    html = html
      .replace(/(<(?:style|script)[^>]*>)\s+/g, "$1")
      .replace(/\s+(<\/(?:style|script)>)/g, "$1");
    // Save output file
    const outputFileName = path.basename(src).replace(/\.md$/, ".html");
    let outputFile = path.join(dest || path.dirname(src), outputFileName);
    const preWriteData = { html, path: outputFile };
    ({ html, path: outputFile } = await this.extensions.exec("preWrite", preWriteData));
    await files.writeAllText(outputFile, html);
    console.log(`${src} -> ${outputFile}`);
    return outputFile;
  }

  /**
   * Concatenate Markdown files.
   * @param {string[]} src Path(s) to the Markdown file(s) to merge.
   * @returns {Promise<string>} Path to the merged file.
   */
  async joinFiles(src) {
    // Sort input files list
    src = src.sort((a, b) => {
      if (a.includes(b.replace(/(README|index)\.md$/gi, ""))) return 1;
      if (b.includes(a.replace(/(README|index)\.md$/gi, ""))) return -1;
      return a - b;
    });
    const base = path.dirname(src[0]); // Path to the base directory
    let output = ""; // Output content
    const dest = path.join(base, "MERGED.md"); // Path to the output merged file
    // Process and concatenate files content
    for (const f of src) {
      let content = await files.readAllText(f);
      // Remove the front matter (TOML, YAML or JSON)
      content = content.replace(/^([-+;]{3})[\n\r]+[^]+[\n\r]+([-+;]{3})[\n\r]+/gi, "").trimStart();
      // Update titles level
      const relativePath = path.relative(base, f).replace(/[\\/]/g, "/");
      let depth = relativePath.split("/").length;
      if (!/(README|index)\.md$/gi.test(relativePath)) {
        depth++; // Files beside the main one are children of it
      }
      // Update H2-H6 titles
      content = content.replace(/^##/gim, "#".repeat(depth + 1));
      // Update H1 title after (avoid processing comments in code blocks)
      content = content.replace(/^#/gi, "#".repeat(depth));
      // Update relative paths
      const relativeDirPath = path.dirname(relativePath);
      content = content.replace(/]\(.\//gi, `](./${relativeDirPath}/`);
      // Remove table of contents tokens from child pages
      if (src.indexOf(f) > 0) {
        content = content.replace(/(\r?\n)(\${toc}|\[\[?_?toc_?]?])(\r?\n)/, "");
      }
      // Concatenate
      output += content + "\n";
    }
    // Write content to the output file
    await files.writeAllText(dest, output);
    return dest;
  }
}
