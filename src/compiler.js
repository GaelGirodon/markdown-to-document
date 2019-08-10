const hljs = require("highlight.js");
const markdownIt = require("markdown-it");
const { randomId } = require("./util");

/** <pre> code block for highlighting function */
const PRE_BLOCK = '<pre class="hljs"><code>{{ code }}</code>{{ copy_block }}</pre>';

/** "Copy to clipboard" additional block */
const COPY_BLOCK = '<textarea id="{{ id }}" rows="1" cols="2">{{ code }}</textarea>';

/**
 * Construct a Markdown compiler using Markdown.it.
 * @param {boolean} codeCopy Enable the "Copy to clipboard" button in code blocks
 * @return The initialized Markdown.it compiler
 */
function compiler(codeCopy) {
  /**
   * Syntax highlighting function.
   */
  function highlight(str, lang) {
    const escapedCode = md.utils.escapeHtml(str);
    const copyBlock = codeCopy
      ? COPY_BLOCK.replace(/{{ id }}/g, randomId()).replace(/{{ code }}/g, escapedCode.trim())
      : "";
    if (lang && hljs.getLanguage(lang)) {
      try {
        return PRE_BLOCK.replace(/{{ code }}/g, hljs.highlight(lang, str, true).value).replace(
          "{{ copy_block }}",
          copyBlock
        );
      } catch (e) {
        console.debug(e);
      }
    }
    return PRE_BLOCK.replace(/{{ code }}/g, escapedCode).replace(/{{ copy_block }}/g, copyBlock);
  }

  /** Markdown.it instance */
  let md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight,
  });

  // Plugins
  md = md
    .use(require("markdown-it-abbr")) // Abbreviation (<abbr>) tag
    .use(require("markdown-it-container"), "warning") // Custom block containers
    .use(require("markdown-it-deflist")) // Definition list (<dl>) tag
    .use(require("markdown-it-footnote")) // Footnotes
    .use(require("markdown-it-ins")) // Inserted (<ins>) tag
    .use(require("markdown-it-mark")) // Marked (<mark>) tag
    .use(require("markdown-it-sub")) // Subscript (<sub>) tag
    .use(require("markdown-it-sup")) // Superscript (<sup>) tag
    .use(
      require("markdown-it-anchor"), // Header anchors (permalinks)
      { level: 2, permalink: false, permalinkBefore: false, permalinkSymbol: "§" }
    )
    .use(
      require("markdown-it-toc-done-right"), // Table of contents
      { level: [2, 3] }
    );

  return md;
}

module.exports = {
  compiler,
};
