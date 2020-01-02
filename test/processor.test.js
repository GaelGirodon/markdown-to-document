const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const assert = require("chai").assert;

const files = require("../src/files");
const { Processor } = require("../src/processor");
const { buildPath } = require("./util");

describe("Processor", () => {
  afterEach(async () => {
    const paths = ["README.html", "CHANGELOG.html", "test/README.html"].map(p => buildPath(p));
    for (const path of paths) {
      if (await files.exists(path)) {
        await fs.unlinkAsync(path);
      }
    }
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a single Markdown file into raw HTML", async () => {
      const proc = new Processor({});
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      assert.include(html, "<h1>");
      assert.notInclude(html, "<html>");
      assert.notInclude(html, "<body>");
    });
    it("should fail if the source file is not a .md file", async () => {
      const proc = new Processor({});
      const src = buildPath("LICENSE");
      try {
        await proc.process([src]);
        assert.fail();
      } catch (ex) {
        // success
      }
    });
    it("should fail if the source file doesn't exist", async () => {
      const proc = new Processor({});
      const src = buildPath("UNKNOWN.md");
      const dst = buildPath("UNKNOWN.html");
      try {
        await proc.process([src]);
        assert.fail();
      } catch (ex) {
        // success
      }
      assert.isFalse(await files.exists(dst));
    });
  });

  describe("mdtodoc *.md", () => {
    it("should compile multiple Markdown files using glob syntax", async () => {
      const proc = new Processor({});
      const src = buildPath("*.md");
      await proc.process([src]);
      assert.isTrue(await files.exists(buildPath("README.html")));
      assert.isTrue(await files.exists(buildPath("CHANGELOG.html")));
    });
  });

  describe("mdtodoc doc.md --dest <dest>", () => {
    it("should output the HTML file to a custom directory", async () => {
      const proc = new Processor({});
      const src = buildPath("README.md");
      const dst = buildPath("test/README.html");
      await proc.process([src], buildPath("test"));
      assert.isTrue(await files.exists(dst));
    });
    it("should fail if the destination is invalid", async () => {
      const proc = new Processor({});
      const src = buildPath("README.md");
      let throws = false;
      try {
        await proc.process([src], buildPath("unknown"));
      } catch (ex) {
        throws = true;
      }
      assert.isTrue(throws);
    });
  });

  describe('mdtodoc doc.md --layout "page" --theme "github" --highlight-style "atom-one-light"', () => {
    it("should improve HTML output with a layout, a theme and a highlight style", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Layout
      assert.include(html, "<html");
      assert.include(html, "<body>");
      // Theme
      assert.include(html, "<style>@font-face");
      // Highlight style
      assert.include(html, "<style>.hljs");
    });
    it("should fail if one of the resources doesn't exist", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "unknown", // "unknown" is not a valid theme
        highlightStyle: "atom-one-light",
      });
      let throws = false;
      try {
        await proc.process([buildPath("README.md")]);
      } catch (ex) {
        throws = true;
      }
      assert.isTrue(throws);
    });
  });

  describe('mdtodoc doc.md -l "page" -t "github" -s "atom-one-light" --numbered-headings --code-copy --mermaid', () => {
    it("should enable additional extensions", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
        numberedHeadings: true,
        codeCopy: true,
        mermaid: true,
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Numbered headings
      assert.include(html, "<style>h1");
      // Code copy
      assert.include(html, "<textarea id=");
      assert.include(html, "<script>!"); // clipboard.js
      assert.include(html, 'document.querySelectorAll("pre.hljs")'); // code-copy.js
      // Mermaid
      assert.include(html, "<style>.mermaid");
      assert.include(html, "<script>mermaid");
    });
  });

  describe('mdtodoc doc.md -l "page" -t "github" -s "atom-one-light" -n -c --embed-mode "full"', () => {
    it("should embed everything", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
  });

  describe('mdtodoc doc.md -l <custom_layout> -t <custom_theme> -s <custom_highlight_style> -n -c -e "full"', () => {
    it("should use a custom layout (local file) and a custom theme and highlight style (URL)", async () => {
      const proc = new Processor({
        layout: buildPath("assets/layouts/page.html"),
        theme:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        highlightStyle:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should use a custom layout, theme and highlight style (URL)", async () => {
      const proc = new Processor({
        layout:
          "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/master/assets/layouts/page.html",
        theme:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        highlightStyle:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should fail if the custom layout doesn't exist (local file)", async () => {
      const proc = new Processor({
        layout: buildPath("assets/layouts/unknown.html"),
        theme:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        highlightStyle:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      let throws = false;
      try {
        await proc.process([buildPath("README.md")]);
      } catch (ex) {
        throws = true;
      }
      assert.isTrue(throws);
    });
    it("should fail if the custom layout doesn't exist (URL)", async () => {
      const proc = new Processor({
        layout:
          "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/master/assets/layouts/unknown.html",
        theme:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        highlightStyle:
          "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css",
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      let throws = false;
      try {
        await proc.process([buildPath("README.md")]);
      } catch (ex) {
        throws = true;
      }
      assert.isTrue(throws);
    });
  });
});
