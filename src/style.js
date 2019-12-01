const paths = require("path");
const files = require("./files");
const { fetchText } = require("./net");

/** Path to node_modules directory */
const NODE_MODULES_PATH = paths.join(__dirname, "..", "node_modules");

/** Path to assets directory */
const ASSETS_PATH = paths.join(__dirname, "..", "assets");

/** Path to layouts directory */
const LAYOUTS_PATH = paths.join(ASSETS_PATH, "layouts");

/** Path to themes directory */
const THEMES_PATH = paths.join(ASSETS_PATH, "themes");

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
    this.stylePaths = [];
    this.scriptsPaths = [];
  }

  /**
   * Prepare the style
   * (load the HTML template layout and prepare styles and scripts paths).
   * @return {Promise<Style>} this
   */
  async init() {
    // Template
    this.template = await this.loadLayout(this.layout);

    // Styles: theme, highlight style and extensions
    if (this.theme) this.stylePaths.push(await this.loadTheme(this.theme));
    if (this.highlightStyle)
      this.stylePaths.push(await this.loadHighlightStyle(this.highlightStyle));
    if (this.numberedHeadings) this.stylePaths.push(paths.join(EXT_PATH, "numbered-headings.css"));
    if (this.codeCopy) this.stylePaths.push(paths.join(EXT_PATH, "code-copy.css"));

    // Scripts
    if (this.codeCopy) {
      this.scriptsPaths.push(
        paths.join(NODE_MODULES_PATH, "clipboard", "dist", "clipboard.min.js")
      );
      this.scriptsPaths.push(paths.join(EXT_PATH, "code-copy.js"));
    }
    return this;
  }

  /**
   * Prepare and return styles tags (theme, highlight style and extensions).
   * @param {string} base Transform styles path to make them relative to this path.
   * @return {Promise<string>} Styles tags
   */
  async styles(base) {
    return this.stylePaths
      .map(s => `<link rel="stylesheet" href="${files.localToUrl(s, base)}">`)
      .join("\n");
  }

  /**
   * Prepare and return scripts tags.
   * @param {string} base Transform scripts path to make them relative to this path.
   * @return {Promise<string>} Scripts tags
   */
  async scripts(base) {
    return this.scriptsPaths
      .map(s => `<script src="${files.localToUrl(s, base)}"></script>`)
      .join("\n");
  }

  /**
   * Load a layout.
   * @param {string} layout Predefined layout name or custom layout path (local file or URL)
   * @return {Promise<string>} The layout file content
   */
  async loadLayout(layout) {
    // URL
    if (files.isRemote(layout)) {
      try {
        return await fetchText(layout, true);
      } catch (e) {
        throw new Error(`Invalid layout '${layout}': ${e.message}.`);
      }
    } // else: Local path
    // Predefined layout
    let layoutPath = paths.join(LAYOUTS_PATH, layout + ".html");
    if (!/^[\w-]+$/.test(layout) || !(await files.isReadable(layoutPath))) {
      // Custom layout
      layoutPath = await this.validate(layout, layout, "layout");
    }
    return await files.readAllText(layoutPath);
  }

  /**
   * Load a theme.
   * @param {string} theme Predefined theme name or custom theme path
   * @return {Promise<string>} The valid theme file path
   */
  async loadTheme(theme) {
    // Predefined theme (.css)
    let themePath = paths.join(THEMES_PATH, theme + ".css");
    if (/^[\w-]+$/.test(theme) && (await files.isReadable(themePath))) {
      return themePath;
    } // else
    // Predefined generated theme (.min.css)
    themePath = paths.join(THEMES_PATH, theme + ".min.css");
    if (/^[\w-]+$/.test(theme) && (await files.isReadable(themePath))) {
      return themePath;
    } // else
    // Custom theme
    return await this.validate(theme, theme, "theme");
  }

  /**
   * Load a highlight style.
   * @param {string} style Predefined style name or custom style path
   * @return {Promise<string>} The valid highlight style file path
   */
  async loadHighlightStyle(style) {
    // Predefined highlight style
    let stylePath = paths.join(HLJS_STYLES_PATH, style + ".css");
    if (!/^[\w-]+$/.test(style) || !(await files.isReadable(stylePath))) {
      // Custom highlight style
      stylePath = await this.validate(style, style, "highlight style");
    }
    return stylePath;
  }

  /**
   * Tests a resource path to check if it is a readable file.
   * Returns the file path on success, throws on error.
   * If the path is a remote path (HTTP/network), the test is skipped
   * and the file URL is returned.
   * @param {string} path The resource path
   * @param {string} name The resource name
   * @param {string} type The resource type
   * @return {Promise<string>} The file path (if the file is readable)
   */
  async validate(path, name, type) {
    if (!files.isRemote(path) && !(await files.isReadable(path))) {
      throw new Error(`Invalid ${type} '${name}': file not found or not readable.`);
    }
    return path;
  }
}

module.exports = {
  Style,
};
