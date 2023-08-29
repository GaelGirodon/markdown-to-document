import { assert } from "chai";
import { format as _ } from "node:util";

import { getHtmlTagText, randomId } from "../src/util.js";

describe("randomId", () => {
  it("should return a random id", async () => {
    assert.isTrue(/_\w{9}/.test(randomId()));
  });
});

describe("getHtmlTagText", () => {
  for (const t of [
    { html: undefined, tag: undefined, text: null },
    { html: "<body><h1>title</h1></body>", tag: "h2", text: null },
    { html: "<body><h1>title</h1></body>", tag: "h1", text: "title" },
    { html: '<body><h1 class="title">title</h1></body>', tag: "h1", text: "title" },
    { html: "<body><h1>the <em>title</em></h1></body>", tag: "h1", text: "the title" },
    { html: "<body><h1>the \n<em> title </em> </h1></body>", tag: "h1", text: "the title" },
    { html: '<body><h1>the <em class="c">title</em></h1></body>', tag: "h1", text: "the title" },
  ]) {
    it(_("should return %O for tag %O in %O", t.text, t.tag, t.html), () => {
      assert.equal(getHtmlTagText(t.html, t.tag), t.text);
    });
  }
});
