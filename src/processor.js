const Promise = require("bluebird");
const path = require("path");
const fs = Promise.promisifyAll(require("fs"));
const glob = Promise.promisify(require("glob"));
const watcher = require("chokidar");
const chalk = require("chalk");
const cheerio = require("cheerio");
const inline = Promise.promisify(require("web-resource-inliner").html);
const minify = require("html-minifier").minify;

const io = require("./io");
const { compiler } = require("./compiler");
const { Style } = require("./style");

/**
 * Markdown processor.
 */
class Processor {
    /**
     * Construct a Markdown processor.
     * @param {*} opts Processor options.
     */
    constructor(opts) {
        this.embedMode = opts.embedMode;
        this.style = new Style(opts);
        this.compiler = compiler(opts.codeCopy);
    }

    /**
     * Initialize the processor instance.
     */
    async init() {
        await this.style.load();
    }

    /**
     * Process Markdown files.
     * @param {string} src Path to the Markdown files to process
     * @param {string} dest Output path
     */
    async process(src, dest, watch) {
        // List and check source files
        const sources = src.length == 1 && glob.hasMagic(src[0]) ? await glob(src[0]) : src;
        if (!sources || sources.length == 0 || !sources.every(s => /\.md$/.test(s))) {
            throw new Error("Invalid source file(s) (should be valid .md files).");
        }
        // Check destination path
        if (dest && !(await io.isDirectory(dest))) {
            throw new Error("Invalid output path (should be a valid directory).");
        }
        // Compile source files
        for (const file of sources) {
            if (watch) {
                console.log(`${chalk.gray("[watch]")} ${file}`);
                watcher
                    .watch(file, { awaitWriteFinish: { stabilityThreshold: 500 } })
                    .on("change", path => this.compileFile(path, dest));
            } else {
                this.compileFile(file, dest);
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
        // Load and compile Markdown file
        const md = await fs.readFileAsync(src, "utf8");
        const body = this.compiler.render(md);
        const title = cheerio
            .load(body)("h1")
            .first()
            .text();
        // Use style
        let output = this.style.template
            .replace(/{{ title }}/g, title || path.basename(src))
            .replace(/{{ body }}/g, body)
            .replace(/{{ styles }}/g, this.style.styles)
            .replace(/{{ scripts }}/g, this.style.scripts);
        // Inline resources
        if (["light", "full"].includes(this.embedMode)) {
            // web-resource-inliner doesn't support file URL scheme
            output = output.replace(/(src|href)="file:\/\//g, "$1=\"");
            let options = { fileContent: output, relativeTo: path.dirname(src) };
            if (this.embedMode == "full") {
                Object.assign(options, { images: true, svgs: true });
            }
            output = await inline(options);
        }
        // Minify
        output = minify(output, { minifyCSS: true, minifyJS: true });
        // Save output file
        const outputFileName = path.basename(src).replace(/\.md$/, ".html");
        const outputFile = path.join(dest || path.dirname(src), outputFileName);
        fs.writeFileAsync(outputFile, output, "utf8");
        console.log(`${src} -> ${outputFile}`);
        return outputFile;
    }
}

module.exports = {
    Processor
};
