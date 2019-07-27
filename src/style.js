const paths = require("path");
const url = require("url");

const io = require("./io");

/** Path to node_modules directory */
const NODE_MODULES_PATH = paths.join(__dirname, "..", "node_modules");

/** Path to assets directory */
const ASSETS_PATH = paths.join(__dirname, "..", "assets");

/** Path to layouts directory */
const LAYOUTS_PATH = paths.join(ASSETS_PATH, "layouts");

/** Path to themes directory */
const THEMES_PATH = paths.join(ASSETS_PATH, "themes");

/** Themes from external modules */
const NODE_THEMES = {
    github: paths.join(NODE_MODULES_PATH, "github-markdown-css", "github-markdown.css")
};

/** Path to Highlight.js styles directory */
const HLJS_STYLES_PATH = paths.join(NODE_MODULES_PATH, "highlight.js", "styles");

/** Path to additional extensions */
const EXT_PATH = paths.join(ASSETS_PATH, "ext");

/**
 * A Markdown compiler style.
 */
class Style {
    /**
     * Construct a style from a layout, a theme, a highlight style
     * and other options (numbered headings, code copy).
     * @param {*} opts Style options
     */
    constructor(opts) {
        this.layout = opts.layout || "none"; // HTML layout
        this.theme = opts.theme; // CSS theme
        this.highlightStyle = opts.highlightStyle; // Syntax highlighting style
        this.numberedHeadings = opts.numberedHeadings; // Enable numbered headings
        this.codeCopy = opts.codeCopy; // Enable copy code button
    }

    /**
     * Build the style (load the HTML template layout and prepare styles and scripts).
     * @return {Promise<Style>} this
     */
    async build() {
        // Template
        this.template = await this.loadLayout(this.layout);

        // Styles: theme, highlight style and extensions
        const styles = [];
        if (this.theme) styles.push(await this.loadTheme(this.theme));
        if (this.highlightStyle) styles.push(await this.loadHighlightStyle(this.highlightStyle));
        if (this.numberedHeadings) styles.push(paths.join(EXT_PATH, "numbered-headings.css"));
        if (this.codeCopy) styles.push(paths.join(EXT_PATH, "code-copy.css"));
        this.styles = "";
        for (const s of styles) {
            this.styles += `<link rel="stylesheet" href="${url.pathToFileURL(s)}">\n`;
        }

        // Scripts
        const scripts = [];
        if (this.codeCopy) {
            scripts.push(paths.join(NODE_MODULES_PATH, "clipboard", "dist", "clipboard.min.js"));
            scripts.push(paths.join(EXT_PATH, "code-copy.js"));
        }
        this.scripts = "";
        for (const s of scripts) {
            this.scripts += `<script src="${url.pathToFileURL(s)}"></script>\n`;
        }

        return this;
    }

    /**
     * Load a layout.
     * @param {string} layout Predefined layout name or custom layout path
     * @return {Promise<string>} The layout file content
     */
    async loadLayout(layout) {
        // Predefined layout
        let layoutPath = paths.join(LAYOUTS_PATH, layout + ".html");
        if (!/^[\w-]+$/.test(layout) || !(await io.isReadable(layoutPath))) {
            // Custom layout
            layoutPath = await this.validate(layout, layout, "layout");
        }
        return await io.readAllText(layoutPath);
    }

    /**
     * Load a theme.
     * @param {string} theme Predefined theme name or custom theme path
     * @return {Promise<string>} The valid theme file path
     */
    async loadTheme(theme) {
        // Predefined theme
        let themePath =
            theme in NODE_THEMES ? NODE_THEMES[theme] : paths.join(THEMES_PATH, theme + ".css");
        if (!/^[\w-]+$/.test(theme) || !(await io.isReadable(themePath))) {
            // Custom theme
            themePath = await this.validate(theme, theme, "theme");
        }
        return themePath;
    }

    /**
     * Load a highlight style.
     * @param {string} style Predefined style name or custom style path
     * @return {Promise<string>} The valid highlight style file path
     */
    async loadHighlightStyle(style) {
        // Predefined highlight style
        let stylePath = paths.join(HLJS_STYLES_PATH, style + ".css");
        if (!/^[\w-]+$/.test(style) || !(await io.isReadable(stylePath))) {
            // Custom highlight style
            stylePath = await this.validate(style, style, "highlight style");
        }
        return stylePath;
    }

    /**
     * Tests a resource path to check if it is a readable file.
     * Returns the file path on success, throws on error.
     * @param {string} path The resource path
     * @param {string} name The resource name
     * @param {string} type The resource type
     * @return {Promise<string>} The file path (if the file is readable)
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
