const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");
const assert = require("chai").assert;

const files = require("../src/files");
const { Processor } = require("../src/processor");
const { buildPath } = require("./util");

const github = "https://raw.githubusercontent.com";

describe("Processor", () => {
  afterEach(async () => {
    const paths = [
      "README.html",
      "CHANGELOG.html",
      "test/README.html",
      path.join("test", "data", "join", "MERGED.md"),
      path.join("test", "data", "join", "MERGED.html"),
    ].map(p => buildPath(p));
    for (const p of paths) {
      if (await files.exists(p)) {
        await fs.unlinkAsync(p);
      }
    }
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a single Markdown file into raw HTML", async () => {
      const proc = new Processor();
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      assert.include(html, "<h1>");
      assert.notInclude(html, "<html>");
      assert.notInclude(html, "<body>");
    });
    it("should fail if no source file is provided", async () => {
      const proc = new Processor();
      try {
        await proc.process([]);
        assert.fail();
      } catch (ex) {
        // success
      }
    });
    it("should fail if the source file is not a .md file", async () => {
      const proc = new Processor();
      const src = buildPath("LICENSE");
      try {
        await proc.process([src]);
        assert.fail();
      } catch (ex) {
        // success
      }
    });
    it("should fail if the source file doesn't exist", async () => {
      const proc = new Processor();
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
      const proc = new Processor();
      const src = buildPath("*.md");
      await proc.process([src]);
      assert.isTrue(await files.exists(buildPath("README.html")));
      assert.isTrue(await files.exists(buildPath("CHANGELOG.html")));
    });
  });

  describe("mdtodoc doc.md --dest <dest>", () => {
    it("should output the HTML file to a custom directory", async () => {
      const proc = new Processor({ dest: buildPath("test") });
      const src = buildPath("README.md");
      const dst = buildPath("test/README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should fail if the destination is invalid", async () => {
      const proc = new Processor({ dest: buildPath("unknown") });
      const src = buildPath("README.md");
      let throws = false;
      try {
        await proc.process([src]);
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
      assert.include(html, "<style>body .octicon");
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
      assert.include(html, 'document.querySelectorAll("pre.code-block")'); // code-copy.js
      // Mermaid
      assert.include(html, "<style>.mermaid");
      assert.include(html, "<script>mermaid");
    });
  });

  describe('mdtodoc doc.md -l "page" -t "github" -s "atom-one-light" -n -c -m --embed-mode <embed-mode>', () => {
    it("should embed only small scripts and images (light)", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
        numberedHeadings: true,
        codeCopy: true,
        mermaid: true,
        embedMode: "light",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Page should not include CSS external link
      assert.notInclude(html, 'link rel="stylesheet" href="');
      // Page should include Mermaid from CDN
      assert.include(html, 'script src="https://cdn');
      // Page should include inlined images
      assert.include(html, 'src="data:image');
    });
    it("should embed images and small scripts (default)", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
        numberedHeadings: true,
        codeCopy: true,
        mermaid: true,
        embedMode: "default",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Page should not include CSS external link
      assert.notInclude(html, 'link rel="stylesheet" href="');
      // Page should include Mermaid from CDN
      assert.include(html, 'script src="https://cdn');
      // Page should only include inlined images
      assert.include(html, 'src="data:image');
    });
    it("should embed everything (full)", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "atom-one-light",
        numberedHeadings: true,
        codeCopy: true,
        mermaid: true,
        embedMode: "full",
      });
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Page should not include any external resource
      assert.notInclude(html, 'link rel="stylesheet" href="');
      assert.notInclude(html, 'script src="http');
    });
  });

  describe('mdtodoc doc.md -l <custom_layout> -t <custom_theme> -s <custom_highlight_style> -n -c -e "full"', () => {
    it("should use a custom layout (local file) and a custom theme and highlight style (URL)", async () => {
      const proc = new Processor({
        layout: buildPath("assets/layouts/page.html"),
        theme: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
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
        layout: `${github}/GaelGirodon/markdown-to-document/master/assets/layouts/page.html`,
        theme: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
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
        theme: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
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
        layout: `${github}/GaelGirodon/markdown-to-document/master/assets/layouts/unknown.html`,
        theme: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/master/src/styles/monokai.css`,
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

  describe("mdtodoc **/*.md --join", () => {
    it("should join and compile files", async () => {
      const proc = new Processor({ join: true });
      const src = buildPath(path.join("test", "data", "join"));
      const dstMd = buildPath(path.join("test", "data", "join", "MERGED.md"));
      const dst = buildPath(path.join("test", "data", "join", "MERGED.html"));
      await proc.process([`${src}/README.md`, `${src}/a.md`, `${src}/*/**/*.md`]);
      assert.isTrue(await files.exists(dstMd));
      assert.isTrue(await files.exists(dst));
      assert.equal(
        await files.readAllText(dstMd),
        `# README

[[toc]]

## a

\`\`\`yaml
# A comment
item:
\`\`\`

## b.index

### b.b

## c.README

[asset](./c/asset.txt)
[invalid asset](asset.txt)

`
      );
    });
  });
});
