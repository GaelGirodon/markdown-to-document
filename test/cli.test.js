const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const { exec } = require("child_process");
const execAsync = Promise.promisify(exec);
const assert = require("chai").assert;

const files = require("../src/files");
const { buildPath } = require("./util");

const cli = buildPath("src/cli.js");

describe("CLI", () => {
  describe("mdtodoc", () => {
    it("should display help (no arg)", async () => {
      const stdout = await execAsync(`node ${cli}`);
      assert.include(stdout.toString(), "Usage");
    });
  });

  describe("mdtodoc -h/--help", () => {
    it("should display help (-h)", async () => {
      const stdout = await execAsync(`node ${cli} -h`);
      assert.include(stdout.toString(), "Usage");
    });
    it("should display help (--help)", async () => {
      const stdout = await execAsync(`node ${cli} --help`);
      assert.include(stdout.toString(), "Usage");
    });
  });

  describe("mdtodoc -V/--version", () => {
    it("should output the version number (-V)", async () => {
      const stdout = await execAsync(`node ${cli} -V`);
      assert.match(stdout.toString(), /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
    it("should output the version number (--version)", async () => {
      const stdout = await execAsync(`node ${cli} --version`);
      assert.match(stdout.toString(), /[0-9]+\.[0-9]+\.[0-9]+/g);
    });
  });

  describe("mdtodoc doc.md", () => {
    it("should compile a Markdown file", async () => {
      const src = buildPath("README.md");
      const dst = buildPath("README.html");
      const stdout = await execAsync(`node ${cli} ${src}`);
      assert.include(stdout.toString(), "README.html");
      assert.isTrue(await files.exists(dst));
      await fs.unlinkAsync(dst);
    });
  });
});
