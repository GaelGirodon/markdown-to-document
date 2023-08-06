import ejs from "ejs";
import paths from "node:path";

import * as files from "./files.js";
import { request } from "./net.js";

/** Path to assets directory */
const ASSETS_PATH = paths.join(files.ROOT_DIR, "assets");

/** Path to layouts directory */
const LAYOUTS_PATH = paths.join(ASSETS_PATH, "layouts");

/** Path to themes directory */
const THEMES_PATH = paths.join(ASSETS_PATH, "themes");

/** Path to Highlight.js styles directory */
const HLJS_STYLES_PATH = paths.join(files.resolveModuleDirectory("highlight.js"), "styles");

/** Path to additional features */
const FEATURES_PATH = paths.join(ASSETS_PATH, "features");

/** Paths to JavaScript libraries */
export const LIBRARIES = {
  clipboard: paths.join(files.resolveModuleDirectory("clipboard"), "dist", "clipboard.min.js"),
  mermaid: "https://unpkg.com/mermaid@10/dist/mermaid.min.js",
};

/** Path to additional feature files */
const FEATURES = {
  "numbered-headings": {
    css: paths.join(FEATURES_PATH, "numbered-headings.min.css"),
  },
  "code-copy": {
    css: paths.join(FEATURES_PATH, "code-copy.min.css"),
    js: paths.join(FEATURES_PATH, "code-copy.min.js"),
  },
  mermaid: {
    css: paths.join(FEATURES_PATH, "mermaid.min.css"),
    js: paths.join(FEATURES_PATH, "mermaid.min.js"),
  },
};

/**
 * A Markdown compiler style.
 */
export class Style {
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
    this.mermaid = opts.mermaid; // Enable mermaid support
    this.embedMode = opts.embedMode; // Embed external resources
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
    let layout = await this.loadLayout(this.layout);
    this.template = ejs.compile(this.legacyTemplateToEJS(layout));

    // Styles: theme, highlight style and additional features
    if (this.theme) this.stylePaths.push(await this.loadTheme(this.theme));
    if (this.highlightStyle)
      this.stylePaths.push(await this.loadHighlightStyle(this.highlightStyle));
    if (this.numberedHeadings) this.stylePaths.push(FEATURES["numbered-headings"].css);
    if (this.codeCopy) this.stylePaths.push(FEATURES["code-copy"].css);
    if (this.mermaid) this.stylePaths.push(FEATURES["mermaid"].css);

    // Scripts
    if (this.codeCopy) {
      this.scriptsPaths.push(LIBRARIES["clipboard"]);
      this.scriptsPaths.push(FEATURES["code-copy"].js);
    }
    if (this.mermaid) {
      this.scriptsPaths.push(LIBRARIES["mermaid"]);
      this.scriptsPaths.push(FEATURES["mermaid"].js);
    }
    return this;
  }

  /**
   * Return styles URLs (theme, highlight style and additional features).
   * @param {string} base Transform styles path to make them relative to this path.
   * @return {Promise<string[]>} Styles URLs
   */
  async styles(base) {
    return this.stylePaths.map((s) => files.localToUrl(s, base));
  }

  /**
   * Return scripts URLs.
   * @param {string} base Transform scripts path to make them relative to this path.
   * @return {Promise<string[]>} Scripts URLs
   */
  async scripts(base) {
    return this.scriptsPaths.map((s) => files.localToUrl(s, base));
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
        return (await request(layout, true)).body.toString("utf8");
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
    // Predefined theme
    const themePath = paths.join(THEMES_PATH, theme + ".min.css");
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
    if (!/^(\w+\/)?[\w-]+$/.test(style) || !(await files.isReadable(stylePath))) {
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

  /**
   * Convert a template using the legacy basic syntax to EJS for backward compatibility.
   * @param {string} template Template that may use the legacy basic syntax
   * @returns {string} EJS template
   */
  legacyTemplateToEJS(template) {
    return template.includes("{{")
      ? template
          .replace(
            /\{\{ *styles *}}/g,
            `<% for (const s of styles) { -%>\n<link rel="stylesheet" href="<%= s %>">\n<% } -%>`
          )
          .replace(
            /\{\{ *scripts *}}/g,
            `<% for (const s of scripts) { -%>\n<script src="<%= s %>"></script>\n<% } -%>`
          )
          .replace(/\{\{ *([\w.-]+) *}}/g, "<%- $1 -%>")
      : template;
  }
}
