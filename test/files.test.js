const assert = require("chai").assert;
const fsp = require("fs/promises");
const files = require("../src/files");
const { buildPath } = require("./util");

describe("files", () => {
  describe("exists", () => {
    it("should return true if the file exists", async () => {
      assert.isTrue(await files.exists(buildPath("README.md")));
    });
    it("should return false if the file doesn't exist", async () => {
      assert.isFalse(await files.exists(buildPath("UNKNOWN.md")));
    });
  });

  describe("isDirectory", () => {
    it("should return true if the path is a directory", async () => {
      assert.isTrue(await files.isDirectory(buildPath("src")));
    });
    it("should return false if the path is not a directory", async () => {
      assert.isFalse(await files.isDirectory(buildPath("README.md")));
    });
  });

  describe("isReadable", () => {
    it("should return true if the file is readable", async () => {
      assert.isTrue(await files.isReadable(buildPath("README.md")));
    });
    it("should return false if the file is not readable", async () => {
      assert.isFalse(await files.isReadable(buildPath("UNKNOWN.md")));
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

  describe("readAllText", () => {
    it("should read the content of a text file", async () => {
      const content = await files.readAllText(buildPath("README.md"));
      assert.isNotEmpty(content);
    });
  });

  describe("writeAllText", () => {
    it("should write a content to a text file", async () => {
      await files.writeAllText(buildPath("TEST.txt"), "test");
      await fsp.unlink(buildPath("TEST.txt"));
    });
  });
});
