import { assert } from "chai";
import fsp from "fs/promises";
import { resolve } from "path";

import * as files from "../src/files.js";
import { buildDataPath } from "./util.js";

describe("files", () => {
  describe("exists", () => {
    it("should return true if the file exists", async () => {
      assert.isTrue(await files.exists(buildDataPath("README.md")));
    });
    it("should return false if the file doesn't exist", async () => {
      assert.isFalse(await files.exists(buildDataPath("UNKNOWN.md")));
    });
  });

  describe("isDirectory", () => {
    it("should return true if the path is a directory", async () => {
      assert.isTrue(await files.isDirectory(buildDataPath("join")));
    });
    it("should return false if the path is not a directory", async () => {
      assert.isFalse(await files.isDirectory(buildDataPath("README.md")));
    });
  });

  describe("isReadable", () => {
    it("should return true if the file is readable", async () => {
      assert.isTrue(await files.isReadable(buildDataPath("README.md")));
    });
    it("should return false if the file is not readable", async () => {
      assert.isFalse(await files.isReadable(buildDataPath("UNKNOWN.md")));
    });
  });

  describe("isRemote", () => {
    it("should return true if the path is a remote resource", () => {
      assert.isTrue(files.isRemote("http://localhost/index.html"));
      assert.isTrue(files.isRemote("https://localhost/index.html"));
      assert.isTrue(files.isRemote("//network/resource"));
    });
    it("should return false if the file is a local resource", () => {
      assert.isFalse(files.isRemote("C:\\data\\test"));
      assert.isFalse(files.isRemote("/home/user/test"));
    });
  });

  describe("localToUrl", () => {
    it("should transform a local absolute path to an URL", () => {
      assert.equal(files.localToUrl("/path/assets/file.ext", "/path/"), "assets/file.ext");
    });
  });

  describe("resolveModuleDirectory", () => {
    it("should resolve the path to the directory of a module", () => {
      assert.equal(files.resolveModuleDirectory("clipboard"), resolve("node_modules", "clipboard"));
    });
  });

  describe("readAllText", () => {
    it("should read the content of a text file", async () => {
      const content = await files.readAllText(buildDataPath("README.md"));
      assert.isNotEmpty(content);
    });
  });

  describe("writeAllText", () => {
    it("should write a content to a text file", async () => {
      await files.writeAllText(buildDataPath("TEST.txt"), "test");
      await fsp.unlink(buildDataPath("TEST.txt"));
    });
  });
});
