const Promise = require("bluebird");
const path = require("path");
const glob = Promise.promisify(require("glob"));
const watcher = require("chokidar");
const chalk = require("chalk");
const cheerio = require("cheerio");
const inline = Promise.promisify(require("web-resource-inliner").html);
const minify = require("html-minifier").minify;

const files = require("./files");
const { compiler } = require("./compiler");
const { Style } = require("./style");

/**
 * Markdown processor.
 */
class Processor {
  /**
   * Construct a Markdown processor.
   * @param {*} opts Processor options
   */
  constructor(opts) {
    this.embedMode = opts.embedMode || "light";
    this.style = new Style(opts);
    this.compiler = compiler(opts.codeCopy);
  }

  /**
   * Process Markdown files.
   * @param {string} src Path to the Markdown files to process
   * @param {string} dest Output path
   * @param {boolean} watch Watch Markdown files
   */
  async process(src, dest, watch) {
    // List and check source files
    const sources = src.length === 1 && glob.hasMagic(src[0]) ? await glob(src[0]) : src;
    if (!sources || sources.length === 0 || !sources.every(s => /\.md$/.test(s))) {
      throw new Error("Invalid source file(s) (should be valid .md files).");
    }
    // Check destination path
    if (dest && !(await files.isDirectory(dest))) {
      throw new Error("Invalid output path (should be a valid directory).");
    }
    // Initialize style
    await this.style.init();
    // Compile source files
    for (const file of sources) {
      if (watch) {
        console.log(`${chalk.gray("[watch]")} ${file}`);
        watcher.watch(file, { awaitWriteFinish: { stabilityThreshold: 500 } }).on(
          "change",
          async path =>
            await this.compileFile(path, dest).catch(err => {
              throw err;
            })
        );
      } else {
        await this.compileFile(file, dest).catch(err => {
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
    const md = await files.readAllText(src);
    const body = this.compiler.render(md);
    const title = cheerio
      .load(body)("h1")
      .first()
      .text();
    // Use style
    const base = path.dirname(src);
    let output = this.style.template
      .replace(/{{ styles }}/g, await this.style.styles(base))
      .replace(/{{ scripts }}/g, await this.style.scripts(base))
      .replace(/{{ title }}/g, title || path.basename(src))
      .replace(/{{ body }}/g, body);
    // Inline resources
    if (["light", "full"].includes(this.embedMode)) {
      let options = { fileContent: output, relativeTo: base };
      if (this.embedMode === "full") {
        Object.assign(options, { images: true, svgs: true });
      }
      output = await inline(options);
    }
    // Apply .hljs CSS class to all <pre> tags
    output = output.replace(/<pre>/g, '<pre class="hljs">');
    // Minify
    output = minify(output, {
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      ignoreCustomComments: [/^\s*!/], // Keep comments starting with "!"
    });
    // Save output file
    const outputFileName = path.basename(src).replace(/\.md$/, ".html");
    const outputFile = path.join(dest || path.dirname(src), outputFileName);
    await files.writeAllText(outputFile, output);
    console.log(`${src} -> ${outputFile}`);
    return outputFile;
  }
}

module.exports = {
  Processor,
};
