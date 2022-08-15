import { assert } from "chai";
import { Extensions } from "../src/extension.js";
import { buildPath } from "./util.js";

describe("Extensions", () => {
  describe("init", () => {
    it("should succeed on valid extension", async () => {
      const ext = new Extensions([buildPath("test/data/extension/valid.js")]);
      await ext.init().then(
        () => {},
        (e) => assert.fail(e)
      );
    });
    it("should throw on file not found or not readable", async () => {
      const ext = new Extensions([buildPath("notfound.js")]);
      await ext.init().then(
        () => assert.fail("Expected an error"),
        () => {}
      );
    });
    it("should throw on invalid ES Module", async () => {
      const ext = new Extensions([buildPath("CHANGELOG.md")]);
      await ext.init().then(
        () => assert.fail("Expected an error"),
        () => {}
      );
    });
  });

  describe("exec", async () => {
    let ext;
    before(async () => {
      ext = new Extensions([buildPath("test/data/extension/invalid.js")]);
      await ext.init();
    });

    it("should succeed on valid extension function", async () => {
      const input = { title: "Title" };
      const output = await ext.exec("valid", input);
      assert.equal(output, input);
    });
    it("should ignore when extension function doesn't exist", async () => {
      await ext.exec("notExists", {});
    });
    it("should ignore when extension item is not a function", async () => {
      await ext.exec("notAFunction", {});
    });
    it("should throw when extension function throws", async () => {
      await ext.exec("functionThrows", {}).then(
        () => assert.fail("Expected an error"),
        () => {}
      );
    });
    it("should throw when extension function returns nothing", async () => {
      await ext.exec("returnsNothing", {}).then(
        () => assert.fail("Expected an error"),
        () => {}
      );
    });
    it("should throw when extension function returns an invalid object", async () => {
      await ext.exec("returnsNothing", { key: "value" }).then(
        () => assert.fail("Expected an error"),
        () => {}
      );
    });
  });
});
