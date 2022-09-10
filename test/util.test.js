import { assert } from "chai";
import { randomId } from "../src/util.js";

describe("randomId", () => {
  it("should return a random id", async () => {
    assert.isTrue(/_\w{9}/.test(randomId()));
  });
});
