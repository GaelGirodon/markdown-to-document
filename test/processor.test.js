import { assert } from "chai";
import fs from "node:fs/promises";

import * as files from "../src/files.js";
import { Processor } from "../src/processor.js";
import { LIBRARIES } from "../src/style.js";
import { buildDataPath, buildPath } from "./util.js";

const github = "https://raw.githubusercontent.com";

describe("Processor", () => {
  afterEach(async () => {
    const paths = [
      "README.html",
      "CHANGELOG.html",
      "test/README.html",
      "test/data/README.html",
      "test/data/join/MERGED.md",
      "test/data/join/MERGED.html",
    ].map((p) => buildPath(p));
    for (const p of paths) {
      if (await files.exists(p)) {
        await fs.unlink(p);
      }
    }
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a single Markdown file into raw HTML", async () => {
      const proc = new Processor();
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      assert.include(html, "<h1>");
      assert.include(html, String.fromCodePoint(0x1f4dd)); // Emoji
      assert.notInclude(html, "<html>");
      assert.notInclude(html, "<body>");
    });
    it("should fail if no source file is provided", async () => {
      const proc = new Processor();
      try {
        await proc.process([]);
        assert.fail();
      } catch (err) {
        // success
      }
    });
    it("should fail if the source file is not a .md file", async () => {
      const proc = new Processor();
      const src = buildPath("LICENSE");
      try {
        await proc.process([src]);
        assert.fail();
      } catch (err) {
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
      } catch (err) {
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
      const proc = new Processor({ dest: buildDataPath("..") });
      const src = buildDataPath("README.md");
      const dst = buildDataPath("../README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should fail if the destination is invalid", async () => {
      const proc = new Processor({ dest: buildDataPath("unknown") });
      const src = buildDataPath("README.md");
      let throws = false;
      try {
        await proc.process([src]);
      } catch (err) {
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
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Layout
      assert.include(html, "<html");
      assert.include(html, "<body>");
      // Theme
      assert.include(html, "<style>body{color-scheme");
      // Highlight style
      assert.include(html, "<style>pre code.hljs");
    });
    it("should fail if one of the resources doesn't exist", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "unknown", // "unknown" is not a valid theme
        highlightStyle: "atom-one-light",
      });
      let throws = false;
      try {
        await proc.process([buildDataPath("README.md")]);
      } catch (err) {
        throws = true;
      }
      assert.isTrue(throws);
    });
  });

  describe('mdtodoc doc.md -l "page" -t "github" --highlight-style "base16/solarized-dark"', () => {
    it("should use a highlight style from the base16 folder", async () => {
      const proc = new Processor({
        layout: "page",
        theme: "github",
        highlightStyle: "base16/solarized-dark",
      });
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      assert.include(html, "background:#002b36");
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
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Numbered headings
      assert.include(html, "<style>body");
      // Code copy
      assert.include(html, "<textarea id=");
      assert.include(html, "<script>/*!"); // clipboard.js
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
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Page should not include CSS external link
      assert.notInclude(html, 'link rel="stylesheet" href="');
      // Page should include Mermaid from CDN
      assert.include(html, `script src="${LIBRARIES.mermaid}`);
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
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      // Page should not include CSS external link
      assert.notInclude(html, 'link rel="stylesheet" href="');
      // Page should include Mermaid from CDN
      assert.include(html, `script src="${LIBRARIES.mermaid}`);
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
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
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
        theme: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should use a custom layout, theme and highlight style (URL)", async () => {
      const proc = new Processor({
        layout: `${github}/GaelGirodon/markdown-to-document/develop/assets/layouts/page.html`,
        theme: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
    });
    it("should fail if the custom layout doesn't exist (local file)", async () => {
      const proc = new Processor({
        layout: buildPath("assets/layouts/unknown.html"),
        theme: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      let throws = false;
      try {
        await proc.process([buildDataPath("README.md")]);
      } catch (err) {
        throws = true;
      }
      assert.isTrue(throws);
    });
    it("should fail if the custom layout doesn't exist (URL)", async () => {
      const proc = new Processor({
        layout: `${github}/GaelGirodon/markdown-to-document/develop/assets/layouts/unknown.html`,
        theme: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        highlightStyle: `${github}/highlightjs/highlight.js/main/src/styles/monokai.css`,
        numberedHeadings: true,
        codeCopy: true,
        embedMode: "full",
      });
      let throws = false;
      try {
        await proc.process([buildDataPath("README.md")]);
      } catch (err) {
        throws = true;
      }
      assert.isTrue(throws);
    });
  });

  describe('mdtodoc doc.md -l "page" --extension "ext.js"', () => {
    it("should compile a Markdown file and apply extension", async () => {
      const proc = new Processor({
        layout: "page",
        extension: [buildDataPath("extension/valid.js")],
      });
      const src = buildDataPath("README.md");
      const dst = buildDataPath("README.html");
      await proc.process([src]);
      assert.isTrue(await files.exists(dst));
      const html = await files.readAllText(dst);
      assert.include(html, " + preCompile + postInit + preRender + preInline + preWrite</title>");
    });
  });

  describe("mdtodoc **/*.md --join", () => {
    it("should join and compile files", async () => {
      const proc = new Processor({ join: true });
      const src = buildDataPath("join");
      const dstMd = buildDataPath("join/MERGED.md");
      const dst = buildDataPath("join/MERGED.html");
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
