const assert = require("chai").assert;
const { randomId } = require("../src/util");

describe("randomId", () => {
  it("should return a random id", async () => {
    assert.isTrue(/_\w{9}/.test(randomId()));
  });
});
