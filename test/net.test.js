import { assert } from "chai";

import { fetchText } from "../src/net.js";

describe("fetchText", () => {
  it("should return a text from the web", async () => {
    try {
      const text = await fetchText(
        "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/master/README.md"
      );
      assert.isString(text);
      assert.isNotEmpty(text);
    } catch (e) {
      assert.fail("should not throw");
    }
  });
  it("should fail if the URL is invalid", async () => {
    let error;
    try {
      await fetchText("this!is-not*a°valid#URL");
    } catch (e) {
      error = e;
    }
    assert.exists(error);
    assert.match(error.message, /^an error occurred fetching content \(.+\)$/);
  });
  it("should fail if response is not 200 OK", async () => {
    let error;
    try {
      await fetchText(
        "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/master/NOTFOUND.md"
      );
    } catch (e) {
      error = e;
    }
    assert.exists(error);
    assert.match(error.message, /^an error occurred fetching content \(.+\)$/);
  });
  it("should return an empty text without error if failIfEmpty is false", async () => {
    try {
      const text = await fetchText(
        "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/0.2.0/assets/themes/.gitkeep"
      );
      assert.isString(text);
      assert.isEmpty(text);
    } catch (e) {
      assert.fail("should not throw");
    }
  });
  it("should fail with an empty text if failIfEmpty is true", async () => {
    let error;
    try {
      await fetchText(
        "https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/0.2.0/assets/themes/.gitkeep",
        true
      );
    } catch (e) {
      error = e;
    }
    assert.exists(error);
    assert.match(error.message, /^content is empty$/);
  });
});
