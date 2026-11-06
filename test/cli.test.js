import { assert, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";

import * as files from "../src/files.js";
import { buildPath, runCli } from "./util.js";

vi.mock(import("chokidar"));

describe("CLI", () => {
  describe("mdtodoc", () => {
    it("should fail without argument", async () => {
      const { stdout, stderr, error } = await runCli();
      assert.equal(error?.exitCode, 1);
      assert.isEmpty(stdout);
      assert.include(stderr, "missing required argument");
    });
  });

  describe("mdtodoc -h/--help", () => {
    it("should display help (-h)", async () => {
      const { stdout } = await runCli("-h");
      assert.include(stdout, "Usage");
    });
    it("should display help (--help)", async () => {
      const { stdout } = await runCli("--help");
      assert.include(stdout, "Usage");
    });
  });

  describe("mdtodoc -V/--version", () => {
    it("should output the version number (-V)", async () => {
      const { stdout } = await runCli("-V");
      assert.match(stdout, /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
    it("should output the version number (--version)", async () => {
      const { stdout } = await runCli("--version");
      assert.match(stdout, /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a Markdown file", async () => {
      const src = buildPath("CHANGELOG.md");
      const dst = buildPath("CHANGELOG.html");
      const spy = vi.spyOn(console, "log");
      await runCli(src);
      expect(spy).toHaveBeenCalledExactlyOnceWith(`${src} -> ${src.replace(/.md$/, ".html")}`);
      assert.isTrue(await files.exists(dst));
      await fs.unlink(dst);
    });
    it("should handle errors", async () => {
      const src = buildPath("LICENSE");
      const { stdout, stderr, error } = await runCli(src);
      assert.equal(error?.exitCode, 1);
      assert.isEmpty(stdout);
      assert.include(stderr, "Error:");
    });
  });

  describe("mdtodoc doc.md --watch", () => {
    it("should watch a Markdown file", async () => {
      const src = buildPath("CHANGELOG.md");
      const spy = vi.spyOn(console, "log");
      await runCli(src, "--watch");
      expect(spy).toHaveBeenCalledExactlyOnceWith(`[watch] ${src}`);
    });
  });
});
