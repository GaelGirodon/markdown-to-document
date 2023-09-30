import MarkdownIt from "markdown-it";
import abbr from "markdown-it-abbr";
import anchor from "markdown-it-anchor";
import container from "markdown-it-container";
import defList from "markdown-it-deflist";
import emoji from "markdown-it-emoji";
import footnote from "markdown-it-footnote";
import ins from "markdown-it-ins";
import mark from "markdown-it-mark";
import sub from "markdown-it-sub";
import sup from "markdown-it-sup";
import taskLists from "markdown-it-task-lists";
import tocDoneRight from "markdown-it-toc-done-right";

import { randomId } from "./util.js";

/** <pre> code block for highlighting function */
const PRE_BLOCK =
  '<pre class="{{ pre_class }}"><code class="{{ code_class }}">{{ code }}</code>{{ copy_block }}</pre>';

/** "Copy to clipboard" additional block */
const COPY_BLOCK = '<textarea id="{{ id }}" rows="1" cols="2">{{ code }}</textarea>';

/**
 * A Markdown compiler (using Markdown.it).
 */
export class Compiler {
  /**
   * Construct a Markdown compiler.
   * @param {{codeCopy: boolean, highlightStyle: boolean}} opts Compiler options
   */
  constructor(opts) {
    this.codeCopy = opts.codeCopy;
    this.highlightStyle = opts.highlightStyle;
  }

  /**
   * Prepare the compiler.
   * @return {Promise<Compiler>} this
   */
  async init() {
    // Import Highlight.js only if necessary
    const hljs = this.highlightStyle ? (await import("highlight.js")).default : null;

    // Syntax highlighting function
    const highlight = (str, lang) => {
      const escapedCode = this.md.utils.escapeHtml(str);
      const copyBlock =
        this.codeCopy && lang !== "mermaid"
          ? COPY_BLOCK.replace(/{{ id }}/g, randomId()).replace(/{{ code }}/g, escapedCode.trim())
          : "";
      if (lang && hljs?.getLanguage(lang)) {
        try {
          const hljsOpts = { language: lang, ignoreIllegals: true };
          return PRE_BLOCK.replace(/{{ pre_class }}/g, "code-block hljs")
            .replace(/{{ code_class }}/g, `language-${lang} ${lang}`)
            .replace(/{{ code }}/g, hljs.highlight(str, hljsOpts).value)
            .replace(/{{ copy_block }}/g, copyBlock);
        } catch (e) {
          console.debug(e);
        }
      }
      const preClass = lang === "mermaid" ? "mermaid-block" : "code-block";
      return PRE_BLOCK.replace(/{{ pre_class }}/g, preClass)
        .replace(/{{ code_class }}/g, `language-${lang} ${lang}`)
        .replace(/{{ code }}/g, escapedCode)
        .replace(/{{ copy_block }}/g, copyBlock);
    };

    // Markdown.it instance
    this.md = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight,
    })
      // Plugins
      .use(abbr) // Abbreviation (<abbr>) tag
      .use(container, "warning") // Custom block containers
      .use(defList) // Definition list (<dl>) tag
      .use(emoji) // Emoji syntax
      .use(footnote) // Footnotes
      .use(ins) // Inserted (<ins>) tag
      .use(mark) // Marked (<mark>) tag
      .use(sub) // Subscript (<sub>) tag
      .use(sup) // Superscript (<sup>) tag
      .use(anchor, { level: 2 }) // Header anchors (permalinks)
      .use(taskLists) // Task lists
      .use(tocDoneRight, { level: [2, 3] }); // Table of contents

    return this;
  }

  /**
   * Compile Markdown into HTML.
   * @param {string} src Markdown document
   * @return {string} HTML document
   */
  compile(src) {
    return this.md.render(src);
  }
}
