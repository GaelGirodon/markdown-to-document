const path = require("path");
const CleanCSS = require("clean-css");
const io = require("./io");

/** Path to assets directory */
const ASSETS_PATH = path.join(__dirname, "..", "assets");

/** Path to layouts directory */
const LAYOUTS_PATH = path.join(ASSETS_PATH, "layouts");

/** Path to themes directory */
const THEMES_PATH = path.join(ASSETS_PATH, "themes");

/** Path to additional extensions */
const EXT_PATH = path.join(ASSETS_PATH, "ext");

/** Path to node_modules directory */
const NODE_MODULES_PATH = path.join(__dirname, "..", "node_modules");

/** Path to Highlight.js styles directory */
const HLJS_STYLES_PATH = path.join(NODE_MODULES_PATH, "highlight.js", "styles");

/**
 * A Markdown compiler style.
 */
class Style {
    /**
     * Construct the style.
     * @param {*} opts Style options.
     */
    constructor(opts) {
        this.layout = opts.layout || "none"; // HTML layout
        this.theme = opts.theme; // CSS theme
        this.highlightStyle = opts.highlightStyle; // Syntax highlighting style
        this.numberedHeadings = opts.numberedHeadings; // Enable numbered headings
        this.codeCopy = opts.codeCopy; // Enable copy code button
        this.embed = opts.embed; // Embed external resources
    }

    /**
     * Load the style.
     * @return {Promise<Style>} this.
     */
    async load() {
        // Template
        const lPath = path.join(LAYOUTS_PATH, this.layout + ".html");
        this.template = await io.readAllText(await this.validate(lPath, this.layout, "layout"));

        // Styles: theme, highlight style and extensions
        const styles = [];
        if (this.theme) {
            const tPath = path.join(THEMES_PATH, this.theme + ".css");
            styles.push(await this.validate(tPath, this.theme, "style"));
        }
        if (this.highlightStyle) {
            const hPath = path.join(HLJS_STYLES_PATH, this.highlightStyle + ".css");
            styles.push(await this.validate(hPath, this.highlightStyle, "highlight style"));
        }
        if (this.numberedHeadings) styles.push(path.join(EXT_PATH, "numbered-headings.css"));
        if (this.codeCopy) styles.push(path.join(EXT_PATH, "code-copy.css"));

        this.styles = "";
        for (const s of styles) {
            this.styles += this.embed
                ? await io.readAllText(s)
                : `<link rel="stylesheet" href="file://${s}">\n`;
        }
        if (this.embed && this.styles) {
            this.styles = "<style>\n" + new CleanCSS().minify(this.styles).styles + "\n</style>";
        }

        // Scripts
        const scripts = [];
        if (this.codeCopy) {
            scripts.push(path.join(NODE_MODULES_PATH, "clipboard", "dist", "clipboard.min.js"));
            scripts.push(path.join(EXT_PATH, "code-copy.js"));
        }

        this.scripts = "";
        for (const s of scripts) {
            this.scripts += this.embed
                ? await io.readAllText(s)
                : `<script src="file://${s}"></script>>\n`;
        }
        if (this.embed && this.scripts) {
            this.scripts = "<script>\n" + this.scripts + "\n</script>";
        }

        return this;
    }

    /**
     * Tests a resource path to check if it is a readable file.
     * Returns the file path on success, throws on error.
     * @param {string} path The resource path
     * @param {string} name The resource name
     * @param {string} type The resource type
     * @return {string} The file path (if the file is readable).
     */
    async validate(path, name, type) {
        if (!(await io.isReadable(path))) {
            throw new Error(`Invalid ${type} '${name}': file not found or not readable.`);
        }
        return path;
    }
}

module.exports = {
    Style
};
